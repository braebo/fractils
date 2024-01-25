<!-- 
	@component
	A custom range input slider component.
 -->

<script lang="ts">
	import { decimalToPow } from '../utils/decimalToPow'
	import { createEventDispatcher, tick } from 'svelte'
	import { truncate as trunc } from '../utils/truncate'
	import { mapRange } from '../utils/mapRange'
	import { clamp } from '../utils/clamp'
	import { onDestroy } from 'svelte'
	import { BROWSER } from 'esm-env'

	const dispatch = createEventDispatcher()

	interface $$Props {
		/**
		 * The value to be controled by the slider.
		 */
		value: number
		/**
		 * The minimum value allowed.
		 */
		min?: number
		/**
		 * The maximum value allowed.
		 */
		max?: number
		/**
		 * The amount to increment each change.
		 */
		step?: number
		/**
		 * An optional title to be displayed above the slider.
		 */
		name?: string
		/**
		 * Whether the slider should be vertical.
		 */
		vertical?: boolean
		/**
		 * Whether to truncate the value to the step.
		 */
		truncate?: boolean
		/**
		 * Callback function to be called on change.  Passes the updated value as an argument (and expects it to be returned).
		 */
		callback?: (value: number) => number
	}

	interface $$Events {
		/**
		 * Triggered when the slider value changes. Contains the new value, `event.detail.value`.
		 * @remarks
		 * If the `callback` prop is set, the value will be the result of the callback.
		 */
		change: { value: number }
	}

	export let value: number
	export let name = ''
	export let min = 0
	export let max = 1
	export let step = 0.01
	export let vertical = false
	export let truncate = true
	export let callback: ((v: number) => number) | undefined = undefined

	let el: HTMLElement
	let track: HTMLElement
	let thumb: HTMLElement
	let dragging = false

	const thumbWidth = 12

	$: clientWidth = el?.clientWidth ?? 100
	$: progress = mapRange(value, min, max, 1, clientWidth - thumbWidth)

	/**
	 * The last value of the slider before it's truncated.
	 */
	let targetValue = value

	/**
	 * Calculates progress when clicking the track (as opposed to dragging the thumb).
	 */
	const getMouseProgress = (e: MouseEvent) => {
		if (!el) return

		const mouse = e.clientX
		const { left } = el.getBoundingClientRect()
		const relativeX = mouse - left

		const normalizedProgress = mapRange(relativeX, 0, el.clientWidth, 0, 100)

		targetValue = clamp(mapRange(normalizedProgress, 0, 100, min, max), min, max)

		return targetValue
	}

	const mouseUp = () => {
		dragging = false

		window.addEventListener('mousemove', mouseMove)

		el.style.cursor = 'pointer'
		track.style.cursor = 'pointer'
		thumb.style.cursor = 'grab'
	}

	const mouseDown = (e: MouseEvent) => {
		dragging = true

		window.addEventListener('mouseup', mouseUp, { once: true })
		window.addEventListener('mousemove', mouseMove)

		el.style.cursor = 'grabbing'
		el.parentElement?.style.setProperty('cursor', 'grabbing')
		track.style.cursor = 'grabbing'
		thumb.style.cursor = 'grabbing'

		const targetValue = getMouseProgress(e)
		if (!targetValue) return
		updateValue(targetValue)
	}

	/**
	 * Most recent update time. Used to throttle the mousemove event.
	 */
	let last = performance.now()
	const mouseMove = async (e: MouseEvent) => {
		if (!dragging || !el) return
		await tick()
		e.preventDefault()

		const targetValue = getMouseProgress(e)
		if (!targetValue) return

		updateValue(targetValue)

		// Continue in case this is a drag operation.
		mouseDown(e)

		const now = performance.now()
		if (now > last + 1) {
			updateValue(targetValue)
		}
		last = now
	}

	const updateValue = (v: number) => {
		let newValue = v

		// Only update if the value has changed.
		if (newValue === value) return

		// Only update if the value changed by the step amount.
		if (Math.abs(newValue - value) < step) return

		if (truncate) newValue = trunc(newValue, decimalToPow(step))

		if (callback) newValue = callback(newValue)

		dispatch('change', { detail: { value: newValue } })

		value = newValue
	}

	onDestroy(() => {
		if (!BROWSER) return
		window?.removeEventListener('mousemove', mouseMove)
		window?.removeEventListener('mouseup', mouseUp)
	})
</script>

<div
	class="range"
	class:vertical
	role="slider"
	bind:this={el}
	on:pointerdown={mouseDown}
	style:--thumb-width="{thumbWidth}px"
	draggable="false"
	aria-valuenow={value}
	data-name={name}
	tabindex="0"
>
	<div
		class="thumb"
		bind:this={thumb}
		on:pointerdown|stopPropagation|capture={mouseDown}
		style:left="{progress}px"
		draggable="false"
	/>
	<div class="track" bind:this={track} style:clip-path="0 {progress} 0 0" draggable="false" />
</div>

<style lang="scss">
	.range {
		position: relative;
		display: flex;

		width: 100%;

		background: none;

		user-select: none;

		&:focus {
			outline: none;
		}
		&:hover .track {
			border-color: var(--fg-d);
		}
	}

	.track {
		width: 100%;
		height: 15px;

		border: 0.2px solid var(--bg-a);
		border-radius: 50px;
		background: var(--bg-d);
		box-shadow: 0 2px 3px 0 rgba(#000, 0.5);

		cursor: pointer;
		transition: 200ms;
	}

	.thumb {
		position: absolute;
		top: 0;
		bottom: 0;
		margin: auto;

		width: var(--thumb-width);
		height: var(--thumb-width);

		border: 1px solid var(--bg-d);
		border-radius: 20px;
		background: var(--fg-a);

		cursor: grab;
		transition: background 0.3s;
		appearance: none;
		appearance: none;

		&:focus::-webkit-slider-thumb {
			background: var(--brand-a);
		}
	}
</style>
