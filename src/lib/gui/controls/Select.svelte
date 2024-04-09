<script lang="ts" generics="V">
	import type { Writable } from 'svelte/store'

	import Froggo from '../../components/Froggo.svelte'
	import { onDestroy } from 'svelte'
	import { get } from 'svelte/store'

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
		unsub = options.subscribe(v => {
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
		})
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

	function isStore<J>(obj: any): obj is Writable<J> {
		return 'set' in obj && 'subscribe' in obj
	}
</script>

<select on:change={change}>
	{#each m_options as { key }}
		<option value={key}>
			{key}
		</option>
	{/each}
</select>

<Froggo />
