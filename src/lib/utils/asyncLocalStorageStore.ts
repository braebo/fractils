import type { Writable } from 'svelte/store'
import { writable } from 'svelte/store'
import { browser } from '$app/env'

const setAsync = async (key: string, value: unknown): Promise<void> => {
	return Promise.resolve().then(() => {
		typeof value != 'string'
			? localStorage.setItem(key, JSON.stringify(value))
			: localStorage.setItem(key, value)
	})
}

const getAsync = async (key: string): Promise<JSON> => {
	return Promise.resolve().then(() => {
		const value = localStorage.getItem(key)
		//? Return object if valid json
		if (value)
			try {
				const object = JSON.parse(value)
				if (object && typeof object === 'object') {
					return object
				}
			} catch (e) {
				null //? discard error
			}
		//? Make sure booleans aren't returned as strings
		if ((typeof value == 'string' && value == 'true') || value == 'false')
			return value === 'true'
		return value
	})
}

// Adapted from https://svelte.dev/repl/7b4d6b448f8c4ed2b3d5a3c31260be2a?version=3.34.0
/**
 *
 * A Svelte store that uses localStorage to store data.
 * @param key - The key to store the data under.
 * @param value - The initial value of the store.
 * @returns a writable store.
 * @example
 * const store = asyncLocalStorageStore('foo', 'bar')
 */
export const asyncLocalStorageStore = (key: string, value: unknown): Writable<unknown> => {
	const { set: setStore, ...readableStore } = writable(value, () => {
		if (!browser) return

		getAndSetFromLocalStorage()

		const updateFromStorageEvents = (e: StorageEvent) => {
			if (e.key === key) getAndSetFromLocalStorage()
		}
		window.addEventListener('storage', updateFromStorageEvents)
		return () => window.removeEventListener('storage', updateFromStorageEvents)
	})

	//? Set both localStorage and this Svelte store
	const set = async (value: unknown) => {
		setStore(value)
		try {
			await setAsync(key, value)
		} catch (error) {
			console.error(
				`the \`${key}\` store's new value \`${value}\` could not be persisted to localStorage because of ${error}`,
			)
		}
	}

	//? Synchronize the Svelte store with localStorage
	const getAndSetFromLocalStorage = async () => {
		let localValue: JSON | void | null = null
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

export default asyncLocalStorageStore
