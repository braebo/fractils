/**
 * Recursively processes a tuple type and returns a union of entries.
 * @typeParam T - The tuple type being processed.
 * @typeParam I - The indices of the tuple so far, initialized to an empty array.
 * @typeParam R - The accumulated result, initialized to `never`.
 * @internal
 */
type TupleEntry<
	T extends readonly unknown[],
	I extends unknown[] = [],
	R = never,
> = T extends readonly [infer Head, ...infer Tail]
	? TupleEntry<Tail, [...I, unknown], R | [`${I['length']}`, Head]>
	: R

/**
 * Maps an object literal to a union of literal entry pairs.
 * @typeParam T - The object type being processed.
 * @internal
 */
type ObjectEntry<T extends {}> = T extends object
	? {
			[K in keyof T]: [K, Required<T>[K]]
		}[keyof T] extends infer E
		? E extends [infer K, infer V]
			? K extends string | number
				? [`${K}`, V]
				: never
			: never
		: never
	: never

type Entry<T extends {}> = T extends readonly [unknown, ...unknown[]]
	? TupleEntry<T>
	: T extends ReadonlyArray<infer U>
		? [`${number}`, U]
		: ObjectEntry<T>

/**
 * A type-preserving version of `Object.entries`.
 * @param obj - Any object.
 * @returns An array of key-value pairs with their types preserved.
 *
 * @example Immutable
 * ```ts
 * const foo2 = { a: 1, b: '✨' } as const
 * entries(foo2) // (['a', 1] | ['b', '✨'])[]
 * Object.entries(foo2) // [string, 1 | '✨'][]
 * ```
 *
 * @example Mutable
 * ```ts
 * const foo1 = { a: 1, b: '✨' }
 * entries(foo1) // ['a', number] | ['b', string])[]
 * Object.entries(foo1) // [string, string | number][]
 * ```
 */
export function entries<const T extends {}>(object: T) {
	if (typeof object !== 'object' || object === null) {
		console.error('Error: Invalid object', object)
		throw new Error('`entries()` util called with invalid object: ' + object)
	}

	return Object.entries(object) as unknown as ReadonlyArray<Entry<T>>
}

/**
 * A type-preserving version of `Object.keys`.
 * @param obj - Any object.
 * @returns An array of the keys with their types preserved.
 *
 * @example Immutable
 * ```ts
 * const foo2 = { a: 1, b: '✨' } as const
 * keys(foo2) // ('a' | 'b')[]
 * Object.keys(foo2) // string[]
 * ```
 *
 * @example Mutable
 * ```ts
 * const foo1 = { a: 1, b: '✨' }
 * keys(foo1) // readonly ('a' | 'b')[]
 * Object.keys(foo1) // string[]
 * ```
 */
export function keys<T extends {}>(object: T): ReadonlyArray<keyof T> {
	if (typeof object !== 'object' && object === null) {
		console.error('Error: Invalid object', object)
		throw new Error('`keys()` util called with invalid object.')
	}
	return Object.keys(object) as unknown as ReadonlyArray<keyof T>
}

/**
 * A type-preserving version of `Object.values`.
 * @param obj - Any object.
 * @returns An array of values with their types preserved.
 *
 * @example Immutable
 * ```ts
 * const foo2 = { a: 1, b: '✨' } as const
 * values(foo2) // (1 | '✨')[]
 * Object.values(foo2) // (1 | '✨')[]
 * ```
 *
 * @example Mutable
 * ```ts
 * const foo1 = { a: 1, b: '✨' }
 * values(foo1) // readonly (number | string)[]
 * Object.values(foo1) // (number | string)[]
 * ```
 */
export function values<T extends {}>(object: T): ReadonlyArray<T[keyof T]> {
	if (typeof object !== 'object' && object === null) {
		console.error('Error: Invalid object', object)
		throw new Error('`values()` util called with invalid object.')
	}
	return Object.values(object) as unknown as ReadonlyArray<T[keyof T]>
}
