<!-- hmr-reset -->
<script lang="ts">
	import { highlight, type ValidLanguage } from '../actions/highlight.js'
	import json from 'highlight.js/lib/languages/json'
	import hljs from 'highlight.js/lib/core'

	hljs.registerLanguage('json', json)

	/**
	 * The string to highlight.
	 * @defaultValue ''
	 */
	export let str = ''
	/**
	 * An optional title to display above the code block.
	 * @defaultValue 'code'
	 */
	export let title = 'code'
	/**
	 * The language to use.  Must be a {@link ValidLanguage}.
	 * @defaultValue 'json'
	 */
	export let lang = 'json' as ValidLanguage
	/**
	 * Whether to stringify the input.
	 * @defaultValue false
	 */
	export let stringify = false

	if (lang === 'js') lang = 'javascript'
	if (lang === 'ts') lang = 'typescript'

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

	<!-- <pre>{@html highlighted}</pre> -->
	<pre use:highlight={{ lang, stringify }}>{@html str}</pre>
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
		font-family: var(--font-mono);
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
		font-family: var(--font-mono);

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
