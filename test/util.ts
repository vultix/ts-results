import { IsExact, IsNever } from 'conditional-type-checks';
import { Result } from '../src/index.js';
import { Observable } from 'rxjs';

export function expect_string<T>(x: T, y: IsExact<T, string>) {}

export function expect_never<T>(x: T, y: IsNever<T>) {}

export function eq<A, B>(x: IsExact<A, B>) {}

declare global {
    namespace jest {
        interface Matchers<R> {
            toMatchResult(result: Result<any, any>): R;

            toMatchObsResult(result: Result<any, any>): R;

            toMatchObs(value: any): R;
        }
    }
}

expect.extend({
    toMatchResult(received: Result<any, any>, result: Result<any, any>) {
        let pass = true;
        const receivedInner = 'value' in received ? received.value : received.error
        const resultInner = 'value' in result ? result.value : result.error
        try {
            expect(received.ok).toBe(result.ok);

            if (receivedInner !== resultInner) {
                expect(receivedInner).toMatchObject(resultInner);
            }
        } catch (e) {
            pass = false;
        }

        const type = received.ok ? 'Ok' : 'Err';
        const expectedType = received.ok ? 'Ok' : 'Err';
        const val = JSON.stringify(receivedInner);
        const expectedVal = JSON.stringify(resultInner);

        return {
            message: () => `expected ${type}(${val}) ${pass ? '' : 'not '}to equal ${expectedType}(${expectedVal})`,
            pass,
        };
    },
    toMatchObsResult(obs: Observable<Result<any, any>>, result: Result<any, any>) {
        let pass = true;

        let received: Result<any, any> | undefined;
        let receivedInner
        const resultInner = 'value' in result ? result.value : result.error
        try {
            obs.subscribe((val) => {received = val; receivedInner = 'value' in received ? received.value : received.error}).unsubscribe();

            expect(received?.ok).toBe(result.ok);

            if (receivedInner !== resultInner) {
                expect(receivedInner).toMatchObject(resultInner);
            }
        } catch (e) {
            pass = false;
        }

        const type = received?.ok ? 'Ok' : 'Err';
        const expectedType = received?.ok ? 'Ok' : 'Err';
        const val = JSON.stringify(receivedInner);
        const expectedVal = JSON.stringify(resultInner);

        return {
            message: () => `expected ${type}(${val}) ${pass ? '' : 'not '}to equal ${expectedType}(${expectedVal})`,
            pass,
        };
    },
    toMatchObs(obs: Observable<any>, value: any) {
        let pass = true;

        let received: any | undefined;
        try {
            obs.subscribe((val) => (received = val)).unsubscribe();

            expect(received).toEqual(value);
        } catch (e) {
            pass = false;
        }

        return {
            message: () => `expected observable value: ${JSON.stringify(value)}\n\nFound: ${JSON.stringify(received)}`,
            pass,
        };
    },
});
