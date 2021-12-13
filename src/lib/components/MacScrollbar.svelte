<script lang="ts">
	import { scrollY, mobile } from '$lib/stores'
	import { onMount, tick } from 'svelte'
	import { mapRange } from '$lib/utils'

	// TODO: Expand and document config options
	export let root: string | Element | null = null
	export let disabled: boolean
	$: disabled = disabled || $mobile

	let viewHeight,
		containerHeight,
		ratio,
		scrollbarHeight,
		scrollbarHeightRatio,
		scrollbarOffset,
		scrollPercentage

	onMount(async () => {
		if (typeof root === 'string') {
			root = document.querySelector(root)
		}
		if (!root) {
			const userDefinedroot = document.querySelector('#scroll-root')
			root = userDefinedroot ? userDefinedroot : document.getElementById('svelte')
		}
		root!.id += ' scrollbar-root'
		update()
	})

	async function update() {
		if (disabled) return
		await tick()
		viewHeight = window.innerHeight
		ratio = parseFloat((viewHeight / containerHeight).toFixed(3))
		scrollbarHeight = Math.max(Math.round(viewHeight * ratio), 25)
		scrollbarHeightRatio = parseFloat((scrollbarHeight / viewHeight).toFixed(4)) * 100
		scrollbarOffset = viewHeight / scrollbarHeightRatio
		containerHeight = (root as Element).getBoundingClientRect().height
		scrollPercentage = mapRange($scrollY, 0, containerHeight, 0, 100)

		showScrollbar()
	}

	let reveal = false
	let timer: NodeJS.Timeout | null = null

	function showScrollbar() {
		if (timer) clearTimeout(timer)
		reveal = true
		timer = setTimeout(() => {
			reveal = false
		}, 1000)
	}
</script>

<svelte:window on:scroll={() => update()} />

{#if !disabled}
	<divspo
		class:reveal
		id="scrollbar"
		style="--scrollbar-height: {scrollbarHeight}px; top: {scrollPercentage}%"
	/>
{/if}

<style>
	:global(body::-webkit-scrollbar) {
		display: none;
		/* IE and Edge */
		-ms-overflow-style: none;
		/* Firefox */
		scrollbar-width: none;
	}
	:global(#scrollbar-root) {
		flex-grow: 1;

		height: 100%;
	}
	#scrollbar {
		position: fixed;
		right: 5px;
		z-index: 9999;

		margin: auto;
		width: 7px;
		height: var(--scrollbar-height);

		background: #00000077;
		border-radius: 20px;
		opacity: 0;

		overflow: hidden;
		transition: opacity 0.25s;
	}
	.reveal {
		opacity: 1 !important;
	}
</style>
