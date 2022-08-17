<script>
	import Item from '../_lib/Item/Item.svelte'
	import { fly } from 'svelte/transition'
	import { OnMount } from '$lib'
	import Example from '$examples/_lib/Item/Example.svelte'

	const example = `<script>
    import { OnMount } from 'fractils'
<\/script>

<OnMount>
    <div in:fly={{ x: 100, duration: 1000 }}>
        My intro transition will always play!
    </div>
</OnMount>
`
	let mounted = true

	const reload = () => {
		mounted = false
		setTimeout(() => {
			mounted = true
		}, 0)
	}

	const path = 'components/OnMount.svelte'
</script>

<Item title="OnMount" type="component" {path}>
	<div slot="description">
		Mounts an element on Svelte's <span> onMount </span>
		<a href="https://svelte.dev/docs#onMount" target="_blank"> lifecycle hook </a>. Often used
		to force a svelte transition to play on page-load.
	</div>

	<Example {example} --h="258px">
		<div class="result">
			{#if mounted}
				<OnMount>
					<div in:fly={{ y: 40, duration: 1000 }}>
						My intro transition will always play!
					</div>
				</OnMount>
			{/if}
		</div>
	</Example>

	<button on:click={reload}>window.location.reload()</button>
</Item>

<style>
	.result {
		min-height: 54px;

		overflow: hidden;

		outline: 1px solid white;
		border-radius: var(--border-radius);
	}
</style>
