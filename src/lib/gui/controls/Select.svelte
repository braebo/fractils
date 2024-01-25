<script lang="ts" generics="V">
	import type { Unsubscriber } from 'svelte/motion'
	import type { Writable } from 'svelte/store'

	import Froggo from '../../components/Froggo.svelte'
	import { get, writable } from 'svelte/store'
	import { onMount, onDestroy } from 'svelte'
	import { state } from '../../utils/state'

	type MaybeStore<T> = T | Writable<T>

	// todo better type cba rn lol rekt
	// export let key: string
	export let key: keyof V | undefined = undefined

	export let value: MaybeStore<V>
	export let options: MaybeStore<V[]>

	// todo because right mate what's happened is that svelte right like doesn't know like that we wanna be reactive here like,
	// so basically mate we need to like react to store changes right but like what's the least aids way to do that right? who knows
	// becasue I don't seem to know shit apparently I am like a muppet in a big ocean of druggy fractal mess and I forgot my life jacket
	// but it wouldn't matter anyway because the sea is actually not a sea it's like a big pile of auto boilerplate that he thought might fix
	// that problem for some reason so like idk what to do about the whole thing ywims ygmyslslhatb (you get me you silly little sausage little headass type beat) :)
	let m_options = map(options)
	$: console.log({ m_options })

	let unsub = () => {}

	$: if (isStore(options)) {
		unsub()
		unsub = options.subscribe((v) => {
			m_options = map(v)
		})
	} else {
		unsub()
		map(options)
	}

	onDestroy(() => {
		unsub()
	})

	function map(options: MaybeStore<V[]>) {
		const u_options = isStore(options) ? get(options) : options

		return u_options.map((option): { key: string; value: V } => {
			if (option && typeof option == 'object' && !Array.isArray(option)) {
				if (typeof key === 'undefined') {
					throw new Error('"key" is required when using objects as options')
				}

				if (!(key in option)) {
					throw new Error('key does not exist in option')
				}

				return {
					key: `${option[key]}`,
					value: option,
				}
			}

			return {
				key: `${option}`,
				value: option,
			}

			// if (option === null) throw new Error('go away typescript');

			// return {
			// 	key: `${typeof option == 'object' && !Array.isArray(option) ? option[key] : option}`,
			// 	value: option
			// }
		})

		// return u_options.map((option): { key: string, value: V } => {
		// 	if (option === null) throw new Error('go away typescript');

		// 	return {
		// 		key: `${typeof option == 'object' && !Array.isArray(option) ? option[key] : option}`,
		// 		value: option
		// 	}
		// })
	}

	function change(event: { currentTarget: HTMLSelectElement }) {
		const item = m_options.find(({ key }) => key == event.currentTarget.value)
		if (!item) return

		if (isStore(value)) {
			value.set(item.value)
		} else {
			value = item.value
		}
	}

	// export let goodValue
	interface goodValue {
		value: V
		options: V[]
	}

	interface goodValueStore {
		value: Writable<V>
		options: Writable<V[]>
	}

	type GoodValue = goodValue | goodValueStore

	// type T = V extends Writable<goodValueStore> ? goodValue : never
	type K = keyof V

	// export let v = { title: 'wow' } as V
	export let v = { title: 'wow' } as V
	// export let o = [{ title: 'wow' }] as V[]
	export let o = [{ title: 'wow' }] as V[]
	// export let k = 'title' as K
	export let k = 'title' as K

	const vIsObj = v && typeof v === 'object'
	const vIsKey = k && vIsObj && v && typeof v === 'object' && k in v

	function getV(): V {
		// if (vIsKey)
		return isStore<V>(v) ? get(v) : v
	}
	function setV(nv: V) {
		if (isStore<V>(v)) {
			v.set(nv)
		} else {
			v = nv
		}
	}

	function getO() {
		return isStore(o) ? (get(o) as V[]) : (o as V[])
	}

	function getOK(key: K): V {
		const arr = isStore(o) ? (get(o) as V[]) : (o as V[])
		return arr.find((o) => o[key] === v?.[key]) ?? (arr[0] as V)
	}

	function u(e: Event): V {
		const newV = (e.target as HTMLSelectElement).value as V

		if (key) {
			const newO = getO()
			const newOK = getOK(key)
			setV(newOK)
		} else {
			setV(newV)
		}

		return newV
	}

	const p = (v: V) => {
		return isStore(v) ? get(v) : v
	}

	let unsubs: Unsubscriber[] = []

	function maybeSubscribe() {
		if (isStore(v)) {
			unsubs.push(
				v.subscribe((nv) => {
					console.log('nv', nv)
				})
			)
		}
	}
	
	
	// $: vv = isStore<V>(v) ? get(v) : v
	// $: oo = isStore(o) ? get(o) : o
	// $: ss = getFromO(k)

	function m() {
		return {
			label: key ?? getV(),
			value: getV(),
			options: getO(),
		}
	}

	function isStore<J>(obj: any): obj is Writable<J> {
		return 'set' in obj && 'subscribe' in obj
		// return false;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
	}

	// // prettier-ignore
	// type KeyType = keyof T
	// // type KeyType<T> =
	// // 	T extends any[] ? never :
	// // 	T extends object ? keyof T :
	// // 	undefined;

	// // type KeyType<T> = T extends object ? T extends any[] ? never : keyof T : never;
	// // type KeyType<YourNan> = YourNan extends object ? Key : never;

	// // interface $$Props {
	// // 	value: T | Writable<T>
	// // 	options: T[]
	// // 	key: KeyType<T>
	// // }

	// export let value: T | Writable<T>
	// // type GetTheThingy<Store> = Store extends Writable<infer Type> ? Type : never
	// export let value: T | Writable<T>
	// // let selected: typeof value | GetTheThingy<T>
	// let options: T[] | Writable<T[]>
	// // export let key: KeyType<T>
	// export let key: keyof T

	// const isObject = value && key && typeof value === 'object' && key in value

	// if (isObject) {
	// 	if (isStore(value)) {
	// 		selected = get(value)[key]
	// 	}
	// }

	// let selectEl: HTMLSelectElement
	// let unsubscribe: Unsubscriber = () => void 0

	// if (isStore(value)) {
	// 	unsubscribe = value.subscribe((v) => {
	// 		selected = key ? v[key] : v

	// 		selectEl.setAttribute('value', String(v[key!]))
	// 	})
	// }

	// // Error for `key`: Type 'undefined' is not assignable to type 'T extends Record<string | number | symbol, any> ? keyof T : undefined'.ts(2322)

	// function handleSelection(event: Event) {
	// 	const newSelection = (event.target as HTMLSelectElement)?.value

	// 	console.log('newValue', newSelection)

	// 	// const selectedOption = options.find((option) => {
	// 	// 	// console.log({ key, option, 'option[key]': option[key] })
	// 	// })
	// 	const selectedOption = getOption(newSelection as T)

	// 	console.log('selectedOption', selectedOption)

	// 	if (typeof selectedOption === 'undefined') {
	// 		throw new Error('selectedOption is undefined')
	// 	}

	// 	if (isStore(value)) {
	// 		value.set(selectedOption)
	// 	} else {
	// 		value = selectedOption
	// 		selectEl.setAttribute('value', String(selectedOption))
	// 	}
	// }

	// function getOption(option: V) {
	// 	const arr = isStore(options) ? get(options) : options
	// 	arr.find((o) => o[k] === option[k])
	// 	if (isStore(options)) {
	// 		return options
	// 	} else {
	// 		return value
	// 	}
	// }

	// onMount(() => {
	// 	if (Math.random() < 0.2) {
	// 		document.write('rekt')
	// 	}
	// })
</script>

<!-- {#if !isStore(options)} -->

<select on:change={change}>
	{#each m_options as { key }}
		<option value={key}>
			{key}
		</option>
	{/each}
</select>

<Froggo />

<!-- <select bind:this={selectEl} on:change={handleSelection} value>
		{#each options as option}
			<option value={key ? option[key] : option}>
				{key ? option[key] : option}
			</option>
		{/each}
	</select> -->

<!-- {/if} -->
