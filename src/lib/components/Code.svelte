<!-- hmr-reset -->
<script lang="ts">
	import type { Lang, Theme } from 'shiki'

	import { BROWSER } from 'esm-env'

	/**
	 * The string to highlight.
	 * @defaultValue ''
	 */
	export let text = ''

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
	 * Effectively just disables the client-side highlighting,
	 * assuming the text has already been highlighted on the server.
	 * @defaultValue false
	 */
	export let ssr = false

	/**
	 * If true, a button will be displayed to copy the code to the clipboard.
	 * @defaultValue true
	 */
	export let copyButton = true

	let highlightedText = ssr ? text : sanitize(text)

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
		const { highlight } = await import('../actions/highlight/')
		highlightedText = await highlight(text, { lang, theme })
		console.log('update')
	}

	function copy() {
		if (typeof navigator === 'undefined') return
		navigator.clipboard?.writeText?.(text)
	}
</script>

<div class="codeblock scrollbar">
	<div class="nav">
		<div class="dots">
			<div class="dot red" />
			<div class="dot yellow" />
			<div class="dot green" />
		</div>

		{#if title}
			<div class="file">{title}</div>
		{/if}
	</div>

	{#if text}
		<div class="copy-container">
			<button class="copy" on:click|preventDefault={copy}>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="1rem"
					height="1rem"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
					<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
				</svg>
			</button>
		</div>
	{/if}

	<pre><code>{@html highlightedText}</code></pre>
</div>

<style lang="scss">
	.codeblock {
		position: relative;

		width: 100%;
		max-width: var(--max-width, min(95vw, 500px));
		max-height: var(--max-height, min(50vh, 500px));
		margin: auto;

		background: var(--bg, var(--bg-a));
		border-radius: 0.2rem;
		outline: 1px solid var(--bg-b);
		box-shadow: var(--shadow-sm);

		font-size: 0.8rem;

		overflow: auto;
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
				background: #ff605c;
			}
			&.yellow {
				background: #febc2e;
			}
			&.green {
				background: #28c941;
			}
		}
	}

	pre {
		padding: var(--padding, 0.5rem);

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

	button.copy {
		all: unset;
		position: absolute;
		// position: sticky;
		right: 0rem;
		top: 0rem;
		outline: 1px solid var(--bg-b);

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

		color: var(--bg-d);
		background: var(--bg-a);

		&:hover {
			color: var(--fg-c);
			background: var(--bg-b);
		}
		cursor: pointer;

		transition: 0.1s;

		&:focus {
			outline: 1px solid var(--bg-d);
		}
		&:active {
			color: var(--fg-b);
			background: var(--bg-c);
		}
	}
</style>
