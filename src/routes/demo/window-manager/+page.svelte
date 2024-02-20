<script lang="ts">
	import { WindowManager } from '$lib/utils/windowManager'
	import { quintIn } from 'svelte/easing'
	import { scale } from 'svelte/transition'

	const windowManager = new WindowManager({
		draggable: {
			obstacles: '.window-4',
		},
		resizable: {
			// visible: true,
			sides: ['top', 'right', 'bottom', 'left'],
		},
		animation: {
			scale: 1.025,
			duration: 75,
		},
		// keepZ: true
	})

	const windows = [1, 2, 3, 4, 5]

	let deleted = windows.map(() => false)
</script>

<button on:click={() => console.log(windowManager)}>console.log(windowManager)</button>

{#each windows as i}
	{#if !deleted[i - 1]}
		<div
			class="window window-{i}"
			out:scale={{ duration: 150, easing: quintIn }}
			style="top:{100 + (i - 1) * 124}px; left: {i * 75}px;"
			use:windowManager.add={{
				preserveZ: i === 2,
				obstacles: '.window',
			}}
		>
			<div class="content">
				<button class="delete" on:click={() => (deleted[i - 1] = true)}></button>
				<h2>Window {i}</h2>
			</div>
		</div>
	{/if}
{/each}

<style lang="scss">
	.page {
		min-height: 100vh;
		min-width: 100vw;
	}
	h2 {
		font-size: var(--font-md);
		font-family: var(--font-b);
	}
	.window {
		position: absolute;

		width: 240px;
		height: 120px;

		background-color: rgba(var(--bg-a-rgb), 0.5);
		backdrop-filter: blur(0.25rem);
		border: 1px solid var(--bg-b);
		border-radius: var(--radius);
		box-shadow: var(--shadow-lg);
	}

	.window-4 {
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

	.delete {
		all: unset;
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		// padding: 0.5rem !important;
		cursor: pointer;
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: tomato;
		filter: brightness(0.25) saturate(0.25);
		transition: 0.25s ease-in;
		&:hover {
			filter: brightness(0.5);
			// opacity: 0.5;
		}
		z-index: 999;
	}
</style>
