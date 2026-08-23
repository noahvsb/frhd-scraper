import { getIds, Options } from "@/util";
import { fetchTrack, writeTrackData } from "@/track/util";
import cliProgress from "cli-progress";
import { mkdir } from "node:fs/promises";

type Failure = {
  id: number,
  err: string,
}

export async function scrapeTracks(options: Options): Promise<void> {
  const ids = getIds(options.ids);

  await mkdir(options.path, { recursive: true });

  const bar = options.progressBar
    ? new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)
    : undefined;

  bar?.start(ids.length, 0);

  const startTime = performance.now();

  const concurrency = 10;
  let cursor = 0;
  const failures: Failure[] = [];

  async function worker() {
    while (cursor < ids.length) {
      const id = ids[cursor++];
      try {
        const track = await fetchTrack(id!, options);
        await writeTrackData(track, options);
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
    let notFoundCount = 0;
    console.error(`Failure to scrape ${failures.length} track${plural1(failures.length)}:`);
    for (const failure of failures) {
      if (failure.err.includes('404')) notFoundCount++;
      else console.error(`id = ${failure.id} - ${failure.err}`);
    }
    if (notFoundCount > 0) console.error(`${notFoundCount} track${plural1(notFoundCount)} ${plural2(notFoundCount)} not found`);
  }
}

function plural1(n: number): string {
  if (n === 1) return '';
  return 's';
}

function plural2(n: number): string {
  if (n === 1) return 'was';
  return 'were';
}