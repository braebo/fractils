<script lang="ts">
	import { toggleTheme, initTheme, theme, browser } from '$lib'
	import { expoOut } from 'svelte/easing'
	import { fly } from 'svelte/transition'

	/**
	 * disables initTheme()
	 * @defaultValue true
	 */
	export let init = true
	if (init && browser) initTheme()
</script>

<div on:click={() => toggleTheme()}>
	<slot>
		{#key theme}
			<div class="icon" transition:fly={{ y: 20, easing: expoOut }}>
				{$theme == 'light' ? '🌙' : '☀️'}
			</div>
		{/key}
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
