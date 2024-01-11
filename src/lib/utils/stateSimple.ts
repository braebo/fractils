import { get, writable, type Writable } from 'svelte/store'

type PrimitiveState<T> = Writable<T> & {
	get(): T
	readonly value: T
}

type ArrayState<T> = PrimitiveState<T[]> & {
	push: (item: T) => void
}

type State<T> = T extends Array<infer U> ? ArrayState<U> : PrimitiveState<T>

export function state<T>(defaultValue: T, options?: Partial<State<T>>) {
	const store = writable(defaultValue)

	function isArrayState(_: unknown): _ is ArrayState<T> {
		return Array.isArray(defaultValue)
	}

	if (isArrayState(store)) {
		store.push = (item: T) => {
			store.update((arr) => [...(arr as T[]), item] as T)
		}
	}

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
