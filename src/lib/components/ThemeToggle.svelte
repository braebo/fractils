<script lang="ts">
	import type { toggleTheme, initTheme, theme, browser } from '$lib'
	import { expoOut } from 'svelte/easing'
	import { fly } from 'svelte/transition'
	import { onMount } from 'svelte'

	let _toggleTheme: typeof toggleTheme | null = null,
		_initTheme: typeof initTheme | null = null,
		_theme: typeof theme | null = null,
		_browser: typeof browser | null = null

	async function initialize() {
		const { toggleTheme, initTheme, theme, browser } = await import('../')
		_toggleTheme = toggleTheme
		_initTheme = initTheme
		_theme = theme
		_browser = browser
	}

	/**
	 * disables _initTheme()
	 * @defaultValue true
	 */
	export let init = true

	onMount(() => {
		initialize()
		if (init && _browser && _initTheme) _initTheme()
	})
</script>

<div on:click={() => (_toggleTheme ? _toggleTheme() : null)}>
	<slot>
		{#if _theme}
			{#key _theme}
				<div class="icon" transition:fly={{ y: 20, easing: expoOut }}>
					{$_theme == 'light' ? '🌙' : '☀️'}
				</div>
			{/key}
		{/if}
	</slot>
</div>

<style>
	.icon {
		position: absolute;
		bottom: 15px;
		left: 20px;

		font-size: 1rem;

		background-color: transparent;

		pointer-events: none;
	}
</style>
