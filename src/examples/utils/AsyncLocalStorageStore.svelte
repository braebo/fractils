<script lang="ts">
	import { asyncLocalStorageStore, OnMount } from '$lib'
	import { fade } from 'svelte/transition'
	import Item from '../Item.svelte'

	const example = `<script>
	import { asyncLocalStorageStore } from 'fractils'
    
    const theme = asyncLocalStorageStore('count', 0)
<\/script>

<div on:click='{() => $count++}'>+<\/div>
	{$count}
<div on:click='{() => $count--}'>-<\/div>
`

	const count = asyncLocalStorageStore('count', 1)

	const path = 'utils/asyncLocalStorageStore.ts'
</script>

<Item title="asyncLocalStorageStore" type="store" {example} {path} --eg-h="260px">
	<div class="description" slot="description">
		A Svelte store that persists to localStorage.
		<div class="param">
			<span class="var">param</span> <span class="var-title">key</span> — &nbsp;The key to store
			the data under.
		</div>
		<div class="param">
			<span class="var">param</span> <span class="var-title">value</span> — &nbsp;The initial value
			of the store.
		</div>
		<div class="param">
			<span class="var">returns</span> A writable store.
		</div>
	</div>

	<div class="result" slot="result">
		<div class="button" on:click={() => $count++}>+</div>
		<OnMount><div class="count" in:fade={{ delay: 250 }}>{$count}</div></OnMount>
		<div class="button" on:click={() => $count--}>-</div>
	</div>
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
