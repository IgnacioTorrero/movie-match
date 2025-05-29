// jest.unit.config.ts
import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest',
    transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  testEnvironment: 'node',
  testMatch: ['**/test/**/*.test.ts'],
  globals: {
    'ts-jest': {
      tsconfig: './tsconfig.json',
      useESM: false,
      isolatedModules: true,
    },
  },
  setupFilesAfterEnv: [],
  detectOpenHandles: true,
  forceExit: true,
};

export default config;
