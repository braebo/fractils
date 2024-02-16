<script lang="ts">
	import { resizable } from '$lib/actions/resizable'
	import { draggable } from '$lib/utils/draggable3'
	import Orbs from './Orbs.svelte'

	const W = globalThis.window?.innerWidth ?? 100
	const H = globalThis.window?.innerHeight ?? 100

	const obstacles = [
		{
			title: 'Default',
			style: ``,
			defaultPosition: { x: 50, y: H / 5 / 2 },
		},
		{
			title: 'min-width',
			style: `
				position: absolute;
				min-width: 50px;
				max-width: 250px;
			`,
			defaultPosition: { x: 50, y: (H / 5) * 2 },
		},
		{
			title: 'inset',
			style: `
				position: fixed;
				inset: 0;
			`,
			defaultPosition: { x: 50, y: (H / 5) * 2 },
		}
	]
</script>

{#each obstacles as { title, style, defaultPosition }, i}
	<div
		{style}
		class="obstacle"
		use:resizable={{
			obstacles: ['.orbs-container'],
		}}
		use:draggable={{
			cancel: '.resize-grabber',
			obstacles: ['.orbs-container'],
			defaultPosition,
		}}
	>
		<div class="label">{title}</div>
		<pre>{style.replaceAll('\t', '')}</pre>
	</div>
{/each}

<div
	class="orbs-container"
	use:resizable={{
		visible: true,
		obstacles: ['.bounds', '.obstacle'],
	}}
	use:draggable={{
		cancel: '.resize-grabber',
		obstacles: ['.bounds', '.obstacle'],
		defaultPosition: { x: W / 2 - 100, y: H / 2 - 100 },
	}}
>
	<div class="label">Free Orbs</div>
	<Orbs />
</div>

<div
	class="bounds"
	style="min-width: 75px; min-height: 75px;"
	use:resizable
	use:draggable={{
		cancel: '.resize-grabber',
		defaultPosition: { x: 50, y: H - 250 },
	}}
>
	<div class="label">Bounds</div>

	<div
		class="draggable1"
		style="min-width: 75px; min-height: 75px;"
		use:resizable={{
			visible: true,
			bounds: '.bounds',

		}}
		use:draggable={{
			axis: 'x',
			bounds: '.bounds',
			cancel: '.resize-grabber',
			defaultPosition: { x: 25, y: 25 },
		}}
	>
		<div class="label">Draggable 0</div>
	</div>
</div>

<!-- <div class="filler" style:height="2000px" /> -->

<style lang="scss">
	.orbs-container,
	.bounds,
	.obstacle {
		position: absolute;

		width: 200px;
		height: 200px;

		background: rgba(var(--bg-a-rgb), 0.5);
		backdrop-filter: blur(0.25rem);
		border: 3px solid tomato;
		border-radius: var(--radius);
		
		overflow: hidden;
		
		.label {
			max-width: 100%;
			overflow: hidden;
			position: absolute;
			padding: 0.4rem;
		}
	}

	pre {
		position: absolute;
		top: 2rem;
		left: 1.5rem;
		font-size: var(--font-xxs);
		line-height: 1.25rem;
	}

	.draggable1 {
		position: absolute;

		width: 100px;
		height: 100px;

		background: var(--bg-b);
		border: 1px solid green;

		overflow: hidden;
		pointer-events: all;
	}
</style>
