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

export type TrackData = {
  id: number,
  title: string,
  desc: string,
  vehicles: string[],
  author: string,
  featured: boolean,
  code: string,
  compressed: boolean,
}

export async function getCdnUrl(id: number): Promise<string> {
  const res = await fetch(trackUrl(id), trackBody(id));
  checkResponse(res);
  return (await res.json()).track.cdn;
}

export async function fetchTrack(id: number, options: Options): Promise<TrackData> {
  const cdnUrl = await getCdnUrl(id);

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
  };
}

export async function writeTrackData(data: TrackData, options: Options): Promise<void> {
  await writeFile(`${options.path}/${data.id}.json`, JSON.stringify(data));
}

export async function compressCode(code: string): Promise<string> {
  return (await gzipAsync(code)).toString('base64');
}

export async function decompressCode(compressed: string): Promise<string> {
  return (await gunzipAsync(Buffer.from(compressed, 'base64'))).toString('utf-8');
}