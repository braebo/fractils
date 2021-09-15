<script>
	import Item from '../Item.svelte'
	import { fly } from 'svelte/transition'
	import { asyncLocalStorageStore } from '$lib'

	const example = `<script>
	import { asyncLocalStorageStore } from 'fractils'
    
    const theme = asyncLocalStorageStore('theme', 'light')
<\/script>

<div on:click="{() => $theme = $theme == 'dark' ? 'light' : 'dark'}">
	{$theme == 'dark' ? '🔆' : '🌙'}
<\/div>
`

	const theme = asyncLocalStorageStore('theme', 'light')
</script>

<Item title="asyncLocalStorageStore" type="store" {example}>
	<div slot="description">
		A Svelte store that persists to localStorage.
		<div class="param">
			<span>param</span> key - The key to store the data under.
		</div>
		<div class="param">
			<span>param</span> value - The initial value of the store.
		</div>
		<div class="param">
			<span>returns</span> A writable store.
		</div>
	</div>

	<div class="result" class:dark={$theme == 'dark'} slot="result">
		{#key $theme}
			<div
				on:click={() => ($theme = $theme == 'dark' ? 'light' : 'dark')}
				transition:fly={{ y: 35, duration: 1000, opacity: 1 }}
			>
				{$theme == 'dark' ? '🔆' : '🌙'}
			</div>
		{/key}
	</div>
</Item>

<style>
	.result {
		position: relative;
		overflow: hidden;

		height: 50px;

		border-radius: var(--border-radius);

		text-align: center;
	}
	.result div {
		position: absolute;
		inset: 0;

		height: 30px;
		margin: auto;

		cursor: pointer;
		user-select: none;
	}
	.dark {
		background: #1d1d1d;
	}
</style>
