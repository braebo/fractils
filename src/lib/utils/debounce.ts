import { wait } from './wait'

export function debounce(func: Function, wait: number) {
	let timeout: ReturnType<typeof setTimeout> | null

	return function (...args: any[]) {
		const later = () => {
			timeout = null
			func(...args)
		}

		clearTimeout(timeout!)
		timeout = setTimeout(later, wait)
	}
}

interface PendingPromise<T> {
    resolve: (value: T | PromiseLike<T>) => void;
    reject: (reason?: any) => void;
}

/**
 * Creates a debounced version of a function.  Unlike {@link debounce},
 * `debounceAsync` accepts a sync _or_ async callback, and returns a
 * promise that resolves when the callback fires.
 *
 * @example
 * ```ts
 * async function log() {
 * 	console.log('FIRST')
 * 	await wait(1000)
 * 	console.log('LAST')
 * }
 *
 * const logDebounce = debounceAsync(log, 500)
 *
 * for (let i = 0; i < 3; i++) {
 * 	console.log(i)
 * 	logDebounce().then(() => {
 * 		console.log('DONE')
 * 	})
 * }
 *
 * // Output:
 *
 * // 0
 * // 1
 * // 2
 * // FIRST
 * // DONE
 * // LAST
 * ```
 */
export function debounceAsync<T extends (...args: any[]) => any>(func: T, wait: number) {
    let timeout: ReturnType<typeof setTimeout>;
    // Initialize with no-op functions to avoid checking for undefined later.
    let pendingPromise: PendingPromise<ReturnType<T>> = {
        resolve: () => {},
        reject: () => {}
    };

    return function (...args: Parameters<T>): Promise<ReturnType<T>> {
        clearTimeout(timeout);

        timeout = setTimeout(() => {
            const result = func(...args);
            Promise.resolve(result).then(pendingPromise.resolve, pendingPromise.reject);
            // Reset pendingPromise with no-op functions after resolving or rejecting.
            pendingPromise = { resolve: () => {}, reject: () => {} };
        }, wait);

        // Return a new promise that assigns its resolve and reject to pendingPromise.
        // This ensures the promise returned by the most recent call controls the outcome.
        return new Promise<ReturnType<T>>((resolve, reject) => {
            pendingPromise = { resolve, reject };
        });
    };
}

async function log() {
	console.log('FIRST')
	await wait(1000)
	console.log('LAST')
}

const logDebounce = debounceAsync(log, 500)

for (let i = 0; i < 3; i++) {
	console.log(i)
	logDebounce().then(() => {
		console.log('DONE')
	})
}
