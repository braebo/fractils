<script lang="ts">
	import type { Toast } from './toast';

	import { createEventDispatcher, onMount } from 'svelte';
	import { tweened } from 'svelte/motion';
	import { get } from 'svelte/store';

	const dispatch = createEventDispatcher();

	export let toast: Toast;

	const progress = tweened(0, {
		duration: toast.duration,
	});

	progress.subscribe((v) => {
		if (v === 100) {
			complete();
		}
	});

	let paused = false;

	function pause() {
		if (paused) return;
		paused = true;
		progress.set(get(progress));
	}

	function unpause() {
		if (!paused) return;
		paused = false;
		progress.set(100, {
			// The remaining duration.
			duration: toast.duration - (get(progress) / 100) * toast.duration,
		});
	}

	function complete() {
		dispatch('complete', toast);
	}

	// Wait a hair, then set the progress to 100%.
	onMount(() => {
		setTimeout(() => {
			progress.set(100);
		}, 250);
	});
</script>

<div
	aria-hidden="true"
	class="toast-container"
	on:mouseover={pause}
	on:touchstart={pause}
	on:focus={pause}
	on:mouseout={unpause}
	on:blur={unpause}
>
	<div class="progress-outline" style="clip-path: inset(0 {$progress}% 0 0)" />

	{#if toast.href}
		<a href={toast.href} class="toast" class:error={toast.type === 'error'} on:click={complete}>
			<p class="message">{@html toast.message}</p>
		</a>
	{:else}
		<div class="toast" class:error={toast.type === 'error'}>
			<p class="message">{@html toast.message}</p>
		</div>
	{/if}
</div>

<style lang="scss">
	.toast-container {
		pointer-events: all;
	}

	.toast {
		all: unset;

		z-index: 100;

		position: relative;
		display: flex;

		padding: 0.5rem 1rem;
		margin: auto;
		width: 100%;

		background-color: var(--bg-c) !important;
		border-radius: var(--radius);
		box-shadow: var(--shadow-lg);

		.message {
			width: 100%;
			margin: auto;

			color: var(--fg-a);

			font-size: var(--font-sm);
		}

		&.error {
			outline: 2px solid tomato;

			text-align: center;
		}

		outline: 1px solid var(--theme-a);
		transition: 0.1s;
		&:hover,
		&:focus {
			outline-color: var(--fg-a);
		}
	}

	a {
		cursor: pointer !important;
	}

	.progress-outline {
		z-index: 99;

		position: absolute;
		top: 0;
		left: 0;
		right: 0;

		backface-visibility: hidden;

		min-height: calc(100% + 0.125rem);
		margin: auto;

		background: var(--fg-a);
		border-radius: var(--radius);
	}

	.toast-container:has(.toast:hover) .progress-outline {
		min-height: calc(100% + 0.2rem);
	}
</style>
