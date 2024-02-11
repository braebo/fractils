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
	let timeout: ReturnType<typeof setTimeout>
	// We use a mutable object here to overwrite previous calls without
	// needing to manually reject or resolve interrupted promises.
	let pendingPromise = {} as {
		resolve: (value: ReturnType<T> | PromiseLike<ReturnType<T>>) => void
		reject: (reason?: any) => void
	}

	return function (...args: Parameters<T>): Promise<ReturnType<T>> {
		clearTimeout(timeout)

		timeout = setTimeout(() => {
			const result = func(...args)
			Promise.resolve(result).then(pendingPromise.resolve, pendingPromise.reject)
			pendingPromise = { resolve: () => {}, reject: () => {} }
		}, wait)

		if (!pendingPromise) {
			pendingPromise = { resolve: () => {}, reject: () => {} }
			return new Promise<ReturnType<T>>((resolve, reject) => {
				pendingPromise = { resolve, reject }
			})
		} else {
			// This path is hit if a new call comes in before the timeout from a
			// previous call completes. No new promise is created; the last promise
			// remains pending and will resolve or reject with the result of `func`.
			return new Promise<ReturnType<T>>((resolve, reject) => {
				// Overwrite the resolve and reject functions to
				// ensure the last call controls the promise.
				pendingPromise = { resolve, reject }
			})
		}
	}
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
