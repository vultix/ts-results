# ts-results
A typescript implementation of [Rust's Result](https://doc.rust-lang.org/std/result/) object.

## Installation
```bash
$ npm install ts-results
```
or
```bash
$ yarn install ts-results
```

## Usage
```typescript
import { Result, Err, Ok } from 'ts-results';
```
### Creation
```typescript
let okResult: Result<number, Error> = Ok(10);
let okResult2 = Ok<number, Error>(10); // Exact same as above

let errorResult: Result<number, Error> = Ok(new Error('bad number!'));
let errorResult2 = Ok<number, Error>(new Error('bad number!')); // Exact same as above

```

### Type Safety
```typescript
let result = Ok<number, Error>(1);
if (result.ok) {
    // Typescript knows that result.val is a number because result.ok was true
    let number = result.val + 1;
} else {
    // Typescript knows that result.val is an Error because result.ok was false
    console.error(result.val.message);
}

if (result.err) {
    // Typescript knows that result.val is an Error because result.err was true
    console.error(result.val.message);
} else {
    // Typescript knows that result.val is a number because result.err was false
    let number = result.val + 1;
}
```

### Unwrap
```typescript
let goodResult = Ok<number, Error>(1);
let badResult = Err<number, Error>(new Error("something went wrong"));

goodResult.unwrap(); // 1
badResult.unwrap(); // throws Error("something went wrong")
```

### Expect
```typescript
let goodResult = Ok<number, Error>(1);
let badResult = Err<number, Error>(new Error("something went wrong"));

goodResult.expect('goodResult should be a number'); // 1
badResult.expect('badResult should be a number'); // throws Error("badResult should be a number - Error: something went wrong")
```

### Map
```typescript
let goodResult = Ok<number, Error>(1);
let badResult = Err<number, Error>(new Error("something went wrong"));

goodResult.map(num => num + 1).unwrap(); // 2
badResult.map(num => num + 1).unwrap(); // throws Error("something went wrong")

goodResult.map(num => num + 1, err => new Error('mapped')).unwrap(); // 2
badResult.map(num => num + 1, err => new Error('mapped')).unwrap(); // throws Error("mapped")

goodResult.map(null, err => new Error('mapped')).unwrap(); // 1
badResult.map(null, err => new Error('mapped')).unwrap(); // throws Error("mapped")
```
