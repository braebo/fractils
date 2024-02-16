<script lang="ts">
	import { WindowManager } from '$lib/utils/windowManager'

	const windowManager = new WindowManager({
		draggable: {
			obstacles: '.window-4',
		},
		resizable: true,
		animation: {
			scale: 1.025,
			duration: 75,
		},
		// keepZ: true
	})
</script>

{#each [1, 2, 3, 4, 5] as i}
	<div
		class="window-{i}"
		style="
			top:{100 + (i - 1) * 124}px;
			left: {(i) * 75}px;
			scale: {i === 1 ? 1.5 : i === 4 ? 0.6 : 1};
		"
		use:windowManager.add={{ preserveZ: i === 2 }}
	>
		<h1>Window {i}</h1>
	</div>
{/each}

<style lang="scss">
	div {
		position: absolute;
		width: 240px;
		height: 120px;
		border: 1px solid red;

		background-color: rgba(var(--bg-a-rgb), 0.5);
		backdrop-filter: blur(0.25rem);

		overflow: hidden;
	}

	.window-4 {
		color: black;
		background-color: lightslategrey;
	}
</style>
