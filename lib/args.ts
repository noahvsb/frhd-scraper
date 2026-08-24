import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { IdsOption, Options } from '@/util';

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
      default: 'data/track',
      description: 'Custom relative path to cwd (defaults to data/track/ or data/leaderboard/ depending on command)',
    })
    .option('progressBar', {
      type: 'boolean',
      default: true,
      description: 'Show progress bar (use --no-progressBar to disable)',
    })
    .option('ids', {
      default: 'all',
      description: 'Target IDs: \'cc\', \'all\', or range like \'1001..1010\' or \'1001-1010\'',
      coerce: (val: string): IdsOption => {
        if (val === 'cc' || val === 'all') return val;

        const parts = val.split(/[\.-]+/).map(Number);
        if (parts.length === 2 && !parts.some(isNaN)) {
          return { start: parts[0], end: parts[1] };
        }

        throw new Error('Invalid --ids value. Expected \'cc\', \'all\', or a range like \'1001..1010\'.');
      },
    })
    .demandCommand(1, 'Please provide a command: \'track\' or \'leaderboard\'')
    .strict()
    .help()
    .parseSync();

  const command = argv._[0] as string;

  if (command === 'leaderboard') {
    throw new Error('Leaderboard scraping is not implemented yet.');
  }

  const defaultPath = command === 'leaderboard' ? 'data/leaderboard' : 'data/track';

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