<script script lang="ts">
	import { add } from '$lib';

	export let result = true;
	export let file: string | null = null;
	export let html: string | null = null;

	const addScrollbars = {
		class: 'scrollbars',
		target: (node: HTMLElement) => {
			return node.querySelector('pre')!;
		},
	};
</script>

<div class="codeblock">
	{#if file}
		<div class="file">{file}</div>
	{/if}

	{#if html}
		<div class="shiki" use:add={addScrollbars}>
			{@html html}
		</div>
	{/if}
</div>

<span style="display: {!result ? 'none' : 'content'};">
	<h6>↓</h6>
	<div class="result">
		<slot />
	</div>
</span>

<style lang="scss">
	.codeblock {
		position: relative;

		border-radius: var(--radius);
		box-shadow: var(--shadow-inset);
		background: var(--bg-a);

		line-height: 1.5;
	}

	.shiki {
		font-size: 0.9rem;
	}

	:global(.shiki pre.shiki) {
		padding: 1rem 1.25rem;

		transition: 0.2s;
	}

	:global(.shiki *) {
		font-family: var(--font-mono) !important;
		font-variation-settings: 'wght' 400 !important;
	}

	:global(.shiki pre.shiki)::-webkit-scrollbar {
		height: 7px;
		width: 7px;
	}
	:global(.shiki pre.shiki)::-webkit-scrollbar-thumb {
		border: 1px solid var(--bg-a);
		background: var(--bg-b);
		border-radius: 0.25rem;
	}
	:global(.shiki pre.shiki)::-webkit-scrollbar-corner {
		background: transparent;
	}

	h6 {
		text-align: center;
		font-size: 1.5rem;
	}

	.result {
		width: 75%;
		margin: 5px auto;
		min-height: 50px;

		text-align: center;

		background: var(--result-bg, var(--bg-a));
		border-radius: var(--radius);
		box-shadow: var(--shadow-inset-b);

		z-index: 3;
	}

	:global(.result .value) {
		background: var(--bg-a);
	}

	:global(.result:first-child) {
		padding: 1rem;
	}

	.file {
		position: absolute;
		right: 1rem;
		top: 0.5rem;

		width: max-content;

		font-family: var(--font-mono);

		opacity: 0.5;
		color: var(--fg-d);
	}
</style>
