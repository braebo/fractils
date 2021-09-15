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
		A simple wait timer.
		<div class="param">
			<span>param</span> t - time to wait in ms
		</div>
		<div class="param">
			<span>returns</span> a promise that resolves after t ms
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
