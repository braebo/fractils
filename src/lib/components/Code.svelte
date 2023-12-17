<!-- 
@component

A styled code block with syntax highlighting.  On the client, the code is
highlighted using [Shikiji](https://github.com/antfu/shikiji) using the
{@link highlight} util unless the `ssr` prop is set to true and the highlighted
text is provided as the `highlightedText` prop.  The raw `text` prop is still
required in this case, as it's used for screen readers and the copy button.
-->

<script context="module">
	import { localStorageStore } from '../utils/localStorageStore'

	const fontSize = localStorageStore('fractils::settings::codeblock::fontSize', '0.8rem')
</script>

<script lang="ts">
	import type { Lang, Theme } from 'shiki'

	import CopyButton from './CopyButton.svelte'
	import { BROWSER } from 'esm-env'

	/**
	 * The string to highlight.
	 */
	export let text: string

	/**
	 * Effectively just disables the client-side highlighting,
	 * assuming the text has already been highlighted on the server.
	 * @defaultValue false
	 */
	export let ssr = false

	/**
	 * Optional pre-highlighted text.  If this is provided _and_ the {@link ssr}
	 * prop is `true`, the highlighter will not be loaded / run on the client.
	 */
	export let highlightedText = ssr ? text : sanitize(text)

	/**
	 * An optional title to display above the code block.
	 * @defaultValue 'code'
	 */
	export let title = 'code'

	/**
	 * The language to use.  Must be a {@link ValidLanguage}.
	 * @defaultValue 'json'
	 */
	export let lang = 'json' as Lang

	/**
	 * The theme to use.
	 * @defaultValue 'github'
	 */
	export let theme = 'serendipity' as Theme

	/**
	 * If true, a button will be displayed to copy the code to the clipboard.
	 * @defaultValue true
	 */
	export let copyButton = true

	$: if (!ssr && text && BROWSER) {
		update()
	}

	/**
	 * Replace all `<` and `>` with their HTML entities to avoid
	 * early script tag termination cus Conduitry is stubborn.
	 */
	function sanitize(text: string) {
		return text.replaceAll('<', '&lt;').replaceAll('>', '&gt;')
	}

	async function update() {
		const { highlight } = await import('../utils/highlight')
		highlightedText = await highlight(text, { lang, theme })
		console.log('update')
	}
</script>

<!-- invisible plain text version for screen readers -->
<div class="sr-only" aria-label={`code snippet titled ${title}`}>{text}</div>

<div aria-hidden="true" class="codeblock scrollbar">
	<div class="nav" aria-hidden="true">
		<div class="dots">
			<div class="dot red" />
			<div class="dot yellow" />
			<div class="dot green" />
		</div>

		{#if title}
			<div class="file">{title}</div>
		{/if}
	</div>

	{#if text && copyButton && BROWSER}
		<div class="copy-container">
			<div class="sticky">
				<CopyButton {text} />
			</div>
		</div>
	{/if}

	<pre style:font-size={$fontSize}>{@html highlightedText}</pre>
</div>

<style lang="scss">
	.codeblock {
		position: relative;

		width: 100%;
		max-width: var(--max-width, min(95vw, 500px));
		max-height: var(--max-height, min(50vh, 500px));
		margin: auto;

		background: var(--bg, var(--bg-a, #15161d));
		border-radius: 0.2rem;
		outline: 1px solid var(--bg-b, #282a36);
		box-shadow: var(--shadow-sm);

		font-size: 0.8rem;

		overflow: auto;
	}

	:global(.shiki:focus) {
		border: none;
		border-radius: var(--radius-xs);
		outline: 1px solid var(--bg-b, #282a36);
		outline-offset: 0.5rem;
	}

	:global(.shiki.has-focused) {
		:global(.line) {
			transition: 0.25s;
		}

		:global(.line) {
			filter: blur(1px) saturate(0.5) brightness(0.8);
		}

		:global(.line.focused) {
			filter: blur(0) saturate(1) brightness(1);
			font-variation-settings: 'wght' 700;
		}
	}

	:global(.has-focused:hover .line) {
		filter: none;
	}

	:global(.shiki .line.focused) {
		filter: none;
	}

	pre {
		padding: var(--padding-sm, 0.5rem);

		line-height: 1.25rem;
		font-family: var(--font-mono);
		box-shadow: var(--shadow-inset);
	}

	.copy-container {
		position: sticky;
		// top: 0;
		top: 2rem;
		right: 0;
		max-height: 0px;
	}

	.sticky {
		position: absolute;
		right: 0rem;
		top: 0rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.nav {
		position: sticky;
		top: 0;

		display: flex;
		align-items: center;
		justify-content: center;
		gap: 2rem;

		// height: 2.5rem;
		padding: 0.5rem;

		background: var(--bg-b);
	}

	.dots {
		position: absolute;
		top: 0.75rem;
		left: 0.75rem;
		display: flex;
		gap: 0.25rem;

		width: 2rem;
		height: 0.5rem;

		.dot {
			min-width: 0.5rem;
			min-height: 0.5rem;
			border-radius: 1rem;
			&.red {
				background: var(--red, #ff605c);
			}
			&.yellow {
				background: var(--yellow, #febc2e);
			}
			&.green {
				background: var(--green, #28c941);
			}
		}
	}
</style>
