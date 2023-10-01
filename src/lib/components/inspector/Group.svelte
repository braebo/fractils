<script lang="ts">
	import type { Writable, Readable } from 'svelte/store'

	import { createEventDispatcher } from 'svelte'
	import { slide } from 'svelte/transition'
	import Row from './Row.svelte'

	export let store: Writable<any> | Readable<any>
	export let isOpen: boolean
	export let label: string

	const dispatch = createEventDispatcher()

	const toggle = () => {
		isOpen = !isOpen
		dispatch('toggle', {
			label,
			isOpen,
		})
	}
</script>

{#if 'subscribe' in store && $store !== (null || 'undefined')}
	<h4 class:isOpen on:click={toggle} on:keydown={toggle}>
		<span>▼</span>
		{label}
	</h4>

	{#if isOpen && 'subscribe' in store}
		<div class="state-data" transition:slide|global>
			{#key $store}
				{#if $store === null}
					<div class="null">null</div>
				{:else if typeof $store === 'object'}
					{#each Object.entries($store) as [key, value]}
						<Row {key} {value} {store} path={key} />
					{/each}
				{:else}
					<Row key={label} value={$store} {store} path={label} simple={true} label={false} />
				{/if}
			{/key}
		</div>
	{/if}
{/if}

<style lang="scss">
	div {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		justify-content: flex-start;
	}

	.state-data {
		padding: 10px;
	}

	h4 {
		border-bottom: solid 1px var(--lowlight);
		border-top: solid 1px var(--highlight);
		box-shadow: var(--level-2, 0 2px 3px rgba(0, 0, 0, 0.1), 0 1px 5px rgba(0, 0, 0, 0.13));
		padding: 4px 6px;
		cursor: pointer;
		margin: 0;

		background: var(--header-bg);
		color: var(--header-color, --color);

		text-transform: capitalize;
		font-family: var(--font-a);
		font-family: 'MonoLisa', monospace;
		font-weight: 400;
		font-size: var(--heading-font-size, 12px);

		span {
			display: inline-block;
			font-size: 10px;
			transform: rotate(-90deg);
			transition: 0.2s transform var(--ease_in_out_quint);
		}

		&.isOpen {
			span {
				transform: rotate(0turn);
			}
		}
	}

	.null {
		font-size: var(--font-small);
		font-family: 'MonoLisa', monospace;

		color: var(--value-color);
	}
</style>
