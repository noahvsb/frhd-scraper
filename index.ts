import { fetchTrack, writeTrackData } from "@/track/util.js";

await writeTrackData(await fetchTrack(969514));