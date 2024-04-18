<script lang="ts">
	import type { DraggableOptions } from '$lib/utils/draggable'

	import { clamp, highlight, mapRange, stringify } from '$lib'
	import { WindowManager } from '$lib/utils/windowManager'
	import { debrief } from '$lib/utils/debrief'

	const dragOpts = {
		cancel: '.delete',
		localStorageKey: `demo-window-manager:draggable`,
		placementOptions: {
			bounds: '.page',
			margin: 20,
		},
	}

	const windowManager = new WindowManager({
		draggable: dragOpts,
		resizable: {
			sides: ['top', 'right', 'bottom', 'left'],
		},
		obstacles: ['.window', '.sidebar'],
		// animation: {
		// 	scale: 1,
		// 	duration: 75,
		// },
	})

	let windows = [
		'top-center',
		'bottom-center',
		'bottom-left',
		'bottom-right',
		'center',
	] as DraggableOptions['position'][]

	let deleted = windows.map(() => false)

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

<div class="positions">
	{#each windows as pos}
		{#await highlight(stringify(debrief(pos), 2)) then code}
			<pre><code class="language-json">{@html code}</code></pre>
		{/await}
	{/each}
</div>

<div class="page">
	<div class="main">
		<div class="buttons" style:position="absolute">
			<button on:click={addWindow}>Add Window</button>
			<button on:click={() => localStorage.clear()}>Clear localStorage</button>
		</div>

		{#each windows as placement, i (placement)}
			{@const evenOddClass = i % 2 === 0 ? 'even' : 'odd'}
			{#if !deleted[i - 1]}
				<div
					class="window window-{i} window-{evenOddClass}"
					use:windowManager.add={{
						preserveZ: i === 2,
						obstacles: i === 3 ? '.window-1' : undefined,
						draggable: {
							...dragOpts,
							position: placement,
						},
						resizable: {
							localStorageKey: `demo-window-manager:resizable-${i}`,
							sides: ['top', 'right', 'bottom', 'left'],
						},
					}}
				>
					<button class="delete" on:click={() => (deleted[i - 1] = true)}></button>
					<h2 class="title">Window {i} {evenOddClass}</h2>
					<pre><code class="language-html content"></code></pre>
				</div>
			{/if}
		{/each}

		<div
			class="window containerbox"
			use:windowManager.add={{ draggable: { ...dragOpts, position: 'center-left' } }}
		>
			<h2 class="title">Window {windows.length}</h2>
			<!-- // todo - disabling localStorageKey here is doesn't work! -->
			<div
				class="innerbox"
				use:windowManager.add={{
					draggable: {
						position: 'center',
						bounds: '.containerbox',
						localStorageKey: undefined,
					},
				}}
			>
				Inside
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
		max-height: 100vh;
		max-width: 100vw;
		background: var(--bg-c);
	}

	.sidebar {
		background: var(--bg-a);
		height: 20vh;
		margin: auto 0;
	}

	h2 {
		position: absolute;
		top: 0.25rem;
		left: 0;
		right: 0;

		margin: 0 auto;
		width: fit-content;

		font-family: var(--font-b);
		font-size: var(--font-sm);

		pointer-events: none;
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
		outline: 2px solid lightslategrey;
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
		margin: 1rem;
		margin-right: 0;
	}

	.delete {
		z-index: 100;
		all: unset;
		position: absolute;
		top: 0.4rem;
		left: 0.45rem;

		width: 0.5rem;
		height: 0.5rem;

		background-color: tomato;
		border-radius: 1rem;
		opacity: 0.5;
		&:hover {
			opacity: 1;
		}

		transition: 0.15s;
		cursor: pointer;
	}

	.positions {
		position: absolute;
		top: 3.5rem;
		left: 1rem;
		width: fit-content;
		font-size: var(--font-xxs);
		background: var(--dark-a);
		padding: 0.5rem;
		border-radius: var(--radius);
	}

	pre,
	code {
		font-size: var(--font-xxs);
		font-family: var(--font-mono);
		transform: translate(-0.25rem, 0.1rem);
	}

	.innerbox {
		width: 50px;
		height: 50px;
		background-color: var(--bg-d);
		padding: 0.2rem;
		border-radius: var(--radius-sm);
	}
</style>
