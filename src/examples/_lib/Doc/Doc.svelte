<script lang="ts">
	import type { ParsedSvelteFile } from '$scripts/extractinator/src/types'

	// import { transformerTwoSlash } from 'shikiji-twoslash'
	// import { highlight } from '$lib'
	import { mobile } from '$lib'
	// import { micromark } from 'micromark'
	import Bits from './Bits.svelte'

	export let doc: ParsedSvelteFile

	const { exports, fileName, filePath, comment, componentName, events, props, slots } = doc

	const title = componentName
	const type = componentName ? 'Svelte Component' : 'Module'

	// const stripped_raw = comment?.raw
	// 	.replaceAll('/**', '')
	// 	.replaceAll('*/', '')
	// 	.replaceAll('\n *', '\n ')

	// const html_summary = stripped_raw ? micromark(stripped_raw) : ''
	// const summary = micromark(comment?.summary ?? '')
	// const highlight_examples =
	// 	comment?.examples?.map((e) => ({ ...e, content: micromark(e.content) })) ?? []
	// const summary = comment?.summary ?? ''
	// const highlight_examples = comment?.examples?.map((e) => ({ ...e, content: e.content })) ?? []
</script>

<div class="item" class:mobile={$mobile}>
	<header>
		<a href="#{title}"><h1 id={title}>{title}</h1></a>
		<p class="code">{type}</p>
	</header>

	<div class="description" class:mobile={$mobile}>
		<slot name="description">
			{#if comment}
				{#if comment.summary}
					{@html comment.summary}
				{/if}

				{#if comment.examples}
					<hr />
					<div class="examples">
						<h4 class="subtitle">{comment.examples.length > 1 ? 'Examples' : 'Example'}</h4>

						{#each comment.examples as { name, content } (name)}
							<div class="example">
								<div class="name">
									{name}
								</div>
								{@html content}
							</div>
						{/each}
					</div>
				{/if}
			{/if}
		</slot>
	</div>

	{#if props}
		<!-- <pre>{JSON.stringify(props, null, 2)}</pre> -->
		<Bits title="Props" bits={props} />
	{/if}

	<slot />

	<a
		class="link"
		target="_blank"
		href="https://github.com/FractalHQ/fractils/blob/main/{filePath}">{'</>'}</a
	>
</div>

<style lang="css">
	.item {
		display: flex;
		position: relative;
		flex-direction: column;
		gap: 0.5rem;

		width: var(--col);
		margin: 3rem auto;
		padding: 1.5rem;

		color: var(--fg-c);
		background: var(--bg-b);

		border-radius: var(--radius);
		box-shadow: var(--shadow-lg);

		font-family: var(--font-b);
		font-variation-settings: 'wght' 300 !important;
		letter-spacing: 0.5px;

		outline: none;
		z-index: 1;
	}

	.item h1 {
		font-size: 1.5rem;
		color: var(--fg-a);
	}

	h1 {
		scroll-padding-top: 3rem !important;
	}

	.item a {
		font-family: var(--font-a);
		text-decoration: none;

		scroll-padding-top: 3rem;

		&:target {
			scroll-padding-top: 3rem;
		}
	}
	.item a:hover {
		text-decoration: underline;
	}

	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.mobile {
		font-size: 0.9rem;
	}

	:global(.param) {
		display: flex;
		gap: 0.5rem;

		margin-top: 0.5rem;
	}

	.link {
		position: absolute;
		bottom: 0;
		right: 0;

		padding: 1.2rem;

		color: var(--bg-a);

		font-family: var(--font-mono) !important;
		font-variation-settings: 'wght' 500 !important;

		transition: 0.15s;
	}
	.link:hover {
		font-variation-settings: 'wght' 900 !important;
		text-decoration: none !important;
	}
</style>
