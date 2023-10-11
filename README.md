# ts-results-es

A typescript implementation of Rust's [Result](https://doc.rust-lang.org/std/result/)
and [Option](https://doc.rust-lang.org/std/option/) objects.

Brings compile-time error checking and optional values to typescript.

## Relationship with ts-results

This package is a friendly fork of the excellent https://github.com/vultix/ts-results/
created due to time constraints on our (Lune's) side – we needed a package
available with some fixes.

Notable changes compared to the original package:

* Added ESM compatibility
* `Option` gained extra methods: `mapOr()`, `mapOrElse()`, `or()`,
  `orElse()`
* `Result` also gained extra methods: `mapOr()`, `mapOrElse()`,
  `expectErr()`, `or()`, `orElse()`
* `Ok` and `Err` no longer have the `val` property – it's `Ok.value` and `Err.error` now
* There is `Some.value` which replaced `Some.val`
* Boolean flags were replaced with methods:
  * `Option.some` -> `Option.isSome()`
  * `Option.none` -> `Option.isNone()`
  * `Result.ok` -> `Result.isOk()`
  * `Result.err` -> `Result.isErr()`

We'll try to get the changes merged into the upstream package so that this fork
can become obsolete.

## Contents

-   [Installation](#installation)
-   [Example](#example)
    -   [Result Example](#result-example)
    -   [Option Example](#option-example)
-   [Usage](#usage)

## Installation

```bash
$ npm install ts-results-es
```

or

```bash
$ yarn add ts-results-es
```

## Example

### Result Example

Convert this:

```typescript
import { existsSync, readFileSync } from 'fs';

function readFile(path: string): string {
    if (existsSync(path)) {
        return readFileSync(path);
    } else {
        // Callers of readFile have no way of knowing the function can fail
        throw new Error('invalid path');
    }
}

// This line may fail unexpectedly without warnings from typescript
const text = readFile('test.txt');
```

To this:

```typescript
import { existsSync, readFileSync } from 'fs';
import { Ok, Err, Result } from 'ts-results-es';

function readFile(path: string): Result<string, 'invalid path'> {
    if (existsSync(path)) {
        return new Ok(readFileSync(path)); // new is optional here
    } else {
        return new Err('invalid path'); // new is optional here
    }
}

// Typescript now forces you to check whether you have a valid result at compile time.
const result = readFile('test.txt');
if (result.isOk()) {
    // text contains the file's content
    const text = result.value;
} else {
    // err equals 'invalid path'
    const err = result.error;
}
```

### Option Example

Convert this:

```typescript
declare function getLoggedInUsername(): string | undefined;

declare function getImageURLForUsername(username: string): string | undefined;

function getLoggedInImageURL(): string | undefined {
    const username = getLoggedInUsername();
    if (!username) {
        return undefined;
    }

    return getImageURLForUsername(username);
}

const stringUrl = getLoggedInImageURL();
const optionalUrl = stringUrl ? new URL(stringUrl) : undefined;
console.log(optionalUrl);
```

To this:

```typescript
import { Option, Some, None } from 'ts-results-es';

declare function getLoggedInUsername(): Option<string>;

declare function getImageForUsername(username: string): Option<string>;

function getLoggedInImage(): Option<string> {
    return getLoggedInUsername().andThen(getImageForUsername);
}

const optionalUrl = getLoggedInImage().map((url) => new URL(stringUrl));
console.log(optionalUrl); // Some(URL('...'))

// To extract the value, do this:
if (optionalUrl.some) {
    const url: URL = optionalUrl.value;
}
```

## Usage

See https://ts-results-es.readthedocs.io/en/latest/reference/api/index.html to see the API
reference.

## Publishing the package

The package is published manually right now.

Steps to publish:

1. Bump the version in `package.json` and `src/package.json` as needed
2. Update the CHANGELOG
3. Commit to Git in a single commit and add a tag: `git tag -a vX.X.X` (the tag description can be
   anything)
4. `npm run build && npm publish`
5. Push both the `master` branch and the new tag to GitHub
