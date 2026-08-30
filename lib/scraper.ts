import { Options } from "@/util";
import { scrapeTrack } from "@/track/util";
import cliProgress from "cli-progress";
import { mkdir } from "node:fs/promises";
import { scrapeLeaderboard } from "./leaderboard/util";

type Failure = {
  id: number,
  err: string,
}


export async function scrape(command: string, options: Options): Promise<void> {
  await mkdir(options.path, { recursive: true });

  const bar = options.progressBar
    ? new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)
    : undefined;

  bar?.start(options.ids.length, 0);

  const startTime = performance.now();

  const concurrency = 10;
  let cursor = 0;
  const failures: Failure[] = [];

  async function worker() {
    while (cursor < options.ids.length) {
      const id = options.ids[cursor++];
      try {
        if (command === 'track') await scrapeTrack(id!, options);
        else await scrapeLeaderboard(id!, options);
      } catch (err) {
        failures.push({ id, err: String(err) });
      }
      bar?.increment();
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));

  bar?.stop();

  const elapsedSeconds = ((performance.now() - startTime) / 1000).toFixed(2);
  console.log(`Scraping took ${elapsedSeconds}s`);

  if (failures.length > 0) {
    let skippedCount = 0;
    let notFoundCount = 0;
    console.log(`Did not scrape ${failures.length} ${command}${plural1(failures.length)}:`);
    for (const failure of failures) {
      if (failure.err.includes('skipped')) skippedCount++;
      else if (failure.err.includes('404') || failure.err.includes('not found')) notFoundCount++;
      else console.error(`id = ${failure.id} - ${failure.err}`);
    }
    if (skippedCount > 0) console.log(`${skippedCount} track${plural1(skippedCount)} ${plural2(skippedCount)} skipped`);
    if (notFoundCount > 0) console.error(notFoundMessage(notFoundCount, command));
  }
}

function notFoundMessage(notFoundCount: number, command: string) {
  return `${notFoundCount} ${command}${plural1(notFoundCount)} ${plural2(notFoundCount)} not found${command === 'leaderboard' ? ' or empty' : ''}`;
}

function plural1(n: number): string {
  if (n === 1) return '';
  return 's';
}

function plural2(n: number): string {
  if (n === 1) return 'was';
  return 'were';
}