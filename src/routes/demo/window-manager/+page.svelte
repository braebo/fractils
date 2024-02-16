<script>
	import { WindowManager } from '$lib/utils/windowManager'

	const windowManager = new WindowManager({
		draggable: {
			obstacles: '.window-4',
		},
		resizable: true,
	})
</script>

{#each [1, 2, 3, 4, 5] as i}
	<div
		class="window-{i}"
		style="top:{(i - 1) * 124}px; scale:.6"
		use:windowManager.add={{ keepZ: i === 2 }}
	>
		<h1>Window {i}</h1>
	</div>
{/each}

<style>
	div {
		position: absolute;
		width: 240px;
		height: 120px;
		border: 1px solid red;

		background-color: rgba(var(--bg-a-rgb), 0.5);
		backdrop-filter: blur(0.25rem);
	}
	.window-4 {
		color: black;
		background-color: lightslategrey;
	}
</style>
