<script lang="ts">
	import type { WindowManager, WindowInstanceOptions } from '$lib/utils/windowManager'

	export let wm: WindowManager
	export let i = wm.windows.length
	export let title = `Window ${i}`
	export let options: Partial<WindowInstanceOptions>
	export let debug = false

	export let classes = [] as string[]

	let destroy = false
</script>

{#if !destroy}
	<div class="window window-{i} {classes.join(' ')}" use:wm.add={options}>
		<button class="delete" on:click={() => (destroy = true)}></button>
		{#if title}<h2 class="title">{title}</h2>{/if}
		<slot />
		{#if debug}
			<pre><code class="language-html content"></code></pre>
		{/if}
	</div>
{/if}

<style lang="scss">
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

	.delete {
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

		z-index: 2;
	}

	.content {
		display: flex;
		overflow: hidden;
		flex-direction: column;
		height: 100%;
		width: 100%;

		z-index: 1;
	}

	pre,
	code {
		font-size: var(--font-xxs);
		font-family: var(--font-mono);
		transform: translate(-0.25rem, 0.1rem);

		z-index: 1;
	}
</style>
