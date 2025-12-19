module.exports = {
  preset: 'ts-jest', 
  testEnvironment: 'node', 

  roots: ['<rootDir>/src', '<rootDir>/tests'], 

  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)',
    // '**/tests/**/*.+(ts|tsx|js)',
  ],

  collectCoverage: true,
  
  coverageDirectory: 'coverage', 
  
  collectCoverageFrom: [
    'src/**/*.ts', 
    '!src/**/*.test.ts', // Exclude test files themselves
    '!src/server.ts'      // Exclude the server startup file
  ],
  
  moduleNameMapper: {
    '^@src/(.*)$': '<rootDir>/src/$1',
  },
};