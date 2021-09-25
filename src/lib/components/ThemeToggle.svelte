<script lang="ts" context="module">
	// import { toggleTheme } from '$lib'
	// import { initTheme } from '$lib'
	// import { theme } from '$lib'

	import { expoOut } from 'svelte/easing'
	import { fly } from 'svelte/transition'
	import { writable } from 'svelte/store'
	import { browser } from '$app/env'
	import { onMount } from 'svelte'

	let _theme,
		_initTheme = () => {},
		_toggleTheme = () => {},
		unsubscribe = () => {},
		ready = false

	const load = async () => {
		if (browser) {
			// const t = await import('../theme')
			const { theme, initTheme, toggleTheme } = await import('../theme')
			console.log(theme)
			console.log(initTheme)
			console.log(toggleTheme)
			unsubscribe = theme.subscribe((value) => {
				_theme = value
			})
			_initTheme = initTheme
			_toggleTheme = toggleTheme
			ready = true
		}
	}

	/**
	 * disables _initTheme()
	 * @defaultValue true
	 */
	export const init = true

	export const config = { y: -35, duration: 1000, easing: expoOut }
</script>

<script>
	onMount(async () => {
		if (init && browser) {
			await load()
			_initTheme()
		}
		return unsubscribe
	})
</script>

{#if ready}
	<div class="wrapper" on:click={_toggleTheme}>
		<slot>
			{#key $_theme}
				<div class="icon" transition:fly={config}>
					{#if $_theme === 'light'}
						<slot name="light">🔆</slot>
					{/if}
					{#if $_theme === 'dark'}
						<slot name="dark">🌙</slot>
					{/if}
				</div>
			{/key}
		</slot>
	</div>
{/if}

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
