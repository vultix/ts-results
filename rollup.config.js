import path from 'path';
import typescript from '@rollup/plugin-typescript';
import pkg from './package.json'

// Gather external modules
const external = [
    // All dependencies are external
    ...Object.keys(pkg.dependencies ?? []),
    ...Object.keys(pkg.devDependencies ?? []),
    'rxjs/operators/index.js',
];

const banner = `/**
 * ${pkg.name} v${pkg.version}
 * Author: ${pkg.author}
 * LICENSE: ${pkg.license}
 *
 * ${pkg.repository.url}
 */
`;

const defaultConfig = {
    input: {
        index: path.join(__dirname, 'src', 'index.ts'),
        "rxjs-operators/index": path.join(__dirname, 'src', 'rxjs-operators', 'index.ts')
    },
    output: {
        name: pkg.name,
        preserveModules: true,
        banner,
    },
    external,
    onwarn(warning, warn) {
        // Throw an error on unresolved dependencies (not listed in package json)
        if (warning.code === 'UNRESOLVED_IMPORT')
            throw new Error(`${warning.message}.
Make sure this dependency is listed in the package.json
    `);

        // Use default for everything else
        warn(warning);
    },
    plugins: [
        typescript({
            noEmitOnError: false,
            sourceMap: false,
        }),
    ],
};

const cjsConfig = {
    ...defaultConfig,
    output: {
        ...defaultConfig.output,
        dir: path.dirname(pkg.main),
        format: 'cjs',
        entryFileNames: "[name].js",
    }
};

const esmConfig = {
    ...defaultConfig,
    output: {
        ...defaultConfig.output,
        dir: path.dirname(pkg.module),
        format: 'esm',
        entryFileNames: "[name].mjs",
    },
    plugins: [
        typescript({
            noEmitOnError: false,
            sourceMap: false,
            outDir: path.dirname(pkg.module),
        }),
    ],
};

export default [
    cjsConfig,
    esmConfig,
];
