import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  // Where to look for unit tests and e2e
  testMatch: [
    '**/src/**/*.spec.ts', // unit tests inside src
    '**/test/**/*.e2e-spec.ts', // e2e tests in test folder
  ],

  moduleFileExtensions: ['ts', 'js', 'json'],

  // Map src/ alias for Jest (which does not understand tsconfig paths)
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },

  // To avoid problems with import/export and ts
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },

  // Optional, to clear the console with repeated messages
  clearMocks: true,
};

export default config;
