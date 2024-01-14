<!--
	@component A tooltip that appears on hover.

	@example
	```svelte
	<script>
		import { Tooltip } from 'fractils';
	</script>

	<Tooltip content="Hello World">
		<div class="hover-1"> Hover over me! </div>
	</Tooltip>
	```
-->

<script context="module">
	import { customAlphabet } from 'nanoid'
	const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 10)
</script>

<script lang="ts">
	import type { PopperElement, Instance } from 'tippy.js'
	import tippy, { sticky } from 'tippy.js'
	import { onMount } from 'svelte'

	/**
	 * Text content of the tooltip.
	 */
	export let content = 'Tooltip'

	/**
	 * Placement of the tooltip.
	 * @defaultValue 'right'
	 */
	export let placement: 'top' | 'right' | 'bottom' | 'left' | (string & {}) = 'right'

	/**
	 * Intro & outro delay in ms.
	 * @defaultValue [500, 100]
	 */
	export let delay: [number, number] = [500, 100]

	export let interactive = false

	/**
	 * Whether to show the arrow connecting the tooltip to the target.
	 */
	export let arrow = true

	/**
	 * X and Y offset in px.
	 * @defaultValue [10, 0]
	 */
	export let offset = [10, 0]

	/**
	 * Used to hide the tooltip.
	 */
	export let display: 'none' | 'contents' | (string & {}) = 'contents'

	export let instance: Instance<PopperElement> | undefined = undefined

	/**
	 * Unique ID to avoid collisions.
	 */
	const id = nanoid()

	onMount(() => {
		tippy.setDefaultProps({
			moveTransition: 'transform 0.2s ease-out',
			animation: 'shift-away-subtle',
			duration: [150, 100],
			plugins: [sticky],
			delay,
		})

		let selector = `#${id}`
		const targetEl = document.querySelector(selector)?.children[0]
		if (targetEl) {
			const childId = id + '_child'
			selector = `#${childId}`
			targetEl.setAttribute('id', childId)
		}

		// @ts-ignore
		tippy(selector, {
			content,
			interactive,
			placement,
			arrow,
			offset: [offset[1], offset[0]],
			delay,
		})

		const container = document.querySelector(selector)

		// @ts-ignore
		instance = container?._tippy
	})

	$: if (instance) instance.setContent(content)
</script>

<span {id} style="display: {display};" class="tippy-container">
	<slot />
</span>

<style global>
	#slot {
		width: 0;
		height: 0;
	}

	:global(.tippy-box[data-animation='fade'][data-state='hidden']) {
		opacity: 0;
	}

	:global(.tippy-box) {
		position: relative;

		color: var(--tooltip-color, var(--fg-b));
		border-radius: 0.25rem;
		outline: 0.03rem solid var(--bg-c);
		background: var(--tooltip-bg, var(--bg-a));
		box-shadow: 0 0.125rem 0.3125rem #0001;

		transition-property: transform, visibility, opacity;
		z-index: 1;
	}

	:global(.tippy-box[data-placement^='top'] > .tippy-arrow) {
		bottom: 0;
	}

	:global(.tippy-box[data-placement^='top'] > .tippy-arrow:before) {
		bottom: -0.4375rem;
		left: 0;

		border-width: 0.5rem 0.5rem 0;
		border-top-color: initial;

		transform-origin: center top;
	}

	:global(.tippy-box[data-placement^='bottom'] > .tippy-arrow) {
		top: 0;
	}

	:global(.tippy-box[data-placement^='bottom'] > .tippy-arrow:before) {
		top: -0.4375rem;
		left: 0;

		border-width: 0 0.5rem 0.5rem;
		border-bottom-color: initial;

		transform-origin: center bottom;
	}

	:global(.tippy-box[data-placement^='left'] > .tippy-arrow) {
		right: 0;
	}

	:global(.tippy-box[data-placement^='left'] > .tippy-arrow:before) {
		right: -0.4375rem;

		border-width: 0.5rem 0 0.5rem 0.5rem;
		border-left-color: initial;

		transform-origin: center left;
	}

	:global(.tippy-box[data-placement^='right'] > .tippy-arrow) {
		left: 0;
	}

	:global(.tippy-box[data-placement^='right'] > .tippy-arrow:before) {
		left: -0.4375rem;

		border-width: 0.5rem 0.5rem 0.5rem 0;
		border-right-color: initial;

		transform-origin: center right;
	}

	:global(.tippy-box[data-inertia][data-state='visible']) {
		transition-timing-function: cubic-bezier(0.54, 1.5, 0.38, 1.11);
	}

	:global(.tippy-arrow) {
		position: relative;

		width: 1rem;
		height: 1rem;

		color: var(--fg-a);

		z-index: 0;
	}

	:global(.tippy-arrow:before) {
		position: absolute;

		border-style: solid;
		border-color: transparent;

		content: '';
	}

	:global(.tippy-content) {
		position: relative;

		padding: 0.2rem 0.5rem;

		font-size: 0.75rem;
		font-family: var(--font-b);
		font-variation-settings: 'wght' 500;

		line-height: 1.4;
		letter-spacing: 0.5px;

		z-index: 1;
	}

	/* Animation */
	:global(.tippy-box[data-animation='shift-away-subtle'][data-state='hidden']) {
		opacity: 0;
	}
	:global(
			.tippy-box[data-animation='shift-away-subtle'][data-state='hidden'][data-placement^='top']
		) {
		transform: translateY(0.3125rem);
	}
	:global(
			.tippy-box[data-animation='shift-away-subtle'][data-state='hidden'][data-placement^='bottom']
		) {
		transform: translateY(-0.3125rem);
	}
	:global(
			.tippy-box[data-animation='shift-away-subtle'][data-state='hidden'][data-placement^='left']
		) {
		transform: translateX(0.3125rem);
	}
	:global(
			.tippy-box[data-animation='shift-away-subtle'][data-state='hidden'][data-placement^='right']
		) {
		transform: translateX(-0.3125rem);
	}
</style>
