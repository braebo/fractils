<script lang="ts">
	import type { DraggableOptions } from '$lib/utils/draggable'

	import { clamp, mapRange } from '$lib'
	import { WindowManager } from '$lib/utils/windowManager'
	import Window from './Window.svelte'
	import Debug from './Debug.svelte'

	const dragOpts = {
		cancel: '.delete',
		localStorageKey: `demo-window-manager:draggable`,
		placementOptions: {
			bounds: '.page',
			margin: 20,
		},
	}

	const wm = new WindowManager({
		draggable: dragOpts,
		resizable: {
			sides: ['top', 'right', 'bottom', 'left'],
		},
		obstacles: ['.window', '.sidebar'],
	})

	let windows = [
		'top-center',
		'bottom-right',
		'bottom-center',
		'bottom-left',
		'left-center',
	] as DraggableOptions['position'][]

	function addWindow() {
		const w = window.innerWidth
		const h = window.innerHeight
		windows.push({
			x: clamp(mapRange(Math.random(), 0, 1, 0, w - 500), 0, w),
			y: clamp(mapRange(Math.random(), 0, 1, 0, h - 400), 0, h),
		})
		windows = windows
	}
</script>

<Debug {windows} />

<div class="page">
	<div class="main">
		<div class="buttons" style:position="absolute">
			<button on:click={addWindow}>Add Window</button>
			<button on:click={() => localStorage.clear()}>Clear localStorage</button>
		</div>

		{#each windows as placement, i (placement)}
			<Window
				{i}
				{wm}
				debug
				options={{
					draggable: { ...dragOpts, position: placement },
					resizable: {
						localStorageKey: `demo-window-manager:resizable-${i}`,
						sides: ['top', 'right', 'bottom', 'left'],
					},
					obstacles: ['.window', '.sidebar'],
				}}
			/>
		{/each}

		<Window
			{wm}
			i={6}
			classes={['containerbox']}
			options={{ draggable: { ...dragOpts, position: 'center' } }}
		>
			<!-- // todo - disabling localStorageKey here is doesn't work :( -->
			<Window
				{wm}
				title=""
				classes={['innerbox']}
				options={{
					preserveZ: true,
					obstacles: '.window-6',
					draggable: {
						position: 'center',
						bounds: '.containerbox',
						localStorageKey: undefined,
					},
				}}
			>
				Inside
			</Window>
		</Window>
	</div>

	<div class="sidebar" />
</div>

<style lang="scss">
	.page {
		display: grid;
		grid-template-columns: 1fr 10rem;
		min-height: 100vh;
		min-width: 100vw;
		max-height: 100vh;
		max-width: 100vw;
		background: var(--bg-c);
	}

	.sidebar {
		background: var(--bg-a);
		height: 20vh;
		margin: auto 0;
	}

	button {
		margin: 1rem;
		margin-right: 0;
	}

	:global(.innerbox) {
		width: 4rem !important;
		height: 3rem !important;
		background-color: var(--bg-d);
		padding: 0.2rem;
		border-radius: var(--radius-sm);
	}
</style>
