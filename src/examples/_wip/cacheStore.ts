import type { Writable } from 'svelte/store'
import { writable } from 'svelte/store'
import { browser } from '$app/env'
import { log } from '../../lib/utils/log'

const setAsync = async <T>(key: string, value: T, expiry: number): Promise<void> => {
	if (!browser) return
	return Promise.resolve().then(() => {
		localStorage.setItem(
			key,
			JSON.stringify({
				value,
				expiry,
			}),
		)
	})
}

interface cachedValue {
	value: unknown
	expiry: number
}

const getAsync = async <T = any>(key: string, cb: T, ttl: number): Promise<cachedValue | null> => {
	if (browser) {
		console.log('getAsync', key);
		return new Promise(async (resolve) => {
			const item = localStorage.getItem(key)
			log({item})
			//? Return object if valid json
			if (item)
				try {
					const object = JSON.parse(item)
					log(object)
					const expired = object.expiry < Date.now()
					log(expired)
					if (object && typeof object === 'object') {
						if (!expired) {
							log('Returning cached value: ' + Object.entries(object))
							return object
						} else {
							log('Fetching new data')
							const res = await cb()
							if (res && res.json) {
								try {
									const json = await res.json()
									return resolve({
										value: json,
										expiry: Date.now() + ttl,
									})
								} catch (e) {
									console.error(e)
								}
							} else return res
						}
					}
				} catch (e) {
					console.error(e)
					null //? discard error
				}
			//? Make sure booleans aren't returned as strings
			// if ((typeof item == 'string' && item == 'true') || item == 'false')
			// 	return item === 'true'
			return resolve(item)
		})
	} else return Promise.resolve(null)
}

/**
 * A Svelte store that uses localStorage to store data.
 * @param key - The key to store the data under.
 * @param cb - The function used to populate the store.
 * @param ttl - The time to live for the data in milliseconds.
 * @returns a writable store.
 * @example
 * const store = localStorageStore('foo', 'bar')
 *
 * @remarks Adapted from {@link https://svelte.dev/repl/7b4d6b448f8c4ed2b3d5a3c31260be2a?version=3.34.0 this REPL}
 */
export const cacheStore = <T = any>(key: string, cb: T, ttl = 10000): Writable<T> => {
	const { set: setStore, ...readableStore } = writable<cachedValue | null>({value: null, expiry: 0}, () => {
		if (!browser) return

		getAndSetFromLocalStorage()

		const updateFromStorageEvents = (e: StorageEvent) => {
			if (e.key === key) getAndSetFromLocalStorage()
		}
		window.addEventListener('storage', updateFromStorageEvents)
		return () => window.removeEventListener('storage', updateFromStorageEvents)
	})

	/**
	 * Sets both localStorage and this Svelte store
	 */
	const set = async (value: T) => {
		setStore(value)
		try {
			await setAsync(key, value, ttl)
		} catch (error) {
			console.error(
				`the \`${key}\` store's new value \`${value}\` could not be persisted to localStorage because of ${error}`,
			)
		}
	}

	/**
	 * Synchronizes the Svelte store with localStorage
	 */
	const getAndSetFromLocalStorage = async () => {
		// let localValue = null
		let localValue = await getAsync(key, cb, ttl).catch((e: Error) => {
			console.error(
				`the \`${key}\` store's value could not be restored from localStorage because of ${e}`,
			)
		})

		if (localValue === null) {
			await setAsync(key, localValue, localValue?.expiry)
		} else {
			try {
				setStore(localValue.value)
			} catch (e) {
				console.error(
					`the \`${key}\` store's value could not be added to localStorage because of ${e}`,
				)
			}
		}
	}

	return { ...readableStore, set }
}

export default cacheStore
