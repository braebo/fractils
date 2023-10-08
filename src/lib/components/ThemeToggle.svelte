<!-- 
	@component
	A theme toggle button with slots for light and dark mode icons.
 -->

<script lang="ts">
	import { theme, initTheme, toggleTheme } from '../theme/theme';
	import { createEventDispatcher } from 'svelte';
	import { expoOut } from 'svelte/easing';
	import { fly } from 'svelte/transition';

	const dispatch = createEventDispatcher();

	interface $$Props {
		/**
		 * Whether `initTheme` should be called automatically.
		 * @default true
		 */
		init?: boolean;
		/**
		 * Icon transition animation options.
		 * @default { y: -35, duration: 1000, easing: expoOut }
		 */
		transitionOptions?: { y: number; duration: number; easing: (t: number) => number };
	}

	interface $$Events {
		/**
		 * Fires when the toggle is clicked and provides `event.detail.theme` as the new theme.
		 */
		toggle: CustomEvent<{ theme: 'light' | 'dark' }>;
	}

	export let init = true;

	const config = { y: -35, duration: 1000, easing: expoOut };

	let ready = false;
	if (init) initTheme().then(() => (ready = true));
</script>

<button
	class="wrapper"
	on:mousedown|capture|preventDefault|stopPropagation={() => {
		toggleTheme();
		dispatch('click', {
			detail: {
				theme: $theme,
			},
		});
	}}
>
	{#if ready}
		<slot>
			{#key $theme}
				<div class="icon" transition:fly={config}>
					{#if $theme === 'light'}
						<slot name="light">🌙</slot>
					{:else if $theme === 'dark'}
						<slot name="dark">
							<span style:filter="hue-rotate(-40deg) saturate(0.5)"> 🔆 </span>
						</slot>
					{/if}
				</div>
			{/key}
		</slot>
	{/if}
</button>

<style>
	.wrapper {
		all: unset;
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
