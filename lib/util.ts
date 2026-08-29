import { promisify } from "node:util";
import { gunzip, gzip } from "node:zlib";

const gzipAsync = promisify(gzip);
const gunzipAsync = promisify(gunzip);

export function checkResponse(res: Response): void {
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
}

export type Options = {
  compress: boolean,
  path: string,
  progressBar: boolean,
  ids: number[],
};

export function rangeArray(start: number, end: number) {
  const arr = [];
  for (let i = start; i <= end; i++) arr.push(i);
  return arr;
}

export function getIds(option: 'cc' | 'all'): number[] {
  const ccIds = rangeArray(1001, 11106);
  if (option === 'cc') return ccIds;
  return [...ccIds, ...rangeArray(50001, 1100000)];
}

export async function compressCode(code: string): Promise<string> {
  return (await gzipAsync(code)).toString('base64');
}

export async function decompressCode(compressed: string): Promise<string> {
  return (await gunzipAsync(Buffer.from(compressed, 'base64'))).toString('utf-8');
}