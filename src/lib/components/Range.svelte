<!-- 
	@component
	A custom range input slider component.
	
	@prop `value: any` - The value to be controled by the slider.
	@prop `range: { min: number, max: number }` - The range of the slider.
	@prop `name: string` - The name of the value for its label.
	@prop `step: number` - The amount to increment each change.
	@prop `vertical?: boolean` - The amount to increment each change.
	@prop `truncate?: boolean` - Rounds decimals into whole numbers.
 -->
<script lang="ts">
	import { createEventDispatcher, tick } from 'svelte'
	import { mapRange } from '../utils/mapRange'
	import { clamp } from '../utils/clamp'
	import { onDestroy } from 'svelte'

	const dispatch = createEventDispatcher()

	interface $$Props {
		/**
		 * The value to be controled by the slider.
		 */
		value: number
		min?: number
		max?: number
		step?: number
		/**
		 * An optional title to be displayed above the slider.
		 */
		name?: string
		vertical?: boolean
		truncate?: boolean
	}

	export let value: number
	export let name = ''
	export let min = 0
	export let max = 1
	export let step = 0.001
	export let vertical = false
	export let truncate = false

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

		// targetValue += e.movementX * ((1 / clientWidth) * (max - min))

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
		if (truncate) v = Math.round(v)
		if (Math.abs(targetValue - value) > step) value = v
		dispatch('change', { detail: { value } })
	}

	onDestroy(() => {
		window.removeEventListener('mousemove', mouseMove)
		window.removeEventListener('mouseup', mouseUp)
	})
</script>

<div
	class="range"
	class:vertical
	role="slider"
	bind:this={el}
	on:mousedown={mouseDown}
	style:--thumb-width="{thumbWidth}px"
	draggable="false"
	aria-valuenow={value}
	data-name={name}
	tabindex="0"
>
	<div
		class="thumb"
		bind:this={thumb}
		on:mousedown|stopPropagation|capture={mouseDown}
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

		border: 0.2px solid var(--fg-c);
		border-radius: 50px;
		background: var(--fg-b);

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
		background: var(--bg-a);

		cursor: grab;
		transition: background 0.3s;
		appearance: none;
		appearance: none;

		&:focus::-webkit-slider-thumb {
			background: var(--brand-a);
		}
	}
</style>
