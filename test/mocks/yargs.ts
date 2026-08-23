import { mock } from 'bun:test';
import parser from 'yargs-parser';

export default mock((argv: string[]) => {
  const boolean: string[] = [];
  const alias: Record<string, string> = {};
  const defaults: Record<string, unknown> = {};
  const coerce: Record<string, (v: unknown) => unknown> = {};

  const api: any = {
    command: () => api,
    option: (name: string, opts: any) => {
      if (opts.type === 'boolean') boolean.push(name);
      if (opts.alias) alias[name] = opts.alias;
      if (opts.default !== undefined) defaults[name] = opts.default;
      if (opts.coerce) coerce[name] = opts.coerce;
      return api;
    },
    demandCommand: () => api,
    strict: () => api,
    help: () => api,
    parseSync: () => {
      const parsed = parser(argv, { boolean, alias, default: defaults });
      for (const [key, fn] of Object.entries(coerce)) {
        parsed[key] = fn(parsed[key]);
      }
      return parsed;
    },
  };
  return api;
});