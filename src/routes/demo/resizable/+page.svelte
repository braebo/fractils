<script lang="ts">
	import Orbs, { params } from './Orbs.svelte'
	import { resizable } from '$lib/actions/resizable'
	import { draggable } from '$lib/utils/draggable2'

	let bounds: HTMLElement
</script>

<div class="page">
	<div
		class="orbs"
		use:resizable={{ visible: true }}
		use:draggable={{
			handle: '.orbs',
			cancel: '.fractils-resize-grabber',
		}}
	>
		<label for="">Free Orbs</label>
		<Orbs />
	</div>

	<div class="bounds" bind:this={bounds}>
		<label for="">Bound</label>

		{#if bounds}
			<div
				class="bound"
				use:resizable={{ visible: true, bounds }}
				use:draggable={{
					bounds,
					cancel: '.fractils-resize-grabber',
				}}
			/>
		{/if}
	</div>
</div>

<style lang="scss">
	.page {
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: flex-start;
		gap: 1rem;

		max-width: 400px;
		height: 100%;
		flex-grow: 1;
		margin: auto;

		padding: 1rem;
	}

	.orbs {
		position: absolute;
		left: 5vw;
		top: 5vh;

		width: 200px;
		height: 200px;

		background: var(--bg-b);
		// pointer-events: all;

		// :global(.svg) {
		// 	pointer-events: none;
		// }
	}

	.bounds {
		position: absolute;
		top: 50vh;
		right: 10vw;
		margin: auto;

		border: 1px solid tomato;

		width: 200px;
		height: 200px;

		z-index: 0;
	}

	.bound {
		position: absolute;
		left: 25%;
		top: 25%;
		width: 100px;
		height: 100px;

		background: var(--bg-b);
		outline: 1px solid green;

		pointer-events: all;
		z-index: 1;
	}

	label {
		overflow: hidden;
		position: absolute;
		max-width: 50%;
		top: 0.4rem;
		left: 0.7rem;
	}
</style>
