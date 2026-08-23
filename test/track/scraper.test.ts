import { describe, expect, it, beforeEach, afterEach, spyOn, type Mock } from 'bun:test';
import { scrapeTracks } from '@/track/scraper';
import { rangeArray } from '@/util';
import { readFile, rm } from 'node:fs/promises';
import { createOptions } from '../test-utils';

describe('scrapeTracks', () => {
  const mockCdnUrl = (id: number) => `https://cdn.example.com/track/${id}.js`;

  const mockTrackJson = (id: number) => ({
    id,
    title: `track-${id}`,
    descr: `desc for ${id}`,
    vehicles: ['BMX'],
    author: 'mock author',
    featured: false,
    code: '-18 1i 18 1i,-18 1i -18 -u 18 -u 18 1i##T -u -k,T u -k,T u 18,T -u 18',
  });

  function makeResponse(init: { ok?: boolean; status?: number; json?: () => any; text?: () => any }): Response {
    return {
      ok: init.ok ?? true,
      status: init.status ?? 200,
        statusText: init.ok ? 'OK' : 'Internal Server Error',
      json: async () => (init.json ? init.json() : undefined),
      text: async () => (init.text ? init.text() : ''),
    } as unknown as Response;
  }

  let fetchSpy: Mock<typeof fetch>;
  let consoleErrorSpy: Mock<typeof console.error>;
  let failingIds: Set<number>;

  beforeEach(() => {
    failingIds = new Set();

    fetchSpy = spyOn(global, 'fetch').mockImplementation(<typeof fetch> (async (input) => {
      const url = input.toString();

      const trackMatch = url.match(/\/t\/(\d+)\?ajax=true/);
      if (trackMatch) {
        const id = Number(trackMatch[1]);
        if (failingIds.has(id)) {
          return makeResponse({ ok: false, status: 500 });
        }
        return makeResponse({ json: () => ({ track: { cdn: mockCdnUrl(id) } }) });
      }

      const cdnMatch = url.match(/\/track\/(\d+)\.js$/);
      if (cdnMatch) {
        const id = Number(cdnMatch[1]);
        return makeResponse({ text: () => `t(${JSON.stringify(mockTrackJson(id))})` });
      }

      throw new Error(`Unmocked fetch call: ${url}`);
    }));

    consoleErrorSpy = spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(async () => {
    fetchSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    await rm('test/scraper-data', { recursive: true, force: true });
  });

  it('success', async () => {
    const options = createOptions({ ids: { start: 1, end: 3 }, path: 'test/scraper-data' });

    await scrapeTracks(options);

    for (const id of [1, 2, 3]) {
      const written = JSON.parse(await readFile(`test/scraper-data/${id}.json`, 'utf-8'));
      expect(written).toMatchObject({ id, title: `track-${id}` });
    }
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('success on empty list', async () => {
    const options = createOptions({ ids: { start: 1, end: 0 }, path: 'test/scraper-data' });

    await scrapeTracks(options);

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('2 successes, 1 failure', async () => {
    failingIds.add(2);
    const options = createOptions({ ids: { start: 1, end: 3 }, path: 'test/scraper-data' });

    await scrapeTracks(options);

    await expect(readFile('test/scraper-data/1.json', 'utf-8')).resolves.toBeTruthy();
    await expect(readFile('test/scraper-data/2.json', 'utf-8')).rejects.toThrow();
    await expect(readFile('test/scraper-data/3.json', 'utf-8')).resolves.toBeTruthy();

    expect(consoleErrorSpy).toHaveBeenCalledWith('Failure to scrape these tracks:');
    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('2 - '));
  });

  it('1 success, 2 failures', async () => {
    failingIds.add(1);
    failingIds.add(3);
    const options = createOptions({ ids: { start: 1, end: 3 }, path: 'test/scraper-data' });

    await scrapeTracks(options);

    const failureLines = consoleErrorSpy.mock.calls
      .map((call) => call[0])
      .filter((line) => typeof line === 'string' && line.startsWith('1 -') || (line as string)?.startsWith('3 -'));

    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('1 - '));
    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('3 - '));
  });

  it('no progress bar for coverage', async () => {
    const options = createOptions({ ids: { start: 1, end: 3 }, path: 'test/scraper-data', progressBar: false });

    await expect(scrapeTracks(options)).resolves.toBeUndefined();
  });

  it('larger queue than the concurrency limit (10 workers)', async () => {
    const options = createOptions({ ids: { start: 1, end: 37 }, path: 'test/scraper-data' });

    await scrapeTracks(options);

    for (const id of rangeArray(1, 37)) {
      const written = JSON.parse(await readFile(`test/scraper-data/${id}.json`, 'utf-8'));
      expect(written.id).toEqual(id);
    }
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });
});