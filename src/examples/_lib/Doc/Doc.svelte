<script lang="ts">
	import type { ParsedSvelteFile } from '$scripts/extractinator/src/types'
	import type { HighlightedBlock } from '$lib/utils/docinator'

	import { mobile } from '$lib/stores/Device.svelte'
	import Code from '$lib/components/Code.svelte'
	import Bits from './Bits.svelte'

	export let doc: ParsedSvelteFile

	const { filePath, comment, componentName, props } = doc

	const title = componentName
	const type = componentName ? 'Svelte Component' : 'Module'

	const hasHTMLBlocks = (comment: any) => {
		return comment as { name: string; content: string; blocks: HighlightedBlock[] }
	}
</script>

<div class="doc" class:mobile={$mobile}>
	<header>
		<a href="#{title}"><h1 id={title}>{title}</h1></a>
		<p class="code">{type}</p>
	</header>

	<div class="description" class:mobile={$mobile}>
		<slot name="description">
			{#if comment}
				<div class="summary">
					{#if comment.summary}
						{@html comment.summary}
					{/if}
				</div>

				{#if comment.examples}

					<div class="br-sm" />

					<div class="examples col">
						<h3 class="subtitle"
							>{comment.examples.length > 1 ? 'Examples' : 'Example'}</h3
						>

						{#each comment.examples as example}
							{@const { name, blocks } = hasHTMLBlocks(example)}
							<div class="example col">
								{#if name}
									<h4 class="name">
										{name}
									</h4>
								{/if}
								
								{#each blocks as block}
									{#if block.type === 'code'}
										<div class="block">
											<Code
												title={block.title || block.lang || ''}
												text={block.raw}
												highlightedText={block.content}
											/>
										</div>
									{:else}
										<div class="block">
											{@html block.content}
										</div>
									{/if}
								{/each}
							</div>
						{/each}
					</div>
				{/if}
			{/if}
		</slot>
	</div>

	{#if props.length}
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

<style lang="scss">
	.doc {
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
		font-variation-settings: 'wght' 300;
		letter-spacing: 0.5px;

		outline: none;
		z-index: 1;
	}

	.summary {
		padding-top: 1rem;

		font-size: 1rem;
		line-height: 1.6rem;
		letter-spacing: 0.6px;
		word-spacing: 1px;

		:global(code:not(pre code)) {
			background: var(--bg-a);
			font-size: 13px !important;

			padding: 0.1rem 0.4rem;
			margin: 0 0.2rem;
			border-radius: 0.2rem;
		}
	}

	.doc h1 {
		font-size: 1.5rem;
		color: var(--fg-a);
	}

	h1 {
		scroll-padding-top: 3rem !important;
	}

	h3 {
		text-align: center;
	}

	.doc a {
		font-family: var(--font-a);
		text-decoration: none;

		scroll-padding-top: 3rem;

		&:target {
			scroll-padding-top: 3rem;
		}
	}
	.doc a:hover {
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

	.examples {
		gap: 2rem;
	}
	.example {
		gap: 1rem;
	}
</style>
