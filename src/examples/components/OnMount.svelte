<script>
	import Item from '../_lib.svelte/Item/Item.svelte'
	import { fly } from 'svelte/transition'
	import { OnMount } from '$lib'
	import Example from '$examples/_lib.svelte/Item/Example.svelte'

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

<Item title="OnMount" type="component" {path} --eg-h="258px">
	<div slot="description">
		Mounts an element on Svelte's <span> onMount </span>
		<a href="https://svelte.dev/docs#onMount" target="_blank"> lifecycle hook </a>.
	</div>

	<Example {example}>
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
	}
</style>
