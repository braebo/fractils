<script lang="ts">
	import type { Bit, SlotBit } from '$scripts/extractinator/src/types'

	export let bits: (Bit | SlotBit)[]
</script>

<div class="bits">
	{#each bits as p}
		{@const defaultValue = p.comment?.defaultValue}
		<div class="bit col">
			<div class="keys row">
				<div class="key top">
					<div class="row">
						<div class="key name">{p.name}</div>
					</div>

					<!-- {#if 'type' in p}
						<div class="code">{p.type}</div>
					{/if} -->
				</div>
			</div>

			<div>
				{#if 'type' in p}
					<div
						class="row code"
						class:bool={defaultValue == 'true' || defaultValue == 'false'}
					>
						<span class="sep" />
						<span class="tagname">type</span>
						{@html p.type}
					</div>
				{/if}

				{#if defaultValue}
					<div
						class="row default"
						class:bool={defaultValue == 'true' || defaultValue == 'false'}
					>
						<span class="sep" />
						<span class="tagname">default</span>
						{@html defaultValue}
					</div>
				{/if}
			</div>

			{#if p.comment?.summary}
				<div class="description">{@html p.comment.summary}</div>
			{/if}
		</div>
	{/each}
</div>

<style lang="scss">
	.bits {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;

		font-family: var(--font-b);
	}

	.bit {
		padding: 0 1.5rem;
		gap: 0.25rem;
	}

	.description {
		margin-top: 0.25rem;
		padding-left: 2rem;
		line-height: 1.4;
		color: var(--fg-d);
	}

	.tagname {
		// color: var(--fg-d);
		padding-left: 0.33rem;
		padding-right: 0.33rem;
		width: 5rem;
		color: var(--fg-c);
	}

	.keys {
		display: flex;
		flex-shrink: 0;

		font-family: var(--font-mono);
	}

	.row {
		flex-direction: row;
		align-items: center;
		height: fit-content;
	}

	.key.name {
		padding: 2px 7px;

		color: var(--fg-a);
		background: var(--bg-a);

		// color: var(--theme-a);
		// background: rgb(26, 26, 26);
		// background: black;
		border-radius: var(--radius-sm);
		font-variation-settings: 'wght' 400;
		font-variation-settings: 'wght' 300;

		// outline: 1px solid rgba(var(--fg-d-rgb), 0.25);

		// letter-spacing: 1px;
		font-size: 1.1rem;
	}

	.sep {
		width: 3px;
		height: 3px;
		// height: 0.75rem;
		background: rgba(var(--fg-d-rgb), 0.5);
		margin-bottom: -3px;
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
	:global(.description span.code),
	:global(.description span.default) {
		font-size: 0.85rem;
		font-variation-settings: 'wght' 500;
		// background: var(--bg-b) !important;
		padding: 3px 7px 4px 7px;
		color: var(--fg-a) !important;
	}

	.code,
	.default,
	:global(.bit .row code) {
		// background: var(--bg-c);
		background: none;
		color: var(--fg-d);
		color: var(--theme-b);
		font-size: 0.85rem;
		padding: 3px 7px 4px 7px;
		border-radius: 5px;
		font-variation-settings: 'wght' 250;
		font-family: var(--font-mono);
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

	.row {
		font-family: var(--font-mono);
		font-size: var(--font-xs);
		&.bool {
			color: var(--theme-c);
		}
	}
</style>
