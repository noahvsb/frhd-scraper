import { checkResponse } from '@/util';
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
});