import { createDefaultPreset } from 'ts-jest';

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
export default {
  testEnvironment: "node",
  moduleNameMapper: {
    '^@/(.*)\\.js$': '<rootDir>/lib/$1',
    '^@/(.*)$': '<rootDir>/lib/$1',
  },
  transform: {
    ...tsJestTransformCfg,
  },
};