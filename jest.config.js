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
  collectCoverage: true,
  coverageThreshold: {
    // TODO: set all to 100%
    global: {
      lines: 100,
      branches: 100,
      functions: 100,
      statements: 100,
    },
  },
};