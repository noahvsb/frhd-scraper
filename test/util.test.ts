import { checkResponse, getIds, rangeArray } from '@/util';
import { describe, expect, it } from '@jest/globals';

describe('utils', () => {
  describe('checkResponse', () => {
    const successfulResponse: any = {
      ok: true,
    }
    const unsuccessfulResponse: any = {
      ok: false,
      status: 404,
      statusText: 'not found',
    }
    it('don\'t throw on successful response', () => {
      expect(() => checkResponse(successfulResponse)).not.toThrow();
    });
    it('throw on unsuccessful response', () => {
      expect(() => checkResponse(unsuccessfulResponse)).toThrow('404: not found');
    });
  });

  describe('getIds', () => {
    it('community classics', () => {
      expect(getIds('cc')).toEqual(rangeArray(1001, 11106));
    });
    it('all', () => {
      expect(getIds('all')).toEqual([...rangeArray(1001, 11106), ...rangeArray(50001, 1100000)]);
    });
    it('slice', () => {
      expect(getIds({ start: 4, end: 8 })).toEqual(rangeArray(4, 8));
    });
  })
});