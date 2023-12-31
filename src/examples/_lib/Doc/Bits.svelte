<script lang="ts">
	import type { Bit } from '$scripts/extractinator/src/types'

	export let bits: Bit[]
	export let title = ''
</script>

<div class="bits">
	{#if title}
		<h2 class="title">{title}</h2>
	{/if}

	{#each bits as p}
		{@const defaultValue = p.comment?.defaultValue}
		<div class="bit col">
			<div class="keys row">
				<div class="key top">
					<div class="row">
						<div class="key name">{p.name}</div>
					</div>

					<div class="code">{p.type}</div>
				</div>
			</div>

			{#if p.comment?.summary}
				<div class="description">{@html p.comment.summary}</div>
			{/if}

			{#if defaultValue}
				<div
					class="row default"
					class:bool={defaultValue == 'true' || defaultValue == 'false'}
					><span class="tagname">default</span>
					{@html defaultValue}</div
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
		line-height: 1.4;
	}

	.tagname {
		color: var(--fg-d);
		padding-left: 0.66rem;
		padding-right: 0.33rem;
	}

	.keys {
		display: flex;
		flex-shrink: 0;

		font-family: var(--font-mono);
	}

	.keys.row {
		flex-direction: row;
		align-items: center;
		height: fit-content;
	}

	.key.name {
		padding: 1px 5px;

		color: var(--fg-a);
		background: var(--bg-a);
		border-radius: 5px;

		font-variation-settings: 'wght' 300;
		letter-spacing: 2px;
		font-size: 1.1rem;
	}

	.key {
		display: flex;
		// justify-content: center;
		align-items: center;

		&,
		.key div {
			width: max-content;
			height: max-content;
			min-width: fit-content;
			flex-wrap: wrap;
		}

		&.top {
			gap: 0.5rem;
			// width: 100%;
			// justify-content: flex-start;

			// .default {
			// 	margin-left: auto;
			// }
		}

		* {
			// overflow-x: hidden;
			word-wrap: pre-wrap;
			// white-space: pre-wrap;
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

	.default {
		filter: saturate(0.5);
		&.bool {
			color: var(--brand-c);
		}
	}
</style>
