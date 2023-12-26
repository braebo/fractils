<script lang="ts">
	import type { Bit } from '$scripts/extractinator/src/types'

	import { micromark } from 'micromark'

	export let bits: Bit[]
	export let title = ''

	// let connectorStart = 0
	// let connectorEnd = 0
	// let height = 0
	// let nodeHeight = 0

	// const hasChild = (p: Bit) => p.children != undefined

	// function setConnectorLength(node: Element, options: { position: 'first' | 'last' }) {
	// 	nodeHeight = Math.max(node.clientHeight, nodeHeight)

	// 	if (options.position === 'first') {
	// 		connectorStart = node.getBoundingClientRect().top + nodeHeight
	// 	} else {
	// 		connectorEnd = node.getBoundingClientRect().top + nodeHeight / 2

	// 		height = Math.min(connectorEnd - connectorStart, nodeHeight)
	// 	}
	// }
</script>

<div class="bits">
	{#if title}
		<h2 class="title">{title}</h2>
	{/if}

	{#each bits as p}
		<div class="bit col">
			<div class="keys row">
				<!-- <div class="key name"> -->
				<!-- <div>{p.name}</div> : <div class="code">{p.type}</div> -->
				<div class="key top">
					<div class="row">
						<div class="key name">{p.name}</div>
						<!-- <span class="colon">:</span> -->
					</div>
					<div class="code">{p.type}</div>
				</div>
				<!-- </div> -->

				<!-- <div class="seperator" /> -->
			</div>

			{#if p.comment?.summary}
				<div class="description">{@html p.comment.summary}</div>
			{/if}

			{#if p.comment?.defaultValue}
				<div class="row default"
					><span class="tagname">@default</span>
					{@html p.comment.defaultValue}</div
				>
			{/if}
		</div>
	{/each}
</div>

<style lang="scss">
	.bits {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;

		padding: 1.5rem 0;

		font-family: var(--font-b);
	}

	.bit {
		padding: 0 1.5rem;
		gap: 0.25rem;
	}

	.description {
		padding-left: 0.33rem;
		// white-space: pre-wrap;
		line-height: 1.4;
	}

	.tagname {
		color: var(--fg-d);
		padding-left: 0.66rem;
		padding-right: 0.33rem;
	}

	// .colon {
	// 	color: var(--fg-d);
	// }

	.keys {
		display: flex;
		flex-shrink: 0;

		// width: var(--width, 140px);

		font-family: var(--font-mono);
	}

	.keys.row {
		flex-direction: row;
		align-items: center;
		height: fit-content;
	}

	.key.name {
		padding: 1px 5px;

		color: var(--brand-a);
		background: var(--bg-a);
		border-radius: 5px;

		font-variation-settings: 'wght' 400;
		font-size: 1.1rem;
	}

	.key {
		display: flex;
		justify-content: center;
		align-items: center;

		&,
		.key div {
			width: max-content;
			height: max-content;
		}

		&.top {
			gap: 0.5rem;
		}
	}

	:global(.description em) {
		opacity: 0.5;
		font-family: var(--font-mono);
	}
	:global(.description span.code) {
		font-size: 0.85rem;
		font-variation-settings: 'wght' 500;
		background: var(--bg-b) !important;
		padding: 3px 7px 4px 7px;
		color: var(--fg-a) !important;
	}

	.code,
	:global(.bit .default code) {
		background: var(--bg-c);
		color: var(--fg-d);
		color: var(--brand-b);
		font-size: 0.85rem;
		padding: 3px 7px 4px 7px;
		border-radius: 5px;
		font-variation-settings: 'wght' 200;
	}

	.col {
		display: flex;
		position: relative;
		flex-direction: column;
	}
	.col div {
		position: relative;
		z-index: 2;
	}

	.row {
		display: flex;
		flex-direction: row;
	}
</style>
