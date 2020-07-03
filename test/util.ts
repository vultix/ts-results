import { IsExact, IsNever } from 'conditional-type-checks';
import { Result } from '../src';

export function expect_string<T>(x: T, y: IsExact<T, string>) {}
export function expect_never<T>(x: T, y: IsNever<T>) {}
export function eq<A, B>(x: IsExact<A, B>) {}

declare global {
    namespace jest {
        interface Matchers<R> {
            toMatchResult(result: Result<any, any>): R;
        }
    }
}

expect.extend({
    toMatchResult(received: Result<any, any>, result: Result<any, any>) {
        let pass = true;
        try {
            expect(received.ok).toBe(result.ok);

            if (received.val !== result.val) {
                expect(received.val).toMatchObject(result.val);
            }
        } catch (e) {
            pass = false;
        }

        const type = received.ok ? 'Ok' : 'Err';
        const expectedType = received.ok ? 'Ok' : 'Err';
        const val = JSON.stringify(received.val);
        const expectedVal = JSON.stringify(result.val);

        return {
            message: () =>
              `expected ${type}(${val}) ${pass ? '' : 'not '}to equal ${expectedType}(${expectedVal})`,
            pass
        };
    },
})
