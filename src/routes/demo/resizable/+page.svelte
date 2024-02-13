<script lang="ts">
	import { draggable } from '$lib/utils/draggable3'
	import { resizable } from '$lib/actions/resizable'
	import Orbs from './Orbs.svelte'
</script>

<div
	class="orbs-container"
	use:resizable={{
		visible: true,
		obstacles: ['.bounds', '.obstacle'],
	}}
	use:draggable={{
		cancel: '.fractils-resize-grabber',
		obstacles: ['.bounds', '.obstacle'],
	}}
>
	<div class="label">Free Orbs</div>
	<Orbs />
</div>

{#each [1, 2, 3] as i}
	<div
		class="obstacle"
		use:resizable
		use:draggable={{
			cancel: '.fractils-resize-grabber',
			defaultPosition: {
				x: Math.random() * window.innerWidth,
				y: Math.random() * window.innerHeight,
			},
		}}
	>
		<div class="label">Obstacle {i}</div>
	</div>
{/each}

<div
	class="bounds"
	use:resizable
	use:draggable={{
		cancel: '.fractils-resize-grabber',
	}}
>
	<div class="label">Bounds</div>

	<div
		class="draggable1"
		use:resizable={{ visible: true, bounds: '.bounds' }}
		use:draggable={{
			bounds: '.bounds',
			cancel: '.fractils-resize-grabber',
		}}
	>
		<div class="label">Draggable 0</div>
	</div>
</div>

<style lang="scss">
	.orbs-container {
		position: absolute;

		width: 200px;
		height: 200px;

		background: var(--bg-b);
		z-index: 1;
	}

	.bounds,
	.obstacle {
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
		border: 1px solid green;

		pointer-events: all;
	}

	.label {
		max-width: 100%;
		overflow: hidden;
		position: absolute;
		padding: 0.4rem;
	}
</style>
