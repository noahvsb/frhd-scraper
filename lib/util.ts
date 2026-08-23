export function checkResponse(res: Response): void {
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
}

export type IdsOption = 'cc' | 'all' | SliceIds;

export type SliceIds = {
  start: number,
  end: number,
};

export type Options = {
  compress: boolean,
  path: string,
  progressBar: boolean,
  ids: IdsOption,
};

export function rangeArray(start: number, end: number) {
  const arr = [];
  for (let i = start; i <= end; i++) arr.push(i);
  return arr;
}

export function getIds(idsOption: IdsOption): number[] {
  const ccIds = rangeArray(1001, 11106);
  const allIds = [...ccIds, ...rangeArray(50001, 1100000)];

  if (idsOption === 'cc') return ccIds;
  if (idsOption === 'all') return allIds;
  return rangeArray(idsOption.start, idsOption.end);
}