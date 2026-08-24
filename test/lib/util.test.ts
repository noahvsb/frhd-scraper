import { checkResponse, getIds, rangeArray } from '@/util';
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
  })
});