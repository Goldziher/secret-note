export default {
    moduleFileExtensions: ['js', 'json', 'ts'],
    testRegex: '.*\\.spec\\.ts$',
    transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
    },
    collectCoverageFrom: ['src/**/*.(t|j)s'],
    coverageDirectory: 'coverage',
    testEnvironment: 'node',
    testTimeout: 15000,
    coveragePathIgnorePatterns: [
        '<rootDir>/src/db/migrations/*.*',
        '<rootDir>/src/main.ts',
    ],
    coverageReporters: ['text', 'cobertura'],
    cacheDirectory: '.jest/cache',
};
