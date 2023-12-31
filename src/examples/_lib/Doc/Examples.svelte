<script lang="ts">
	import type { ParsedExample } from '$scripts/extractinator/src/types'
	import type { HighlightedBlock } from '$lib/utils/docinator'

	import Code from '$lib/components/Code.svelte'

	export let examples: ParsedExample[]

	const hasHTMLBlocks = (comment: any) => {
		return comment as { name: string; content: string; blocks: HighlightedBlock[] }
	}
</script>

<div class="br-sm" />

<div class="examples col">
	<h3 class="subtitle">{examples.length > 1 ? 'Examples' : 'Example'}</h3>

	{#each examples as example}
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

<style lang="scss">
	.examples {
		gap: 2rem;
	}
	.example {
		gap: 1rem;
	}

	h3 {
		text-align: center;
	}
</style>
