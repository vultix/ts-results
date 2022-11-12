module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testRegex: '/test/.*.test.ts',
    globals: {
        'ts-jest': {
            tsconfig: 'test/tsconfig.json',
        },
    },
    collectCoverageFrom: ['src/**/*.ts'],
    collectCoverage: true,
    coverageThreshold: {
        './src/**/*.ts': {
            branches: 100,
            functions: 100,
            lines: 100,
            statements: 100,
        },
    },
    moduleNameMapper: {
      "^(.*)\\.js$": "$1"
    },

};
