import { describe, expect, it, mock } from 'bun:test';
import { processArguments } from '@/args';
import { rangeArray } from '@/util';

describe('args', () => {
  const ccIds = rangeArray(1001, 11106);
  const allIds = [...ccIds, ...rangeArray(50001, 1100000)];

  function runArgs(...args: string[]) {
    return processArguments(['node', 'scraper', ...args]);
  }

  describe('commands', () => {
    it('parses track command successfully', () => {
      
      const result = runArgs('track');
      expect(result.command).toBe('track');
    });

    it('leaderboard not yet implemented', () => {
      expect(() => runArgs('leaderboard')).toThrow('Leaderboard scraping is not implemented yet.');
    });
  });

  describe('options', () => {
    it('uses default options when no flags are passed', () => {
      const { options } = runArgs('track');

      expect(options).toEqual({
        compress: true,
        path: 'data/track',
        progressBar: true,
        ids: allIds,
      });
    });

    it('uses process.argv by default when no args are provided', () => {
      const originalArgv = process.argv;
      process.argv = ['node', 'scraper', 'track'];

      try {
        const result = processArguments();
        expect(result.command).toBe('track');
      } finally {
        process.argv = originalArgv;
      }
    });

    it('parses custom path and boolean flags', () => {
      const { options } = runArgs('track', '--no-compress', '--no-progressBar', '-p', 'custom/dir');

      expect(options.compress).toBe(false);
      expect(options.progressBar).toBe(false);
      expect(options.path).toBe('custom/dir');
    });

    describe('--ids', () => {
      it('parses "cc"', () => {
        const { options } = runArgs('track', '--ids', 'cc');
        expect(options.ids).toEqual(ccIds);
      });

      it('parses "all"', () => {
        const { options } = runArgs('track', '--ids', 'all');
        expect(options.ids).toEqual(allIds);
      });

      it('parses range string', () => {
        const { options } = runArgs('track', '--ids', '1001-1005');
        expect(options.ids).toEqual([1001, 1002, 1003, 1004, 1005]);
      });

      it('parses list of numbers', () => {
        const { options } = runArgs('track', '--ids', '1001,1003,1005');
        expect(options.ids).toEqual([1001, 1003, 1005]);
      });

      it('throws error on invalid ids value', () => {
        expect(() => runArgs('track', '--ids', 'invalid')).toThrow('Invalid --ids value');
      });
    });
  });
});