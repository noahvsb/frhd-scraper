import { afterAll, beforeEach, describe, expect, it, spyOn, type Mock } from 'bun:test';
import { fetchTrack, getCdnUrlAndTrackStats, TrackData, writeTrackData } from '@/track/util';
import { mkdir, readFile, rm } from 'node:fs/promises';
import { createOptions } from '../../test-utils';
import { decompressCode } from '@/util';

describe('track utils', () => {
  const mockCdnUrl = 'https://cdn.freeriderhd.com/free_rider_hd/tracks/prd/b/8c/1001/track-data-v1.js';
  const mockAjaxJson = {
    track: {
      cdn: mockCdnUrl,
    },
    track_stats: {
      up_votes: 296,
      dwn_votes: 72,
      plays: '106.6k',
      runs: 869,
      frst_runs: 263,
      avg_time: '25:37.40',
      cmpltn_rate: 0.03
    },
  };

  const mockTrackJson = {
    id: 1001,
    title: 'Wild West',
    descr: 'Wild West is a Free Rider community classic track by weewam.',
    vehicles: ['BMX', 'MTB'],
    u_id: 1001,
    author: 'weewam',
    code: '-18 1i 18 1i,-18 1i -18 -u 18 -u 18 1i##T -u -k,T u -k,T u 18,T -u 18',
  };

  function makeResponse(init: { ok?: boolean; status?: number; statusText?: string, json?: () => any; text?: () => any }): Response {
    return {
      ok: init.ok ?? true,
      status: init.status ?? 200,
      statusText: init.ok ? 'OK' : 'Internal Server Error',
      json: async () => (init.json ? init.json() : undefined),
      text: async () => (init.text ? init.text() : ''),
    } as unknown as Response;
  }

  let fetchSpy: Mock<typeof fetch>;

  beforeEach(() => {
    fetchSpy = spyOn(global, 'fetch').mockImplementation(<typeof fetch> (async (input) => {
      const url = input.toString();

      if (url.startsWith('https://www.freeriderhd.com/t/')) {
        return makeResponse({ json: () => mockAjaxJson });
      }

      if (url === mockCdnUrl) {
        return makeResponse({ text: () => `t(${JSON.stringify(mockTrackJson)})` });
      }

      throw new Error(`Unmocked fetch call: ${url}`);
    }));
  });

  afterAll(() => {
    fetchSpy.mockRestore();
  });

  describe('getCdnUrlAndTrackStats', () => {
    it('success', async () => {
      expect(getCdnUrlAndTrackStats(1001)).resolves.toEqual({ cdnUrl: mockCdnUrl, trackStats: {
        upVotes: 296,
        downVotes: 72,
        plays: '106.6k',
        runs: 869,
        firstRuns: 263,
        avgTime: '25:37.40',
        completionRate: 0.03,
      }});
    });
  });

  describe('fetchTrack', () => {
    it('success', async () => {
      const result = await fetchTrack(1001, createOptions());

      expect(result).toEqual({
        id: 1001,
        title: 'Wild West',
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
      expect(fetchTrack(1001, createOptions({ compress: false }))).resolves.toEqual({
        id: 1001,
        title: 'Wild West',
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