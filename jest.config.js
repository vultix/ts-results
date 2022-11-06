module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testRegex: '/test/.*.test.ts',
    transform: {
        '^.+\\.tsx?$': [
            'ts-jest',
            {
                tsconfig: 'test/tsconfig.json',
            },
        ],
    },
    collectCoverageFrom: ['src/**/*.ts'],
    coverageThreshold: {
        './src/**/*.ts': {
            branches: 100,
            functions: 100,
            lines: 100,
            statements: 100,
        },
    },
    // Map Node ESM imports back to normal imports
    // e.g. `./result.js` => `./result`
    moduleNameMapper: {
        "^(.*)\\.js$": "$1"
    },
};
