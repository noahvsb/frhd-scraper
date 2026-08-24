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