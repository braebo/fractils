<script>
	import { onMount } from 'svelte'

	export let example = 'example'
	export let title = 'title'
	export let type = 'type'

	let Prism, highlightedExample, code
	onMount(async () => {
		const p = await import('prismjs')
		Prism = await p.default
		Prism.highlightAll()
		highlightedExample = await Prism.highlight(
			example,
			Prism.languages.html,
			'html',
		)
		code.style.opacity = 1
	})
</script>

<div class="item">
	<header>
		<h1>{title}</h1>
		<p>{type}</p>
	</header>

	<div class="description">
		<slot name="description" />
	</div>

	<pre><code class='language-html' bind:this={code}>
		<!-- {@debug} -->
        {#if highlightedExample}
			{@html highlightedExample}
        {/if}
    </code></pre>

	<h6>↓</h6>
	<div class="result">
		<slot name="result" />
	</div>

	<slot />
</div>

<style>
	.item {
		display: flex;
		flex-direction: column;

		width: var(--col);
		margin: 3rem auto;
		padding: 1rem;

		background: var(--bg-a);
		border-radius: var(--border-radius);
		box-shadow: var(--shadow-lg);
	}

	.item h1 {
		font-size: 1.5rem;
	}

	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;

		padding-bottom: 1rem;
	}

	header p,
	:global(.description span) {
		display: flex;

		width: max-content;
		padding: 0.15rem 0.5rem 0.3rem 0.5rem;

		background: var(--text-a);
		color: var(--color-primary);
		border-radius: var(--border-radius);

		font-size: 0.75rem;
		font-style: italic;
	}

	pre {
		min-height: 165px;
		/* padding: 1rem; */
		margin: 0;

		background: var(--text-a);
		border-radius: var(--border-radius);
	}

	:global(code) {
		transition: 0.2s;
		opacity: 0;
	}

	:global(.param) {
		display: flex;
		gap: 0.5rem;

		margin-top: 1rem;
	}

	h6 {
		text-align: center;
		font-size: 1.5rem;
	}

	.result {
		width: 75%;
		margin: 5px auto;

		background: white;
		border-radius: var(--border-radius);

		text-align: center;
	}
	:global(.result:first-child) {
		padding: 1rem;
	}

	.description {
		display: flex;
		padding-bottom: 1rem;
	}
</style>
