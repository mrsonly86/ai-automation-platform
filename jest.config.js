module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
  ],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@agents/(.*)$': '<rootDir>/src/agents/$1',
    '^@security/(.*)$': '<rootDir>/src/security/$1',
    '^@payments/(.*)$': '<rootDir>/src/payments/$1',
    '^@mobile/(.*)$': '<rootDir>/src/mobile/$1',
    '^@analytics/(.*)$': '<rootDir>/src/analytics/$1',
    '^@integrations/(.*)$': '<rootDir>/src/integrations/$1',
    '^@vietnam/(.*)$': '<rootDir>/src/vietnam/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
  },
};