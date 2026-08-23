export function checkResponse(res: Response): void {
  if (!res.ok) {
    throw new Error(`${res.status}: ${res.statusText}`);
  }
}

export type Options = {
  log: boolean,
  compress: boolean,
  path: string,
}

export const createOptions = ({
  log = false,
  compress = true,
  path = 'data',
}: Partial<Options> = {}): Options => ({
  log,
  compress,
  path,
});

export const defaultOptions = createOptions();