// https://github.com/babichjacob/svelte-localstorage

import { writable, type Writable } from 'svelte/store'
import { cancelDefer, defer } from './defer'
// import { logger } from './logger'
import { BROWSER, DEV } from 'esm-env'

export interface StateOptions<T> extends Partial<Writable<T>> {
	/**
	 * If provided, localStorage updates will be debounced by
	 * the specified number of milliseconds. If both `debounce`
	 * and `throttle` are provided, `debounce` will take precedence.
	 * @default undefined
	 */
	debounce?: number
	/**
	 * If true, localStorage updates will be deferred using
	 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback | requestIdleCallback},
	 * falling back to `requestAnimationFrame` and finally `setTimeout` with
	 * a timeout of 0. Particularly useful in hot code paths like render loops.
	 * @remarks
	 * Deferring can significantly reduce the performance impact of many
	 * syncronous localStorage updates (which run on the main thread).
	 * At the time of writing, `requestIdleCallback` is still in
	 * Safari Technology Preview, hence the fallbacks.
	 * @default false
	 */
	defer?: boolean
	/**
	 * Optional callback function that runs after the store is
	 * updated and all subscribers have been notified.
	 * @default undefined
	 */
	onChange?: (v: T) => void

	/**
	 * Log errors to the console.
	 * @default import.meta.env.DEV
	 */
	verbose?: boolean

	/**
	 * Used for testing.
	 * @default false
	 * @internal
	 */
	browserOverride?: boolean
}

/**
 * An observable store that uses localStorage to store data asyncronously.
 * It supports Maps and Sets, debouncing and deferring localStorage updates,
 * and syncronizes with localStorage events across tabs.
 * @param key - The key to store the data under.
 * @param initial - The initial value of the store.
 * @param options - {@link StateOptions}
 * @example
 * ```ts
 * const store = localStorageStore('foo', 5)
 * ```
 */
export const localStorageStore = <T>(
	key: string,
	initial: T,
	options?: StateOptions<T>,
): Writable<T> => {
	let currentValue = initial
	const verbose = options?.verbose ?? DEV

	const { set: setStore, ...readableStore } = writable<T>(initial, () => {
		if (options?.browserOverride || BROWSER) {
			getAndSetFromLocalStorage()

			const updateFromStorageEvents = (event: StorageEvent) => {
				if (event.key === key) getAndSetFromLocalStorage()
			}

			window.addEventListener('storage', updateFromStorageEvents)

			return () => window.removeEventListener('storage', updateFromStorageEvents)
		} else return () => {}
	})

	let serialize = JSON.stringify
	let deserialize = JSON.parse

	const type = initial instanceof Map ? 'Map' : initial instanceof Set ? 'Set' : ''
	const isMapOrSet = ['Map', 'Set'].includes(type)

	if (isMapOrSet) {
		serialize = (value: T) => JSON.stringify(Array.from((value as Map<any, any>).entries()))
		deserialize = (value: string) => {
			const parsed = JSON.parse(value)
			if (Array.isArray(parsed)) {
				if (initial instanceof Map) return new Map(parsed)
				if (initial instanceof Set) return new Set(parsed)
				return parsed
			}
			// prettier-ignore
			if (verbose) console.error(`Failed to deserialize ${type} from localStorageStore:`, { parsed, value, initial, key, options })
			return value
		}
	}

	const set = (value: T) => {
		currentValue = value
		if (typeof value === 'string' && value.startsWith('"') && value.endsWith('"')) {
			value = deserialize(value)
		}
		setStore(value)
		setItem(value)
		options?.onChange?.(value)
	}

	let setItem = (value: T) => {
		try {
			value = serialize(value) as T
			localStorage.setItem(key, value as string)
		} catch (error) {
			if (verbose)
				console.error(`Failed to set localStorageStore value:`, { error, key, value })
		}
	}

	if (options?.defer) {
		let setDeferId: number
		const _ = setItem
		setItem = (value: T) => {
			cancelDefer(setDeferId)
			setDeferId = defer(() => {
				_(value)
			})
		}
	}

	if (options?.debounce) {
		let timeout = (setTimeout as Window['setTimeout']) ?? (() => void 0)
		let timeoutId: number
		const _ = setItem
		setItem = (value: T) => {
			clearTimeout(timeoutId)
			timeoutId = timeout(() => {
				_(value)
			}, options.debounce)
		}
	}

	const getAndSetFromLocalStorage = () => {
		let localValue: string | null = null

		localValue = localStorage.getItem(key) ?? null

		if (localValue === null) {
			set(initial)
		} else {
			try {
				const parsed = deserialize(localValue)
				setStore(parsed as T)
				currentValue = parsed as T
			} catch (e) {
				if (verbose) {
					console.error(`Failed to parse localStorageStore value:`, { key, localValue })
					console.error(e)
				}
			}
		}
	}

	const update = (fn: (T: T) => T) => {
		set(fn(currentValue))
	}

	return { ...readableStore, set, update }
}
