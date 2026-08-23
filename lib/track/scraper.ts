import { getIds, Options } from "@/util";
import { fetchTrack, writeTrackData } from "@/track/util";
import cliProgress from "cli-progress";
import { mkdir } from "node:fs/promises";

export async function scrapeTracks(options: Options): Promise<void> {
  const ids = getIds(options.ids);

  await mkdir(options.path, { recursive: true });

  const bar = options.progressBar
    ? new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)
    : undefined;

  bar?.start(ids.length, 0);

  const concurrency = 10;
  const queue = [...ids];
  const failures: string[] = [];

  async function worker() {
    while (queue.length > 0) {
      const id = queue.shift();
      try {
        const track = await fetchTrack(id!, options);
        await writeTrackData(track, options);
      } catch (err) {
        failures.push(`${id} - ${err}`);
      }
      bar?.increment();
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));

  bar?.stop();

  if (failures.length > 0) {
    console.error('Failure to scrape these tracks:');
    for (const failure of failures) {
      console.error(failure);
    }
  }
}