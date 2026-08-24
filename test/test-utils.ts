import { Options } from "@/util";

export const createOptions = ({
  compress = true,
  path = 'data',
  progressBar = true,
  ids = [],
}: Partial<Options> = {}): Options => ({
  compress,
  path,
  progressBar,
  ids,
});