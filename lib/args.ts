import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { getIds, Options, rangeArray } from '@/util';

export interface ParsedArgs {
  command: string;
  options: Options;
}

export function processArguments(args: string[] = process.argv): ParsedArgs {
  const argv = yargs(hideBin(args))
    .command('track', 'Scrape tracks')
    .command('leaderboard', 'Scrape leaderboard (not implemented)')
    .option('compress', {
      alias: 'c',
      type: 'boolean',
      default: true,
      description: 'Compress output files (use --no-compress to disable)',
    })
    .option('path', {
      alias: 'p',
      type: 'string',
      description: 'Custom relative path to cwd (defaults to data/track/ or data/leaderboard/ depending on command)',
    })
    .option('progressBar', {
      type: 'boolean',
      default: true,
      description: 'Show progress bar (use --no-progressBar to disable)',
    })
    .option('ids', {
      type: 'string',
      default: 'all',
      description: 'Target IDs: \'cc\', \'all\', a range like \'1001-1010\' or a list of numbers like \'1001,1002,1003\'',
      coerce: (val: string): number[] => {
        if (val === 'cc' || val === 'all') return getIds(val);

        const parts = val.split(/[\.-]+/).map(Number);
        if (parts.length === 2 && !parts.some(isNaN)) {
          return rangeArray(parts[0], parts[1]);
        }

        const ids = val.split(/[\,]+/).map(Number);
        if (ids.length > 0 && !ids.some(isNaN)) {
          return ids;
        }

        throw new Error('Invalid --ids value: expected \'cc\', \'all\', a range like \'1001-1010\' or a list of numbers like \'1001,1002,1003\'.');
      },
    })
    .demandCommand(1, 'Please provide a command: \'track\' or \'leaderboard\'')
    .strict()
    .help()
    .parseSync();

  const command = argv._[0] as string;

  const defaultPath = command === 'track' ? 'data/track' : 'data/leaderboard';

  return {
    command,
    options: {
      compress: argv.compress,
      path: argv.path ?? defaultPath,
      progressBar: argv.progressBar,
      ids: argv.ids,
    },
  };
}