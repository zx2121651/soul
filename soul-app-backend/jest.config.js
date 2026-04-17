module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.(spec|test).ts', '**/tests/**/*.(spec|test).ts'],
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
};
