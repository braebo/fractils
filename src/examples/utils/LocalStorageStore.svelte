<script lang="ts">
	import Example from '$examples/_lib/Item/Example.svelte'
	import Params from '$examples/_lib/Item/Params.svelte'
	import { localStorageStore, OnMount } from '$lib'
	import Item from '../_lib/Item/Item.svelte'
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
	//import { localStorageStore } from 'fractils'

	const count = localStorageStore('count', 0)
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

	<Example example={example.replace('//', '')} --h="260px">
		<div class="result">
			<div class="button" on:pointerdown={() => $count--}>-</div>
			<OnMount><div class="count" in:fade={{ delay: 250 }}>{$count}</div></OnMount>
			<div class="button" on:pointerdown={() => $count++}>+</div>
		</div>
	</Example>
	<em>refresh the page and count will persist</em>
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

		transition: 0.3s;
	}

	.button:active {
		filter: contrast(1.5);

		transform: scale(0.95);
	}

	.button:hover {
		outline: 1px solid white;
	}

	.count {
		width: 50px;
		height: 23px;
		line-height: 23px;

		color: white;
		background: var(--fg-d);
		border-radius: var(--border-radius);
	}

	em {
		opacity: 0.65;
		font-family: var(--mono);
		transform: translateY(5px);
		text-align: center;
	}
</style>
