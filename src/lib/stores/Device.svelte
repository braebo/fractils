<!-- 
	@component
	A series of device related stores.
	@see {@link https://fractils.fractal-hq.com/#Device Device documentation}
 -->
<script context="module" lang="ts">
	import { writable, derived } from 'svelte/store'

	/**
	 * Tracks the screen height.
	 */
	export const screenH = writable(900)

	/**
	 * Tracks the screen width.
	 */
	export const screenW = writable(900)

	/**
	 * Adjusts the $mobile 'breakpoint' threshold.
	 */
	export const mobileThreshold = writable(900)

	/**
	 * Detects screen width below 900px
	 */
	export const mobile = derived(
		[screenW, mobileThreshold],
		([$screenW, $mobileThreshold]) => $screenW < $mobileThreshold,
	)

	/**
	 * Tracks the users scroll position.
	 */
	export const scrollY = writable(0)

	/**
	 * Tracks the users x and y mouse positions.
	 */
	export const mouse = writable({ x: 0, y: 0 })

	let frame: number
	const mouseMove = (e: MouseEvent) => {
		cancelAnimationFrame(frame)

		frame = requestAnimationFrame(() => {
			mouse.update(() => ({ x: e.clientX, y: e.clientY }))
		})
	}
</script>

<svelte:window
	on:mousemove={(e) => mouseMove(e)}
	bind:innerHeight={$screenH}
	bind:innerWidth={$screenW}
	bind:scrollY={$scrollY}
/>
