import { checkResponse, compressCode, decompressCode, getIds, rangeArray } from '@/util';
import { describe, expect, it } from 'bun:test';

describe('utils', () => {
  describe('checkResponse', () => {
    const successfulResponse: any = {
      ok: true,
    }
    const unsuccessfulResponse: any = {
      ok: false,
      status: 404,
      statusText: 'Not Found',
    }
    it('don\'t throw on successful response', () => {
      expect(() => checkResponse(successfulResponse)).not.toThrow();
    });
    it('throw on unsuccessful response', () => {
      expect(() => checkResponse(unsuccessfulResponse)).toThrow('404 Not Found');
    });
  });

  describe('getIds', () => {
    it('community classics', () => {
      expect(getIds('cc')).toEqual(rangeArray(1001, 11106));
    });
    it('all', () => {
      expect(getIds('all')).toEqual([...rangeArray(1001, 11106), ...rangeArray(50001, 1100000)]);
    });
  });


  describe('(de)compressCode', () => {
    const code = '-18 1i 18 1i,-18 1i -18 -u 18 -u 18 1i##T -u -k,T u -k,T u 18,T -u 18';

    it('successfully compress and decompress track code', async () => {
      const compressed = await compressCode(code);
      expect(typeof compressed).toBe('string');
      expect(decompressCode(compressed)).resolves.toEqual(code);
    });
  });
});