import { scrapeTracks } from "@/track/scraper";
import { createOptions, SliceIds } from "@/util";

const ids: SliceIds = {
  start: 1001,
  end: 1010,
}

const options = createOptions({ ids });

await scrapeTracks(options);