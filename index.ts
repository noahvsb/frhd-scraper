import { processArguments } from '@/args';
import { scrapeTracks } from '@/track/scraper';

const { command, options } = processArguments();

if (command === 'track') {
  await scrapeTracks(options);
}