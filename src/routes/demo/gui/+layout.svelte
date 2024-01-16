<script lang="ts">
	import ThemeToggle from '$lib/components/ThemeToggle.svelte'
	import ThemerComponent from '$lib/theme/Themer.svelte'
	import { Themer } from '$lib/theme/Themer'
	import { theme } from '$lib/theme/theme'
	import { onMount } from 'svelte'

	let themer: Themer

	onMount(() => {
		themer = new Themer({
			mode: $theme,
		})

		const unsub = theme.subscribe((v) => {
			const color = v === 'light' ? 'white' : 'black'
			themer.mode.set(v)
			document.body.style.backgroundColor = color
			document.documentElement.style.backgroundColor = color
		})

		return () => {
			unsub()
			themer.dispose()
		}
	})
</script>

<div style="position: fixed; right: 1rem; top: 1rem;">
	<ThemeToggle />
</div>

{#if themer}
	<ThemerComponent {themer} --right="2rem" --top="-.75rem" />
{/if}

<slot />
