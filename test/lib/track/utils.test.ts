import { afterAll, beforeEach, describe, expect, it, spyOn, type Mock } from 'bun:test';
import { fetchTrack, getCdnUrlAndTrackStats, TrackData, writeTrackData } from '@/track/util';
import { mkdir, readFile, rm } from 'node:fs/promises';
import { createOptions } from '../../test-utils';
import { decompressCode } from '@/util';
import { mockCdnUrl, mockTrackFetch } from '../../mocks/track';

describe('track utils', () => {
  let fetchSpy: Mock<typeof fetch>;

  beforeEach(() => {
    fetchSpy = spyOn(global, 'fetch').mockImplementation(<typeof fetch> mockTrackFetch);
  });

  afterAll(() => {
    fetchSpy.mockRestore();
  });

  describe('getCdnUrlAndTrackStats', () => {
    it('success', async () => {
      expect(getCdnUrlAndTrackStats(52143)).resolves.toEqual({ cdnUrl: mockCdnUrl, trackStats: {
        upVotes: '23.0k',
        downVotes: '3.7k',
        plays: '45.4m',
        runs: 8180695,
        firstRuns: '5.0m',
        avgTime: '67910:39.57',
        completionRate: 0.92
      }});
    });
  });

  describe('fetchTrack', () => {
    it('success', async () => {
      const result = await fetchTrack(52143, createOptions());

      expect(result).toEqual({
        id: 52143,
        title: 'Strat\'s Intro',
        desc: expect.any(String),
        vehicles: expect.any(Array<String>),
        authorId: expect.any(Number),
        author: expect.any(String),
        featured: expect.any(Boolean),
        code: expect.any(String),
        compressed: true,
        trackStats: expect.any(Object),
      });

      expect(decompressCode(result.code)).resolves.toEqual('-18 1i 18 1i,-18 1i -18 -u 18 -u 18 1i##T -u -k,T u -k,T u 18,T -u 18');
    });

    it('success without compression', async () => {
      expect(fetchTrack(52143, createOptions({ compress: false }))).resolves.toEqual({
        id: 52143,
        title: 'Strat\'s Intro',
        desc: expect.any(String),
        vehicles: expect.any(Array<String>),
        authorId: expect.any(Number),
        author: expect.any(String),
        featured: expect.any(Boolean),
        code: '-18 1i 18 1i,-18 1i -18 -u 18 -u 18 1i##T -u -k,T u -k,T u 18,T -u 18',
        compressed: false,
        trackStats: expect.any(Object),
      });
    });
  });

  describe('writeTrackData', () => {
    const mockTrackData: TrackData = {
      id: 1,
      title: 'mock title',
      desc: 'mock desc',
      vehicles: ['BMX'],
      authorId: 0,
      author: 'mock author',
      featured: true,
      code: 'H4sIAAAAAAAAA9M1tFAwzFQAkzq6EA6I0i1VgJOGmcrKISC2brZOiAKcMrTQCYGoAABbQ59aRQAAAA==',
      compressed: true,
      trackStats: <any> {},
    };

    it('writes mock track data', async () => {
      const options = createOptions({ path: 'test/data/track' });

      await mkdir(options.path, { recursive: true });

      await writeTrackData(mockTrackData, options);

      const written = await readFile(`${options.path}/1.json`, 'utf-8');
      expect(JSON.parse(written)).toEqual(mockTrackData);

      // clean up
      await rm(options.path, { recursive: true });
    });
  });
});