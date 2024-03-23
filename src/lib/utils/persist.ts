import { DEV } from 'esm-env'

/**
 * Persists a value in localStorage, and updates it whenever the `value` property is reassigned.
 * @returns An object with a `value` property that syncs with localStorage.
 */
export function persist<T>(
	/**
	 * The key to store the value under in localStorage.
	 */
	key: string,
	/**
	 * The initial value to store (optional).
	 * @default undefined
	 */
	initialValue: T | undefined = undefined,
	/**
	 * Whether to print a warning if localStorage is not available.
	 * @default false
	 */
	quiet = !DEV,
) {
	const bail = () => {
		if (typeof localStorage === 'undefined') {
			if (!quiet) console.warn('localStorage is not available for key', key)
			return true
		} else return false
	}

	return {
		get value() {
			if (bail()) return initialValue
			const storedValue = localStorage.getItem(key)
			return storedValue ? JSON.parse(storedValue) : initialValue
		},
		set value(newValue) {
			if (bail()) return
			localStorage.setItem(key, JSON.stringify(newValue))
		},
	}
}
