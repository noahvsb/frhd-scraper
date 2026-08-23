import { afterAll, beforeEach, describe, expect, it, spyOn, type Mock } from 'bun:test';
import { compressCode, decompressCode, fetchTrack, getCdnUrl, TrackData, writeTrackData } from '@/track/util';
import { readFile, rm } from 'node:fs/promises';
import { createOptions } from '../test-utils';

describe('track utils', () => {
  const mockCdnUrl = 'https://cdn.freeriderhd.com/free_rider_hd/tracks/prd/b/8c/1001/track-data-v1.js';

  const mockTrackJson = {
    id: 1001,
    title: 'Wild West',
    descr: 'Wild West is a Free Rider community classic track by weewam.',
    vehicles: ['BMX', 'MTB'],
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
        return makeResponse({ json: () => ({ track: { cdn: mockCdnUrl } }) });
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

  describe('getCdnUrl', () => {
    it('success', async () => {
      await expect(getCdnUrl(1001)).resolves.toEqual(mockCdnUrl);
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
        author: expect.any(String),
        featured: expect.any(Boolean),
        code: expect.any(String),
        compressed: true,
      });

      expect(decompressCode(result.code)).toEqual('-18 1i 18 1i,-18 1i -18 -u 18 -u 18 1i##T -u -k,T u -k,T u 18,T -u 18');
    });

    it('success without compression', async () => {
      await expect(fetchTrack(1001, createOptions({ compress: false }))).resolves.toEqual({
        id: 1001,
        title: 'Wild West',
        desc: expect.any(String),
        vehicles: expect.any(Array<String>),
        author: expect.any(String),
        featured: expect.any(Boolean),
        code: '-18 1i 18 1i,-18 1i -18 -u 18 -u 18 1i##T -u -k,T u -k,T u 18,T -u 18',
        compressed: false,
      });
    });
  });

  describe('writeTrackData', () => {
    const mockTrackData: TrackData = {
      id: 1,
      title: 'mock title',
      desc: 'mock desc',
      vehicles: ['BMX'],
      author: 'mock author',
      featured: true,
      code: 'H4sIAAAAAAAAA9M1tFAwzFQAkzq6EA6I0i1VgJOGmcrKISC2brZOiAKcMrTQCYGoAABbQ59aRQAAAA==',
      compressed: true,
    };

    it('writes mock track data', async () => {
      await writeTrackData(mockTrackData, createOptions());

      const written = await readFile('data/1.json', 'utf-8');
      expect(JSON.parse(written)).toEqual(mockTrackData);

      // clean up
      await rm('data', { recursive: true });
    });
  });

  describe('(de)compressCode', () => {
    const code = '-18 1i 18 1i,-18 1i -18 -u 18 -u 18 1i##T -u -k,T u -k,T u 18,T -u 18';

    it('successfully compress and decompress track code', async () => {
      const compressed = compressCode(code);
      expect(typeof compressed).toBe('string');
      expect(decompressCode(compressed)).toEqual(code);
    });
  });
});