import { checkResponse, Options } from "@/util";
import { writeFile } from "node:fs/promises";
import { promisify } from "node:util";
import { gunzip, gzip } from "node:zlib";

const gzipAsync = promisify(gzip);
const gunzipAsync = promisify(gunzip);

const trackUrl = (id: number): string => `https://www.freeriderhd.com/t/${id}?ajax=true`;
const trackBody = (_id: number): RequestInit | undefined => ({
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  },
});

export type TrackStats = {
  upVotes: number,
  downVotes: number,
  plays: string,
  runs: number,
  firstRuns: number,
  avgTime: string,
  completionRate: number,
}

export type TrackData = {
  id: number,
  title: string,
  desc: string,
  vehicles: string[],
  author: string,
  featured: boolean,
  code: string,
  compressed: boolean,
  trackStats: TrackStats,
}

export async function getCdnUrlAndTrackStats(id: number): Promise<{ cdnUrl: string, trackStats: TrackStats }> {
  const res = await fetch(trackUrl(id), trackBody(id));
  checkResponse(res);
  const data = await res.json();
  return {
    cdnUrl: data.track.cdn,
    trackStats: {
      upVotes: data.track_stats.up_votes,
      downVotes: data.track_stats.dwn_votes,
      plays: data.track_stats.plays,
      runs: data.track_stats.runs,
      firstRuns: data.track_stats.frst_runs,
      avgTime: data.track_stats.avg_time,
      completionRate: data.track_stats.cmpltn_rate,
    },
  };
}

export async function fetchTrack(id: number, options: Options): Promise<TrackData> {
  const { cdnUrl, trackStats } = await getCdnUrlAndTrackStats(id);

  const res = await fetch(cdnUrl);
  checkResponse(res);

  const text = await res.text();
  // the JSON is wrapped in t(...) for some reason
  const data = JSON.parse(text.slice(text.indexOf("(") + 1, text.lastIndexOf(")")));

  let maybeCompressed = data.code;
  if (options.compress) {
    maybeCompressed = await compressCode(maybeCompressed);
  }

  return {
    id: data.id,
    title: data.title,
    desc: data.descr,
    vehicles: data.vehicles,
    author: data.author,
    featured: data.featured ?? false,
    code: maybeCompressed,
    compressed: options.compress,
    trackStats,
  };
}

export async function writeTrackData(data: TrackData, options: Options): Promise<void> {
  await writeFile(`${options.path}/${data.id}.json`, JSON.stringify(data));
}

export async function scrapeTrack(id: number, options: Options): Promise<void> {
  const track = await fetchTrack(id, options);
  await writeTrackData(track, options);
}

export async function compressCode(code: string): Promise<string> {
  return (await gzipAsync(code)).toString('base64');
}

export async function decompressCode(compressed: string): Promise<string> {
  return (await gunzipAsync(Buffer.from(compressed, 'base64'))).toString('utf-8');
}