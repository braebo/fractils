import type { Writable } from 'svelte/store'
import { writable } from 'svelte/store'

const browser = typeof globalThis.window !== undefined

const setAsync = async <T>(key: string, value: T): Promise<void> => {
	if (!browser) return
	return Promise.resolve().then(() => {
		typeof value != 'string'
			? localStorage.setItem(key, JSON.stringify(value))
			: localStorage.setItem(key, value)
	})
}

const getAsync = async <T = any>(key: string): Promise<T | null> => {
	if (browser) {
		return Promise.resolve().then(() => {
			const value = localStorage.getItem(key)
			// Return object if valid json
			if (value)
				try {
					const object = JSON.parse(value)
					if (object && typeof object === 'object') {
						return object
					}
				} catch (e) {
					null // discard error
				}
			// Make sure booleans aren't returned as strings
			if ((typeof value == 'string' && value == 'true') || value == 'false')
				return value === 'true'
			return value
		})
	} else return null
}

// Adapted from https://svelte.dev/repl/7b4d6b448f8c4ed2b3d5a3c31260be2a?version=3.34.0
/**
 * A Svelte store that uses localStorage to store data asyncronously.
 * @param key - The key to store the data under.
 * @param value - The initial value of the store.
 * @returns a writable store.
 * @example
 * const store = asyncLocalStorageStore('foo', 'bar')
 */
export const asyncLocalStorageStore = <T = any>(key: string, value: T): Writable<T> => {
	const { set: setStore, ...readableStore } = writable(value, () => {
		if (!browser) return

		getAndSetFromLocalStorage()

		const updateFromStorageEvents = (e: StorageEvent) => {
			if (e.key === key) getAndSetFromLocalStorage()
		}
		window.addEventListener('storage', updateFromStorageEvents)
		return () => window.removeEventListener('storage', updateFromStorageEvents)
	})

	// Set both localStorage and this Svelte store
	const set = async (value: T) => {
		setStore(value)
		try {
			await setAsync(key, value)
		} catch (error) {
			console.error(
				`the \`${key}\` store's new value \`${value}\` could not be persisted to localStorage because of ${error}`,
			)
		}
	}

	// Synchronize the Svelte store with localStorage
	const getAndSetFromLocalStorage = async () => {
		let localValue = null
		localValue = await getAsync(key).catch((error) => {
			console.error(
				`the \`${key}\` store's value could not be restored from localStorage because of ${error}`,
			)
		})

		if (localValue === null) {
			await setAsync(key, value)
		} else {
			try {
				setStore(localValue)
			} catch (error) {
				console.error(
					`the \`${key}\` store's value could not be added to localStorage because of ${error}`,
				)
			}
		}
	}

	return { ...readableStore, set }
}
