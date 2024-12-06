import type { Config } from 'jest'

const config: Config = {
   bail: true,
   clearMocks: true,
   coverageProvider: 'v8',
   preset: 'ts-jest',
   testEnvironment: 'node',
   testMatch: ['<rootDir>/src/**/*.spec.ts', '<rootDir>/src/**/*.test.ts'],
   moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/src/$1',
      '^@user/(.*)$': '<rootDir>/src/domain/user/$1',
      '^@management/(.*)$': '<rootDir>/src/domain/management/$1',
      '^@notification/(.*)$': '<rootDir>/src/domain/notification/$1',
   },
}

export default config
