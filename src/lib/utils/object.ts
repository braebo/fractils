/**
 * A type-safe version of `Object.entries`
 * @param obj Any object.
 * @returns An array of key-value pairs.
 */
export function objectEntries<T extends {}>(obj: T) {
	if (typeof obj === 'object' && obj !== null) {
		return Object.entries(obj) as [keyof T, T[keyof T]][]
	} else {
		throw new Error('objectEntries called with non-object')
	}
}

export function objectKeys<T extends {}>(obj: T) {
	if (typeof obj === 'object' && obj !== null) {
		return Object.keys(obj) as (keyof T)[]
	} else {
		throw new Error('objectKeys called with non-object')
	}
}

export function objectValues<T extends {}>(obj: T) {
	if (typeof obj === 'object' && obj !== null) {
		return Object.values(obj) as T[keyof T][]
	} else {
		throw new Error('objectValues called with non-object')
	}
}
