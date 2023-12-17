<!-- 
@component

A styled code block with syntax highlighting.  On the client, the code is
highlighted using [Shikiji](https://github.com/antfu/shikiji) using the
{@link highlight} util unless the `ssr` prop is set to true and the highlighted
text is provided as the `highlightedText` prop.  The raw `text` prop is still
required in this case, as it's used for screen readers and the copy button.

@example CSR

```svelte
<script>
	import Code from 'fractils'

	const text = `console.log('hello world')`
</script>

<Code {text} />
```

@example SSR

+page.svelte
```svelte
<script>
	import Code from 'fractils'

	export let data
	const { text, highlightedText } = data
</script>

<Code ssr {text} {highlightedText} />
```

+page.ts
```typescript
import { highlight } from 'fractils/utils/highlight'

export async function load({ page, fetch }) {
	const text = `console.log('hello world')`
	const highlightedText = await highlight(text, { lang: 'js' })

	return {
		text,
		highlightedText,
	}
}
```
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

	/**
	 * If true, the code block will be collapsed by default.
	 */
	export let collapsed = false

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

<div aria-hidden="true" class="window">
	<div class="nav" aria-hidden="true">
		<div class="dots">
			<button class="dot red" on:click={() => (collapsed = true)} />
			<button class="dot yellow" on:click={() => (collapsed = true)} />
			<button class="dot green" on:click={() => (collapsed = false)} />
		</div>

		{#if title}
			<div class="title">{title}</div>
		{/if}
	</div>

	<div class="codeblock" class:collapsed>
		{#if text && copyButton && BROWSER}
			<div class="copy-container">
				<div class="sticky">
					<CopyButton {text} />
				</div>
			</div>
		{/if}

		<pre style:font-size={$fontSize}>{@html highlightedText}</pre>
	</div>
</div>

<style lang="scss">
	.window {
		position: relative;

		width: 100%;

		margin: auto;

		background: var(--bg, var(--bg-a, #15161d));
		border-radius: 0.25rem;
		outline: 1px solid var(--bg-b, #282a36);
		box-shadow: var(--shadow-sm);

		font-size: 0.8rem;

		overflow: hidden;
	}

	.codeblock {
		position: relative;
		display: flex;
		flex-direction: column;
		flex-shrink: 1;
		flex-grow: 1;

		width: 100%;

		overflow-y: auto;

		// transition: max-height 1s cubic-bezier(0.23,1,0.320,1);
		transition: max-height 0.75s;
		transition-timing-function: cubic-bezier(0.56, 0.48, 0.16, 1);
		&.collapsed {
			transition-timing-function: cubic-bezier(0.08, 1.12, 0.3, 0.97);
		}
	}

	.codeblock {
		max-height: min(var(--max-height, 450px), min(50vh, 450px));

		&.collapsed {
			max-height: 0px;
		}
	}

	////// SHIKI //////

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
		top: 0;
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
		justify-content: center;

		padding: 0.33rem 0.5rem;

		background: var(--bg-b, #282a36);
	}
	.title {
		color: var(--fg-d, #dfe1e9);
		transition: color 0.15s;
	}
	.window:hover .title {
		color: var(--fg-c, #c3c4c7);
	}

	.dots {
		position: absolute;
		top: 0.55rem;
		left: 0.55rem;

		display: flex;
		gap: 0.3rem;

		width: 2rem;
		height: 0.5rem;

		.dot {
			all: unset;
			cursor: pointer;
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

		filter: saturate(0.5);
		transition: filter 0.1s;
	}

	.window:hover .dots {
		filter: saturate(1);
	}

	////// Scrollbars //////

	:global(pre) {
		scrollbar-gutter: stable;
	}
	:global(pre::-webkit-scrollbar) {
		height: 7px;
		width: 7px;

		border-radius: 0.25rem;
		background: transparent; /* make scrollbar transparent */
	}
	:global(pre::-webkit-scrollbar-thumb) {
		border: 1px solid var(--bg-a);
		background: var(--bg-b);
		border-radius: 0.125rem;
	}
	:global(pre::-webkit-scrollbar-corner) {
		background: transparent;
	}

	:global(.shiki:focus) {
		border: none;
		border-radius: 0.1px !important;
		outline: 1px solid var(--bg-b, #282a36);
		outline-offset: 0.45rem;
	}
</style>
