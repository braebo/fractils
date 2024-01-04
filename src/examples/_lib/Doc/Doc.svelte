<script lang="ts">
	import type { ParsedSvelteFile, ParsedTSFile } from '$scripts/extractinator/src/types'

	import { mobile } from '$lib/stores/Device.svelte'
	import Examples from './Examples.svelte'
	import Bits from './Bits.svelte'

	type Exp = ParsedTSFile['exports'][0]

	export let doc: ParsedSvelteFile | ParsedTSFile | Exp
	export let filePath = (doc as ParsedSvelteFile | ParsedTSFile).filePath

	const type = doc.type === 'svelte' ? 'Svelte Component' : 'Module'
	const title =
		doc.type === 'svelte' ? (doc as ParsedSvelteFile).componentName : (doc as Exp).name

	const comment = (doc as ParsedSvelteFile | Exp).comment

	const props = (doc as ParsedSvelteFile).props
	const events = (doc as ParsedSvelteFile).events
	const slots = (doc as ParsedSvelteFile).slots

	const exports = (doc as ParsedSvelteFile | ParsedTSFile).exports

	function isTs(doc: ParsedSvelteFile | ParsedTSFile | Exp): doc is ParsedTSFile {
		return doc.type === 'ts'
	}

	function pluralize(arr: any[], word: string) {
		const n = arr.length
		return n === 1 ? word : word + 's'
	}
</script>

{#if isTs(doc)}
	{#each exports as d}
		<svelte:self doc={d} {filePath} />
	{/each}
{/if}

<div class="doc" class:mobile={$mobile}>
	<header>
		<a href="#{title}"><h1 id={title}>{title}</h1></a>
		<p class="code">{type}</p>
	</header>

	<div class="description" class:mobile={$mobile}>
		<slot name="description">
			{#if comment}
				<div class="summary">
					{@html comment.summary}
				</div>

				{#if comment.examples}
					<h3>{pluralize(comment.examples, 'Example')}</h3>
					<Examples examples={comment.examples} />
				{/if}
			{/if}
		</slot>
	</div>

	{#if props?.length}
		<h3>{pluralize(props, 'Prop')}</h3>
		<Bits bits={props} />
	{/if}

	{#if events?.length}
		<h3>{pluralize(events, 'Event')}</h3>
		<Bits bits={events} />
	{/if}

	{#if slots?.length}
		<h3>{pluralize(slots, 'Slot')}</h3>
		<Bits bits={slots} />
	{/if}

	{#if exports?.length}
		<h3>{pluralize(exports, 'Export')}</h3>
		<Bits bits={exports} />
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
		// background: var(--bg-b);
		background: hsl(228, 15%, 7%);

		border-radius: var(--radius);
		box-shadow: var(--shadow-lg);

		font-family: var(--font-b);
		font-variation-settings: 'wght' 300;
		letter-spacing: 0.5px;

		outline: none;
		z-index: 1;

		font-size: var(--font-sm);
	}

	.summary {
		padding-top: 1rem;

		font-size: 1rem;
		line-height: 1.6rem;
		letter-spacing: 0.6px;
		word-spacing: 1px;

		:global(code:not(pre code)) {
			background: var(--bg-a);
			color: var(--brand-b);
			font-size: 13px !important;

			padding: 0.1rem 0.4rem;
			margin: 0 0.2rem;
			border-radius: 0.2rem;
		}

		:global(a) {
			color: var(--brand-a) !important;
		}
	}

	h1 {
		color: var(--fg-a);

		font-size: 1.5rem;

		scroll-padding-top: 3rem !important;
	}

	h3 {
		margin-top: 1.5rem;
		margin-bottom: 0.5rem;

		text-align: center;
		font-size: var(--font-md);
		color: var(--fg-a);
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
