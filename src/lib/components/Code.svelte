<!-- 
	 @component
 
	 A styled code block with syntax highlighting.  On the client, the code is 
	 highlighted using [Shikiji](https://github.com/antfu/shikiji) using the 
	 {@link highlight} util unless the `ssr` prop is set to true and the highlighted 
	 text is provided as the `highlightedText` prop.  The raw `text` prop is still 
	 required in this case, as it's used for screen readers and the copy button.
 
	 @example CSR
 
	 A simple browser example:
 
	 ```svelte
	 <script>
	 	import Code from 'fractils'
 
	 	const text = `console.log('hello world')`
	 </script>
 
	 <Code {text} />
	 ```
 
	 @example SSR
	 
	 ```svelte +page.svelte
	 <script>
	 	import Code from 'fractils'
 
	 	export let data
	 	const { text, highlightedText } = data
	 </script>
 
	 <Code ssr {text} {highlightedText} />
	 ```
	 
	 ```typescript +page.ts
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
	import { BROWSER, DEV } from 'esm-env'
	import '../css/shiki.scss'

	/**
	 * The string to highlight.
	 */
	export let text = ''

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
	export let highlightedText = ssr ? text : sanitize(text ?? '')

	if (DEV && !text && !highlightedText) {
		console.error('<Code /> component requires either the `text` or `highlightedText` prop.')

		if (!text && highlightedText) {
			console.warn(
				'`highlightedText` was provided, but unhighlighted `text` prop is required for copy/paste and screen-reader support.',
			)
		}
	}

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

	$: if (!ssr && text && !highlightedText && BROWSER) {
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
		highlightedText = await highlight(text ?? '', { lang, theme })
		console.log('update')
	}
</script>

<!-- invisible plain text version for screen readers -->
<div class="sr-only" aria-label={`code snippet titled ${title}`}>{text}</div>

<div aria-hidden="true" class="code-window">
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
		{#if text && copyButton}
			<div class="copy-container">
				<div class="sticky">
					<CopyButton {text} />
				</div>
			</div>
		{/if}

		<pre class="shiki-wrapper" style:font-size={$fontSize}>{@html highlightedText}</pre>
	</div>
</div>
