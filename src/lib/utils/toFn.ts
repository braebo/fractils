/**
 * Coerces a value to a function.
 */
export function toFn<T>(v: T | (() => T)): () => T {
	if (typeof v === 'function') {
		return v as () => T
	}

	return () => v as unknown as T
}
