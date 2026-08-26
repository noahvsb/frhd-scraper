import { processArguments } from '@/args';
import { scrape } from '@/scraper';

const { command, options } = processArguments();

await scrape(command, options);