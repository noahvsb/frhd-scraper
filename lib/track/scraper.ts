import { getIds, Options } from "@/util";
import { fetchTrack, writeTrackData } from "@/track/util";
import cliProgress from "cli-progress";
import { mkdir } from "node:fs/promises";

type Failure = {
  id: number,
  err: unknown,
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
        failures.push({ id, err });
      }
      bar?.increment();
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));

  bar?.stop();

  const elapsedSeconds = ((performance.now() - startTime) / 1000).toFixed(2);
  console.log(`Scraped ${ids.length} track${plural(ids.length)} in ${elapsedSeconds}s`);

  if (failures.length > 0) {
    console.error(`Failure to scrape ${failures.length} track${plural(failures.length)}:`);
    for (const failure of failures) {
      console.error(`${failure.id} - ${failure.err}`);
    }
  }
}

function plural(n: number): string {
  if (n === 1) return '';
  return 's';
}