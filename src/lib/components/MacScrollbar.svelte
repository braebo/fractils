<script>
	import { mapRange, scrollY } from '$lib'
	import { onMount, tick } from 'svelte'

	export let root

	let viewHeight, containerHeight

	let ratio, scrollbarHeight, scrollbarHeightRatio, scrollbarOffset, scrollPercentage

	onMount(async () => {
		if (!root) {
			const userDefinedroot = document.querySelector('#scroll-root')
			root = userDefinedroot ? userDefinedroot : document.getElementById('svelte')
		} else if (typeof root === 'string') {
			root = document.querySelector(root)
		}
		root.id += ' scrollbar-root'
		update()
	})

	async function update() {
		await tick()
		viewHeight = window.innerHeight
		ratio = parseFloat((viewHeight / containerHeight).toFixed(3))
		scrollbarHeight = Math.max(Math.round(viewHeight * ratio), 25)
		scrollbarHeightRatio = parseFloat((scrollbarHeight / viewHeight).toFixed(4)) * 100
		scrollbarOffset = viewHeight / scrollbarHeightRatio
		containerHeight = root.getBoundingClientRect().height
		scrollPercentage = mapRange($scrollY, 0, containerHeight, 0, 100)

		showScrollbar()
	}

	let reveal = false
	let timer = null

	function showScrollbar() {
		if (timer) clearTimeout(timer)
		reveal = true
		timer = setTimeout(() => {
			reveal = false
		}, 1000)
	}
</script>

<svelte:window on:scroll={update} />

<!-- <pre>{JSON.stringify(debugObj, null, 2)}</pre> -->
<div
	class:reveal
	id="scrollbar"
	style="--scrollbar-height: {scrollbarHeight}px; top: {scrollPercentage}%"
/>

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
		/* cursor: pointer; */
		position: fixed;
		right: 5px;
		margin: auto;
		width: 7px;
		height: var(--scrollbar-height);
		background: #0007;
		border-radius: 20px;
		overflow: hidden;
		opacity: 0;
		transition: opacity 0.25s;

		z-index: 9999;
	}
	.reveal {
		opacity: 1 !important;
	}

	/* pre {
		position: absolute;
		left: 0;
		top: 100px;
		color: white;
		z-index: 1;
	} */
</style>
