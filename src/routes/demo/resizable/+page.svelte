<script lang="ts">
	import type { ResizableOptions, Corner, Side } from '$lib/utils/resizable'
	import { resizable } from '$lib/actions/resizable'
	import { draggable } from '$lib/utils/draggable'
	import Orbs from './Orbs.svelte'

	const W = globalThis.window?.innerWidth ?? 100
	const H = globalThis.window?.innerHeight ?? 100

	const obstacles = [
		{
			title: 'Default',
			style: ``,
			position: { x: 50, y: H / 5 / 2 },
		},
		{
			title: 'min-width',
			style: `
				position: absolute;
				min-width: 50px;
				max-width: 250px;
			`,
			position: { x: 50, y: (H / 5) * 2 },
		},
		{
			title: 'inset',
			style: `
				position: fixed;
				inset: 0;
			`,
			position: { x: 50, y: (H / 5) * 2 },
		},
	]

	const defaults = {
		color: 'var(--fg-d)',
		opacity: 1,
		sides: ['top', 'right', 'bottom', 'left'] as Side[],
		corners: ['top-left', 'top-right', 'bottom-right', 'bottom-left'] as Corner[],
	} as const satisfies Partial<ResizableOptions>
</script>

{#each obstacles as { title, style, position }}
	<div
		{style}
		class="obstacle"
		use:resizable={{
			...defaults,
			obstacles: ['.orbs-container'],
		}}
		use:draggable={{
			...defaults,
			cancel: '.resize-grabber',
			obstacles: ['.orbs-container'],
			position,
		}}
	>
		<div class="label">{title}</div>
		<pre>{style.replaceAll('\t', '')}</pre>
	</div>
{/each}

<div
	class="orbs-container"
	use:resizable={{
		...defaults,
		visible: true,
		obstacles: ['.bounds', '.obstacle'],
	}}
	use:draggable={{
		cancel: '.resize-grabber',
		obstacles: ['.bounds', '.obstacle'],
		position: { x: W / 2 - 100, y: H / 2 - 100 },
	}}
>
	<Orbs />
</div>

<div
	class="bounds"
	style="min-width: 75px; min-height: 75px;"
	use:resizable
	use:draggable={{
		...defaults,
		cancel: '.resize-grabber',
		position: { x: 50, y: H - 250 },
	}}
>
	<div class="label">Bounds</div>

	<div
		class="draggable1"
		style="min-width: 75px; min-height: 75px;"
		use:resizable={{
			...defaults,
			visible: true,
			bounds: '.bounds',
		}}
		use:draggable={{
			bounds: '.bounds',
			cancel: '.resize-grabber',
			position: { x: 25, y: 25 },
		}}
	>
		<div class="label">Draggable 0</div>
	</div>
</div>

<style lang="scss">
	.orbs-container,
	.bounds,
	.obstacle {
		position: absolute;

		width: 200px;
		height: 200px;
		padding: 0.5rem;

		background: rgba(var(--bg-a-rgb), 0.5);
		backdrop-filter: blur(0.25rem);
		box-shadow: 0 2px 10px #0002;
		border-radius: var(--radius);
		outline: 1px solid var(--bg-c);

		overflow: hidden;
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
