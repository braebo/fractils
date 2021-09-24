<script lang="ts">
	import { toggleTheme, initTheme, theme } from '$lib'
	import { expoOut } from 'svelte/easing'
	import { fly } from 'svelte/transition'
	import { browser } from '$app/env'
	import { onMount } from 'svelte'

	/**
	 * disables _initTheme()
	 * @defaultValue true
	 */
	export let init = true

	export let config = { y: -35, duration: 1000, easing: expoOut }

	onMount(() => {
		if (init && browser) initTheme()
	})
</script>

<div class="wrapper" on:click={toggleTheme}>
	<slot>
		{#key $theme}
			<div class="icon" transition:fly={config}>
				{#if $theme === 'light'}
					<slot name="light">🔆</slot>
				{/if}
				{#if $theme === 'dark'}
					<slot name="dark">🌙</slot>
				{/if}
			</div>
		{/key}
	</slot>
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
