<!-- hmr-reset -->
<script lang="ts">
	import { onMount } from 'svelte'

	import hljs from 'highlight.js/lib/core'
	import json from 'highlight.js/lib/languages/json'

	import 'highlight.js/styles/github-dark-dimmed.css'
	hljs.registerLanguage('json', json)

	export let str = ''
	export let title = 'code'
	export let lang = 'json'

	let highlighted = str ? hljs.highlight(str, { language: lang }).value : ''

	onMount(async () => {
		highlighted ??= hljs.highlight(str, { language: lang }).value
	})

	function copy() {
		navigator.clipboard.writeText(str)
	}
</script>

<div class="codeblock scrollbar">
	{#if title}
		<div class="file">{title}</div>
	{/if}

	{#if str}
		<button class="copy" on:click|preventDefault={copy}>copy</button>
	{/if}

	<pre>{@html highlighted}</pre>
</div>

<style lang="scss">
	.codeblock {
		position: relative;
		font-size: 0.8rem;
		max-height: var(--max-height, min(50vh, 500px));
		max-width: var(--max-width, min(50vw, 500px));
		padding: 0.75rem;
		margin: auto;

		box-shadow: 0 0 5px 0 #111 inset;
		background: var(--bg, var(--bg-a));

		outline: 1px solid var(--bg-b);
		border-radius: 0.2rem;

		overflow: auto;
	}

	pre {
		margin-top: 0.5rem;
		font-family: var(--font-b);
	}

	button {
		all: unset;
		position: absolute;
		top: 0rem;
		right: 0rem;

		padding: 0.25rem 0.5rem;
		margin: 0.5rem;
		border-radius: 0.2rem;

		display: flex;
		align-items: center;
		justify-content: center;

		line-height: 1;
		height: 1rem;

		font-size: 0.8rem;
		font-family: var(--font-b);

		color: var(--fg-d);
		background: var(--bg-a);

		&:hover {
			color: var(--fg-c);
			background: var(--bg-b);
		}
		cursor: pointer;

		transition: 0.1s;

		&:focus {
			outline: 1px solid var(--bg-b);
		}
		&:active {
			color: var(--fg-b);
			background: var(--bg-c);
		}
	}
</style>
