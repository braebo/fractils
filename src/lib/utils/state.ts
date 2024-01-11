import { get, writable, type Writable } from 'svelte/store'

export interface PrimitiveState<T> extends Writable<T> {
	get(): T
	readonly value: T
}

interface ArrayState<T> extends PrimitiveState<T[]> {
	push: (item: T) => void
}

interface MapState<K, V> extends PrimitiveState<Map<K, V>> {
	/**
	 * Set value and inform subscribers.
	 *
	 * Note: To update a map, use the `setKey` and `deleteKey` methods.
	 */
	set: (value: Map<K, V>) => void
	setKey: (key: K, value: V) => void
	deleteKey: (key: K) => void
}

interface SetState<T> extends PrimitiveState<Set<T>> {
	add: (item: T) => void
	delete: (item: T) => void
}

type UnionToIntersection<U> = (U extends any ? (x: U) => void : never) extends (x: infer I) => void
	? I
	: never

type IsUnion<T> = [T] extends [UnionToIntersection<T>] ? false : true

type UnionState<T> = { set: (value: T) => void } & Omit<PrimitiveState<T>, 'set'>

export type State<T> = IsUnion<T> extends true
	? UnionState<T>
	: T extends Array<infer U>
		? ArrayState<U>
		: T extends Map<infer K, infer V>
			? MapState<K, V>
			: T extends Set<infer U>
				? SetState<U>
				: PrimitiveState<T>

/**
 * An advanced store factory that adds support for Maps, Sets, and Arrays
 * (enabling methods `.push` and `.add`), as well as a second argument for
 * overriding the default store methods like `.set` and `.update`.  It also
 * adds a `.get` method for retrieving the current value of the store without
 * subscribing to it.
 *
 * @remarks `state` boasts comprehensive type safety, leveraging conditional
 * types and inference to provide the correct types and methods for the store
 * based on the `defaultValue` argument (or the provided generic type).
 *
 * @param defaultValue The default value of the store.
 * @param options Optional overrides for the default store methods.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 * 	import { state } from 'fractils'
 *
 * 	const foo = state([1, 2, 3])
 * 	foo.push(4)
 * 	foo.push('5') // Type error
 *
 * 	const bar = state(new Map<string, number>())
 * 	bar.setKey('count', 21) // note: `set` is taken, so we use `setKey` and `deleteKey`
 *
 * 	const baz = state(new Set<number>())
 * 	baz.add(5)
 *  baz.push(6) // Type error
 * </script>
 *
 * <h1>{$foo} {$bar} {$baz}</h1>
 * ```
 */
export function state<T>(defaultValue: T, options?: Partial<Writable<T>>): State<T> {
	const store = writable(defaultValue)

	function enhanceStore<S>(enhancer: (store: State<S>) => void) {
		if (enhancer) enhancer(store as unknown as State<S>)
	}

	enhanceStore<T[]>((store) => {
		if (Array.isArray(defaultValue)) {
			store.push = (item: any) => {
				store.update((arr) => [...arr, item])
			}
		}
	})

	enhanceStore<Map<any, any>>((store) => {
		if (defaultValue instanceof Map) {
			store.setKey = (key, value) => {
				store.update((map) => new Map(map).set(key, value))
			}
			store.deleteKey = (key) => {
				store.update((map) => {
					const newMap = new Map(map)
					newMap.delete(key)
					return newMap
				})
			}
		}
	})

	enhanceStore<Set<any>>((store) => {
		if (defaultValue instanceof Set) {
			store.add = (item) => {
				store.update((set) => new Set(set).add(item))
			}
			store.delete = (item) => {
				store.update((set) => {
					const newSet = new Set(set)
					newSet.delete(item)
					return newSet
				})
			}
		}
	})

	return {
		...store,
		set: options?.set ?? store.set,
		update: options?.update ?? store.update,
		subscribe: options?.subscribe ?? store.subscribe,
		get() {
			return get(store)
		},
		get value() {
			return get(store)
		},
	} as State<T>
}

//- Test cases

const numArray = state([1, 2, 3])
numArray.push(4)

const myMap = state(new Map<string, number>())
myMap.setKey('key1', 100)
myMap.set(new Map())

const mySet = state(new Set<number>())
mySet.set(new Set())
mySet.add(5)

const myString = state('hello')
myString.set('world')

type MyType = 'foo' | 'bar'
const myType = state<MyType>('foo')
myType.set('bar') // ERROR: Argument of type 'string' is not assignable to parameter of type 'never'.ts(2345)
