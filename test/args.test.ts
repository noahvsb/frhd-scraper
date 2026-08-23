import { describe, expect, it, jest } from '@jest/globals';
import mockYargs from './__mocks__/yargs';

jest.mock('yargs', () => ({ default: mockYargs }));
jest.mock('yargs/helpers', () => ({ hideBin: (argv: string[]) => argv.slice(2) }));

import { processArguments } from '@/args';

describe('args', () => {
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
        path: 'data',
        progressBar: true,
        ids: 'all',
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
        expect(options.ids).toBe('cc');
      });

      it('parses "all"', () => {
        const { options } = runArgs('track', '--ids', 'all');
        expect(options.ids).toBe('all');
      });

      it('parses range string format "1001..1010"', () => {
        const { options } = runArgs('track', '--ids', '1001..1010');
        expect(options.ids).toEqual({ start: 1001, end: 1010 });
      });

      it('parses range string format "1001-1010"', () => {
        const { options } = runArgs('track', '--ids', '1001-1010');
        expect(options.ids).toEqual({ start: 1001, end: 1010 });
      });

      it('throws error on invalid ids value', () => {
        expect(() => runArgs('track', '--ids', 'invalid')).toThrow('Invalid --ids value');
      });
    });
  });
});