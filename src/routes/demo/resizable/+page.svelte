<script lang="ts">
	import Orbs, { params } from './Orbs.svelte'
	import { resizable } from '$lib/actions/resizable'
	import { draggable } from '$lib/utils/draggable2'

	let bounds: HTMLElement
</script>

<div
	class="orbs-container"
	use:resizable={{ visible: true }}
	use:draggable={{
		// handle: '.orbs',
		cancel: '.fractils-resize-grabber',
		obstacles: ['.bounds', '.obstacle1'],
	}}
>
	<label for="">Free Orbs</label>
	<Orbs />
</div>

<div
	class="obstacle1"
	use:resizable={{}}
	use:draggable={{
		cancel: '.fractils-resize-grabber',
	}}
>
	<label for="">Obstacle 1</label>
</div>

<div
	class="bounds"
	bind:this={bounds}
	use:resizable={{}}
	use:draggable={{
		cancel: '.fractils-resize-grabber',
	}}
>
	<label for="">Bounds</label>

	{#if bounds}
		<div
			class="draggable1"
			use:resizable={{ visible: true, bounds }}
			use:draggable={{
				bounds,
				cancel: '.fractils-resize-grabber',
			}}
		>
			<label for="">Draggable 1</label>
		</div>
	{/if}
</div>

<style lang="scss">
	.orbs-container {
		position: absolute;

		width: 200px;
		height: 200px;

		background: var(--bg-b);
		z-index: 1;

		// transition: 0.25s;
	}

	.bounds,
	.obstacle1 {
		position: absolute;
		border: 1px solid tomato;
		width: 200px;
		height: 200px;
	}

	.draggable1 {
		position: absolute;

		width: 100px;
		height: 100px;

		background: var(--bg-b);
		outline: 1px solid green;

		pointer-events: all;
		// z-index: 1;
	}

	label {
		overflow: hidden;
		position: absolute;
		max-width: 50%;
		top: 0.4rem;
		left: 0.7rem;
	}
</style>
