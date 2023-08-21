<script script lang="ts">
	import { mobile } from '$lib/index'
	import { onMount } from 'svelte'

	export let example = 'example'
	export let result = true
	export let file: string | null = null

	let Prism: any, highlightedExample: string, code: HTMLElement, pre: HTMLPreElement

	onMount(async () => {
		const p = await import('prismjs')
		Prism = p.default
		highlightedExample = await Prism.highlight(example, Prism.languages.html, 'html')
		if (code) code.style.opacity = '1'
	})

	$: if (code && $mobile) {
		code.style.margin = '0'
		code.style.fontSize = '0.9rem'
		if (pre) pre.style.lineHeight = '0.75rem'
		const current = parseInt(window.getComputedStyle(pre).minHeight.replace('px', ''))
		pre.style.minHeight = String(current * 0.924) + 'px'
	}
</script>

<div class="codeblock">
	{#if file}
		<div class="file">{file}</div>
	{/if}

	<pre bind:this={pre}><code class="language-html" bind:this={code} class:mobile={$mobile}
			>{#if highlightedExample}{@html highlightedExample.trim()}{/if}
</code></pre>
</div>

<span style="display: {!result ? 'none' : 'content'};">
	<h6>↓</h6>
	<div class="result">
		<slot />
	</div>
</span>

<style lang="scss">
	pre {
		min-height: var(--h, 165px);
		margin: 0;

		border-radius: var(--border-radius);

		&::-webkit-scrollbar {
			display: none;
			-ms-overflow-style: none; // IE & Edge
			scrollbar-width: none; // Firefox
		}
	}

	:global(code) {
		position: relative;

		opacity: 0;

		transition: 0.2s;
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

		box-shadow: 0 0 5px 0 #111 inset;
		background: var(--result-bg, var(--bg-c));
		border-radius: var(--border-radius);

		z-index: 3;
	}

	:global(.result .value) {
		background: var(--bg-a);
	}

	:global(.result:first-child) {
		padding: 1rem;
	}

	.codeblock {
		position: relative;
	}

	.file {
		position: absolute;
		right: 1rem;
		top: 0.5rem;

		width: max-content;

		font-family: var(--mono);

		opacity: 0.5;
		color: var(--bg-a);
	}
</style>
