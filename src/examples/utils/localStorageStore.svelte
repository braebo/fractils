<script lang="ts">
	import Example from '$examples/_lib.svelte/Item/Example.svelte'
	import Params from '$examples/_lib.svelte/Item/Params.svelte'
	import Item from '../_lib.svelte/Item/Item.svelte'
	import { localStorageStore, OnMount } from '$lib'
	import { fade } from 'svelte/transition'

	const params = [
		{
			type: 'param',
			title: 'key',
			description: 'The key to store the data under.',
		},
		{
			type: 'param',
			title: 'value',
			description: 'The initial value of the store.',
		},
		{
			type: 'returns',
			description: 'A writable store.',
		},
	]

	const example = `<script>
	import { localStorageStore } from 'fractils'
    
    const theme = localStorageStore('count', 0)
<\/script>

<div on:click='{() => $count++}'>+<\/div>
	{$count}
<div on:click='{() => $count--}'>-<\/div>
`

	const count = localStorageStore('count', 1)

	const path = 'utils/localStorageStore.ts'
</script>

<Item title="localStorageStore" type="store" {path}>
	<div class="description" slot="description">
		A Svelte store that persists to localStorage.
		<Params {params} />
	</div>

	<Example {example} --h="260px">
		<div class="result">
			<div class="button" on:click={() => $count++}>+</div>
			<OnMount><div class="count" in:fade={{ delay: 250 }}>{$count}</div></OnMount>
			<div class="button" on:click={() => $count--}>-</div>
		</div>
	</Example>
</Item>

<style>
	:global(.example) {
		min-height: 800px;
	}
	.result {
		justify-content: space-between;
		align-items: center;
		position: relative;
		display: flex;

		padding: 0.5rem;

		height: 50px;
		max-width: 150px;
		margin: auto;

		text-align: center;

		border-radius: var(--border-radius);
	}
	.button {
		width: 1.5rem;
		height: 1.5rem;

		line-height: 1.25rem;

		color: white;
		border-radius: 2px;

		background: var(--bg-a);

		cursor: pointer;
		user-select: none;
	}
	.button:active {
		filter: contrast(1.5);

		transform: scale(0.95);
	}
	.count {
		width: 50px;

		background: white;
	}
</style>
