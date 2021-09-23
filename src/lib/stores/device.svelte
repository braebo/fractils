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
</script>

<svelte:window bind:innerHeight={$screenH} bind:innerWidth={$screenW} bind:scrollY={$scrollY} />
