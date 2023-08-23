<script lang="ts">
	import { scrollY, mobile } from '../stores/Device.svelte';
	import { onDestroy, onMount, tick } from 'svelte';
	import { mapRange } from '../utils/mapRange.js';

	/**
	 * The scrollbar root element or it's query selector.
	 * @default `document.body`
	 */
	export let root: string | Element | null = null;

	/**
	 * Destroys the component.
	 * @default `true` on mobile if not overridden.
	 * @note This component only works on viewport-sized elements.
	 */
	export let disabled: boolean;

	/**
	 * % of the scrollbar track to pad at the top and bottom.
	 * @default `0.2`
	 */
	export const padding = 0.2;
	$: disabled = disabled || $mobile;

	let viewHeight: number;
	let containerHeight: number;
	let ratio: number;
	let scrollbarHeight: number;
	let scrollbarHeightRatio: number;
	let scrollbarOffset: number = 0;
	let scrollPercentage: number;

	onMount(async () => {
		if (typeof root === 'string') {
			root = document.querySelector(root);
		}

		if (!root) {
			const userDefinedroot = document.querySelector('#scrollbar-root');
			root = userDefinedroot ?? document.body;
		}

		root!.id += ' scrollbar-root';
		update();
	});

	async function update() {
		if (disabled) return;
		await tick();
		viewHeight = window.innerHeight;
		ratio = parseFloat((viewHeight / containerHeight).toFixed(3));
		scrollbarHeight = Math.max(Math.round(viewHeight * ratio), 25);
		scrollbarHeightRatio = parseFloat((scrollbarHeight / viewHeight).toFixed(4)) * 100;
		scrollbarOffset = viewHeight / scrollbarHeightRatio;
		containerHeight = (root as Element).getBoundingClientRect().height;
		scrollPercentage = mapRange($scrollY, 0, containerHeight, 0 + padding, 100 - padding * 2);

		showScrollbar();
	}

	let reveal = false;
	let timer: NodeJS.Timeout;

	function showScrollbar() {
		if (timer) clearTimeout(timer);
		reveal = true;
		timer = setTimeout(() => {
			reveal = false;
		}, 1000);
	}

	onDestroy(() => clearTimeout(timer));
</script>

<svelte:window on:scroll={() => update()} />

{#if !disabled}
	<div
		class:reveal
		id="scrollbar"
		style="--scrollbar-height: {scrollbarHeight}px; top: {scrollPercentage}%"
	/>
{/if}

<style>
	:global(body::-webkit-scrollbar) {
		display: none;
	}

	@-moz-document url-prefix() {
		:global(html) {
			scrollbar-width: none;
		}
	}

	#scrollbar {
		position: fixed;
		right: 5px;
		z-index: 9999;

		margin: auto;
		width: 7px;
		height: var(--scrollbar-height);

		background: var(--color, #555);
		border-radius: 20px;
		opacity: 0;

		overflow: hidden;
		transition: opacity 0.25s;
	}
	.reveal {
		opacity: 1 !important;
	}
</style>
