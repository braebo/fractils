<script>
	import { expoOut } from 'svelte/easing'
	import { fly } from 'svelte/transition'
	import { browser } from '$app/env'
	import { onMount } from 'svelte'

	let theme, currentTheme
	let initTheme = () => {}
	let toggleTheme = () => {}
	let unsubscribe = () => {}
	let ready = false

	const load = async () => {
		const t = await import('../theme')
		theme = t.theme
		unsubscribe = theme.subscribe((v) => (currentTheme = v))
		initTheme = t.initTheme
		toggleTheme = t.toggleTheme
	}

	/**
	 * disables _initTheme()
	 * @defaultValue true
	 */
	export const init = true

	export const config = { y: -35, duration: 1000, easing: expoOut }

	onMount(async () => {
		if (init && browser) {
			await load()
			initTheme()
			ready = true
		}
		return unsubscribe
	})
</script>

<div class="wrapper" on:click={toggleTheme}>
	{#if ready && currentTheme}
		<slot>
			{#key currentTheme}
				<div class="icon" transition:fly={config}>
					{#if currentTheme === 'light'}
						<slot name="light">🔆</slot>
					{/if}
					{#if currentTheme === 'dark'}
						<slot name="dark">🌙</slot>
					{/if}
				</div>
			{/key}
		</slot>
	{/if}
</div>

<style>
	.wrapper {
		display: flex;
		position: relative;
		align-items: center;
		justify-content: center;

		width: 2rem;
		height: 2rem;

		line-height: 2rem;

		border-radius: 100%;

		cursor: pointer;
	}
	.icon {
		position: absolute;

		font-size: 1.5rem;

		background-color: transparent;

		pointer-events: none;
		inset: 0;
	}
</style>
