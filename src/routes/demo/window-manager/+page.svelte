<script lang="ts">
	import { WindowManager } from '$lib/utils/windowManager'
	import { quintIn } from 'svelte/easing'
	import { scale } from 'svelte/transition'

	const windowManager = new WindowManager({
		draggable: {},
		resizable: {
			sides: ['top', 'right', 'bottom', 'left'],
		},
		obstacles: ['.window', '.sidebar'],
		animation: {
			scale: 1,
			duration: 75,
		},
	})

	let windows = [1, 2, 3, 4, 5]
	// let windows = [4, 5]
	// let windows = [] as number[]

	let deleted = windows.map(() => false)
</script>

<div class="page">
	<div class="main">
		<button on:click={() => (windows = [...windows, windows.length + 1])}>Add Window</button>
		<!-- <button on:click={() => console.log(windowManager)}>console.log(windowManager)</button> -->

		<!-- <div
			class="window window-1"
			style="top:500px;left:250px"
			out:scale={{ duration: 150, easing: quintIn }}
			use:windowManager.add
		>
			<div class="content"><h2>Window 1</h2></div>
		</div>

		<div
			class="window window-2"
			style="top:500px;left:550px"
			out:scale={{ duration: 150, easing: quintIn }}
			use:windowManager.add
		>
			<div class="content"><h2>Window 2</h2></div>
		</div> -->

		{#each windows as i}
			{@const evenOddClass = i % 2 === 0 ? 'even' : 'odd'}
			{#if !deleted[i - 1]}
				<div
					class="window window-{i} window-{evenOddClass}"
					out:scale={{ duration: 150, easing: quintIn }}
					style="top:{100 + (i - 1) * 124}px; left: {i * 75}px;"
					use:windowManager.add={{
						preserveZ: i === 2,
						obstacles: i === 3 ? '.window-1' : undefined,
					}}
				>
					<div class="content">
						<button class="delete" on:click={() => (deleted[i - 1] = true)}></button>
						<h2>Window {i} {evenOddClass}</h2>
					</div>
				</div>
			{/if}
		{/each}

		<div
			class="window bounds"
			style="min-width: 75px; min-height: 75px;"
			use:windowManager.add={{}}
		>
			<div class="label">Bounds</div>

			<div
				class="window"
				style="min-width: 75px; min-height: 75px;"
				use:windowManager.add={{}}
			>
				<div class="label">Draggable 0</div>
			</div>
		</div>
	</div>
	<div class="sidebar" />
</div>

<style lang="scss">
	.page {
		display: grid;
		grid-template-columns: 1fr 10rem;
		min-height: 100vh;
		min-width: 100vw;
	}

	.sidebar {
		background: var(--bg-a);
		height: 20vh;
		margin: auto 0;
	}

	h2 {
		font-size: var(--font-md);
		font-family: var(--font-b);
	}
	.window {
		position: absolute;

		width: 240px;
		height: 120px;
		padding: 0.5rem;

		background-color: rgba(var(--bg-a-rgb), 0.5);
		backdrop-filter: blur(0.25rem);
		border: 1px solid var(--bg-b);
		border-radius: var(--radius);
		box-shadow: var(--shadow-lg);

		font-size: var(--font-xs);
		font-family: var(--font-b);

		overflow: hidden;
	}

	.window-2 {
		color: black;
		background-color: lightslategrey;
	}

	.content {
		display: flex;
		overflow: hidden;
		flex-direction: column;
		height: 100%;
		width: 100%;

		h2 {
			padding: 1rem;
		}
	}

	button {
		margin: 1rem auto;
	}
</style>
