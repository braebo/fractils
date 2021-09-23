<script>
	import { onMount } from 'svelte'

	export let example = 'example'
	export let result = true

	let Prism, highlightedExample, code

	onMount(async () => {
		const p = await import('prismjs')
		Prism = await p.default
		Prism.highlightAll()
		highlightedExample = await Prism.highlight(example, Prism.languages.html, 'html')
		code.style.opacity = 1
	})
</script>

<pre><code class='language-html' bind:this={code}>
	{#if highlightedExample}
		{@html highlightedExample}
	{/if}
</code></pre>

<span style="display: {!result ? 'none' : 'content'};">
	<h6>↓</h6>
	<div class="result">
		<slot />
	</div>
</span>

<style>
	pre {
		min-height: var(--h, 165px);
		margin: 0;

		background: var(--text-a);
		border-radius: var(--border-radius);
	}

	:global(code) {
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

		border-radius: var(--border-radius);

		background: white;
	}

	:global(.result:first-child) {
		padding: 1rem;
	}
</style>
