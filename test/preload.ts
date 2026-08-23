import { mock } from 'bun:test';

mock.module('yargs', () => ({ default: require('./mocks/yargs').default }));
mock.module('yargs/helpers', () => ({ hideBin: (argv: string[]) => argv.slice(2) }));
mock.module('cli-progress', () => require('./mocks/cli-progress'));