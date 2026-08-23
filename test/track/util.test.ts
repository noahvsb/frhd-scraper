import { describe, expect, it } from '@jest/globals';
import { compressCode, decompressCode, fetchTrack, getCdnUrl, TrackData, writeTrackData } from '@/track/util';
import { readFile, rm } from 'node:fs/promises';
import { createOptions } from '@/util';

describe('track utils', () => {
  describe('getCdnUrl', () => {
    it('fetches the cdn URL of Wild West', async () => {
      await expect(getCdnUrl(1001)).resolves.toEqual('https://cdn.freeriderhd.com/free_rider_hd/tracks/prd/b/8c/1001/track-data-v1.js');
    });
  });

  describe('fetchTrack', () => {
    it('fetches the track data of Wild West', async () => {
      await expect(fetchTrack(1001)).resolves.toEqual({
        id: 1001,
        title: 'Wild West',
        desc: expect.any(String),
        vehicles: expect.any(Array<String>),
        author: expect.any(String),
        featured: expect.any(Boolean),
        code: expect.any(String),
        compressed: expect.any(Boolean),
      })
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
      await writeTrackData(mockTrackData, createOptions({ path: 'test/data' }));

      const written = await readFile('test/data/1.json', 'utf-8');
      expect(JSON.parse(written)).toEqual(mockTrackData);

      // clean up
      await rm('test/data', { recursive: true });
    });
  });

  describe('(de)compressCode', () => {
    const code = '-18 1i 18 1i,-18 1i -18 -u 18 -u 18 1i##T -u -k,T u -k,T u 18,T -u 18';
    const compressed = 'H4sIAAAAAAAAA9M1tFAwzFQAkzq6EA6I0i1VgJOGmcrKISC2brZOiAKcMrTQCYGoAABbQ59aRQAAAA==';

    it('compressCode', async () => {
      expect(compressCode(code)).toEqual(compressed);
    });

    it('decompressCode', async () => {
      expect(decompressCode(compressed)).toEqual(code);
    });
  });
});