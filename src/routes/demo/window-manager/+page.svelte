<script lang="ts">
	import { WindowManager } from '$lib/utils/windowManager'

	const windowManager = new WindowManager({
		draggable: {
			obstacles: '.window-4',
		},
		resizable: {
			// visible: true,
			sides: [],
		},
		animation: {
			scale: 1.025,
			duration: 75,
		},
		// keepZ: true
	})
</script>

<!-- <div class="page"> -->
{#each [1, 2, 3, 4, 5] as i}
	{@const scale = i === 1 ? 1.5 : i === 4 ? 0.6 : 1}
	<div
		class="window window-{i}"
		style="
			top:{100 + (i - 1) * 124}px;
			left: {i * 75}px;
		"
		use:windowManager.add={{
			preserveZ: i === 2,
			obstacles: '.window',
		}}
	>
		<h1>Window {i}</h1>
		<pre>scale: {scale}</pre>
	</div>
{/each}

<!-- </div> -->

<style lang="scss">
	.page {
		// scale: 0.5;
		min-height: 100vh;
		min-width: 100vw;
	}
	h1 {
		font-size: var(--font-lg);
	}
	.window {
		position: absolute;

		width: 240px;
		height: 120px;
		padding: 1rem;

		background-color: rgba(var(--bg-a-rgb), 0.5);
		backdrop-filter: blur(0.25rem);
		border: 1px solid var(--bg-b);

		// transform-origin: top left;

		// overflow: hidden;
	}

	.window-4 {
		color: black;
		background-color: lightslategrey;
	}
</style>
