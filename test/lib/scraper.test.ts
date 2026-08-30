import { describe, expect, it, beforeEach, afterEach, spyOn, type Mock, mock } from 'bun:test';
import { rangeArray } from '@/util';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createOptions } from '../test-utils';
import { scrape } from '@/scraper';
import { mockLeaderboardFetch } from '../mocks/leaderboard';
import { makeResponse } from '../mocks/makeResponse';

describe('scrape', () => {
  const testPath = 'test/data';

  const mockCdnUrl = (id: number) => `https://cdn.example.com/track/${id}.js`;
  const mockAjaxJson = (id: number) => ({
    track: {
      cdn: mockCdnUrl(id),
    },
    track_stats: {
      up_votes: '23.0k',
      dwn_votes: '3.7k',
      plays: '45.4m',
      runs: 8180695,
      frst_runs: '5.0m',
      avg_time: '67910:39.57',
      cmpltn_rate: 0.92
    },
  });

  const mockTrackJson = (id: number) => ({
    id,
    title: `track-${id}`,
    descr: `desc for ${id}`,
    vehicles: ['BMX'],
    author: 'mock author',
    featured: false,
    code: '-18 1i 18 1i,-18 1i -18 -u 18 -u 18 1i##T -u -k,T u -k,T u 18,T -u 18',
  });

  // Pre-creates a track's output file so scrape treats it as already-scraped (skipped).
  const skipTrackIds = async (...ids: number[]) => {
    await mkdir(testPath, { recursive: true });
    for (const id of ids) {
      await writeFile(`${testPath}/${id}.json`, 'hello world');
    }
  };

  let fetchSpy: Mock<typeof fetch>;
  let consoleLogSpy: Mock<typeof console.log>;
  let consoleErrorSpy: Mock<typeof console.error>;
  let failingIds: Set<number>;
  let notFoundIds: Set<number>;

  beforeEach(() => {
    failingIds = new Set();
    notFoundIds = new Set();

    fetchSpy = spyOn(global, 'fetch').mockImplementation(<typeof fetch> (async (input) => {
      const url = input.toString();

      const trackMatch = url.match(/\/t\/(\d+)\?ajax=true/);
      if (trackMatch) {
        const id = Number(trackMatch[1]);
        if (failingIds.has(id)) {
          return makeResponse({ ok: false, status: 500 });
        }
        if (notFoundIds.has(id)) {
          return makeResponse({ ok: false, status: 404 });
        }
        return makeResponse({ json: () => mockAjaxJson(id) });
      }

      const cdnMatch = url.match(/\/track\/(\d+)\.js$/);
      if (cdnMatch) {
        const id = Number(cdnMatch[1]);
        return makeResponse({ text: () => `t(${JSON.stringify(mockTrackJson(id))})` });
      }

      throw new Error(`Unmocked fetch call: ${url}`);
    }));

    consoleLogSpy = spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(async () => {
    fetchSpy.mockRestore();
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    await rm(testPath, { recursive: true, force: true });
  });

  it('success', async () => {
    const options = createOptions({ ids: [1,2,3], path: testPath });

    await scrape('track', options);

    for (const id of [1, 2, 3]) {
      const written = JSON.parse(await readFile(`${testPath}/${id}.json`, 'utf-8'));
      expect(written).toMatchObject({ id, title: `track-${id}` });
    }
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('success on empty list', async () => {
    const options = createOptions({ ids: [], path: testPath });

    await scrape('track', options);

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('1 failure', async () => {
    failingIds.add(2);
    const options = createOptions({ ids: [1,2,3], path: testPath });

    await scrape('track', options);

    expect(readFile(`${testPath}/1.json`, 'utf-8')).resolves.toBeTruthy();
    expect(readFile(`${testPath}/2.json`, 'utf-8')).rejects.toThrow();
    expect(readFile(`${testPath}/3.json`, 'utf-8')).resolves.toBeTruthy();

    expect(consoleLogSpy).toHaveBeenCalledWith('Did not scrape 1 track:');
    expect(consoleErrorSpy).toHaveBeenCalledWith('id = 2 - Error: 500 Internal Server Error');
  });

  it('1 failure, 1 not found, 1 skipped', async () => {
    failingIds.add(1);
    notFoundIds.add(3);
    await skipTrackIds(4);
    const options = createOptions({ ids: [1,2,3,4], path: testPath });

    await scrape('track', options);

    expect(consoleErrorSpy).toHaveBeenCalledWith('id = 1 - Error: 500 Internal Server Error');
    expect(consoleErrorSpy).toHaveBeenCalledWith('1 track was not found');
    expect(consoleLogSpy).toHaveBeenCalledWith('1 track was skipped');
  });

  it('2 not found', async () => {
    notFoundIds.add(1);
    notFoundIds.add(3);
    const options = createOptions({ ids: [1,2,3], path: testPath });

    await scrape('track', options);

    expect(consoleErrorSpy).toHaveBeenCalledWith('2 tracks were not found');
  });

  it('2 skipped', async () => {
    await skipTrackIds(1, 3);
    const options = createOptions({ ids: [1,2,3], path: testPath });

    await scrape('track', options);

    expect(readFile(`${testPath}/2.json`, 'utf-8')).resolves.toBeTruthy();
    expect(consoleLogSpy).toHaveBeenCalledWith('2 tracks were skipped');
  });

  it('no progress bar for coverage', async () => {
    const options = createOptions({ ids: [1,2,3], path: testPath, progressBar: false });

    expect(scrape('track', options)).resolves.toBeUndefined();
  });

  it('larger queue than the concurrency limit (10 workers)', async () => {
    const options = createOptions({ ids: rangeArray(1, 37), path: testPath });

    await scrape('track', options);

    for (const id of rangeArray(1, 37)) {
      const written = JSON.parse(await readFile(`${testPath}/${id}.json`, 'utf-8'));
      expect(written.id).toEqual(id);
    }
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('scrape leaderboard', async () => {
    fetchSpy.mockImplementation(<typeof fetch> mockLeaderboardFetch);

    const options = createOptions({ ids: [52143], path: testPath });

    await scrape('leaderboard', options);

    const written = JSON.parse(await readFile(`${testPath}/52143.json`, 'utf-8'));
    expect(written).toMatchObject({ id: 52143, leaderboard: expect.any(Array) });
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });
});