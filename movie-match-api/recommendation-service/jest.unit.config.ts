// jest.unit.config.ts
import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/test/**/*.test.ts'],
  setupFilesAfterEnv: [],
  detectOpenHandles: true,
  forceExit: true,
};

export default config;
