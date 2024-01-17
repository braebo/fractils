<!-- 
	@component
	Turns the scrollbar into a macOS-like scrollbar that only appears when scrolling (or when the user hovers over it).
	It aims to be fully functional and accessible.
 -->

<script lang="ts">
	import { scrollY, mobile } from '../stores/Device.svelte'
	import { onDestroy, onMount, tick } from 'svelte'
	import { stringify } from '../utils/stringify'
	import { mapRange } from '../utils/mapRange'
	import Code from './Code.svelte'

	/**
	 * Displays debug info when true.
	 */
	export let debug = false

	/**
	 * The scrollbar root element or it's query selector.
	 * @default document.body
	 */
	export let root: string | Element | null = null

	/**
	 * Destroys the component.
	 * @default `true` on mobile
	 * @note This component only works on viewport-sized elements.
	 */
	export let disabled: boolean | undefined = undefined

	/**
	 * % of the scrollbar track to pad at the top and bottom.
	 * @default 0.2
	 */
	export const padding: number = 0.2
	$: disabled = disabled || $mobile

	let viewHeight: number
	let containerHeight: number
	let ratio: number
	let scrollbarHeight: number
	let scrollbarHeightRatio: number
	let scrollPercentage: number
	let grabbing = false
	let hovering = false
	let scrollbarEl: HTMLElement

	function getRoot(root: string | Element | null): HTMLElement {
		if (typeof root === 'string') {
			root = document.querySelector(root)
		}

		root ??= document.querySelector('#scrollbar-root')

		if (!root) {
			let maybeSvelteRoot = document.body.firstChild as HTMLElement
			if (maybeSvelteRoot.id === 'svelte') {
				root ??= maybeSvelteRoot
			}

			root ??= document.body
		}

		return root as HTMLElement
	}

	async function update() {
		if (disabled) return
		await tick()
		viewHeight = window.innerHeight
		ratio = parseFloat((viewHeight / containerHeight).toFixed(3))
		scrollbarHeight = Math.max(Math.round(viewHeight * ratio), 25)
		scrollbarHeightRatio = parseFloat((scrollbarHeight / viewHeight).toFixed(4)) * 100
		containerHeight = (root as Element).getBoundingClientRect().height
		scrollPercentage = mapRange($scrollY, 0, containerHeight, 0 + padding, 100 - padding * 2)

		showScrollbar()
	}

	let reveal = false
	let timer: NodeJS.Timeout

	function showScrollbar() {
		if (timer) clearTimeout(timer)
		reveal = true
		timer = setTimeout(() => {
			if (!hovering) reveal = false
		}, 1000)
	}

	function grab() {
		grabbing = true
		scrollbarEl?.addEventListener('blur', blur, { once: true })

		if (typeof window === 'undefined') return

		window.addEventListener('mouseup', blur, { once: true })
		window.addEventListener('mousemove', move)
		window.addEventListener('touchmove', move)
	}

	function blur() {
		grabbing = false

		if (typeof window === 'undefined') return

		scrollbarEl?.removeEventListener('blur', blur)
		window.removeEventListener('mouseup', blur)
		window.removeEventListener('mousemove', move)
		window.removeEventListener('touchmove', move)
	}

	function move(
		e: MouseEvent | TouchEvent,
		options?: {
			force?: boolean
			behavior?: ScrollBehavior
		},
	) {
		const force = options?.force ?? false
		const behavior = options?.behavior ?? 'instant'
		if (!force && !grabbing) return

		const { clientY } = e instanceof MouseEvent ? e : e.touches[0]
		const y = mapRange(clientY, 0, screen.availHeight, 0, 100)
		window.scroll({
			top: mapRange(
				y,
				0,
				100,
				0,
				(root as Element)?.scrollHeight ?? document.documentElement.scrollHeight,
			),
			behavior,
		})
	}

	onMount(async () => {
		root = getRoot(root)

		await tick()

		update()
	})

	onDestroy(() => {
		clearTimeout(timer)
		blur()
	})
</script>

{#if debug}
	<div
		style="
	position: fixed;
	top: 1rem;
	right: 1rem;
"
	>
		{#key $scrollY}
			<Code
				lang="json5"
				text={stringify(
					{
						$scrollY,
						viewHeight,
						containerHeight,
						ratio,
						scrollbarHeight,
						scrollbarHeightRatio,
						scrollPercentage,
						grabbing,
						reveal,
						timer,
					},
					2,
				)}
			/>
		{/key}
	</div>
{/if}

<svelte:window on:scroll={() => update()} />

{#if !disabled}
	<div
		id="scrollbar-gutter"
		on:mouseover={() => {
			hovering = true
			showScrollbar()
		}}
		on:focus={() => {
			hovering = true
			showScrollbar()
		}}
		on:mouseout={() => {
			hovering = false
			showScrollbar()
		}}
		on:blur={() => {
			hovering = false
			showScrollbar()
		}}
		on:click={(e) => move(e, { force: true, behavior: 'smooth' })}
		on:mousedown|preventDefault={grab}
		on:mousemove={(e) => move(e, { behavior: 'instant' })}
		class:debug
		aria-hidden={true}
	/>
	<div
		class:reveal
		id="scrollbar"
		bind:this={scrollbarEl}
		style="--scrollbar-height: {scrollbarHeight}px; top: {scrollPercentage}%"
		on:mouseover={() => {
			hovering = true
			showScrollbar()
		}}
		on:focus={() => {
			hovering = true
			showScrollbar()
		}}
		on:mouseout={() => {
			hovering = false
			showScrollbar()
		}}
		on:blur={() => {
			hovering = false
			showScrollbar()
		}}
		on:mousedown|preventDefault={grab}
		on:touchstart={grab}
		on:mousemove={move}
		on:touchmove={() => {
			if (grabbing) {
				$scrollY = mapRange(
					scrollPercentage,
					0 + padding,
					100 - padding * 2,
					0,
					containerHeight - viewHeight,
				)
			}
		}}
		role="scrollbar"
		aria-controls="scrollbar-root"
		aria-valuenow={scrollPercentage}
		tabindex="0"
	/>
{/if}

<style lang="scss">
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

		user-select: contain;
		pointer-events: all;
	}
	.reveal {
		opacity: 1 !important;
	}

	#scrollbar-gutter {
		position: fixed;
		top: 0;
		right: 0;

		width: 15px;
		height: 100vh;

		pointer-events: all;
		z-index: 9998;

		&.debug {
			background: red;
		}
	}
</style>
