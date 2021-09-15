<script>
	import { fly } from 'svelte/transition'
	import Item from '../Item.svelte'
	import { OnMount } from '$lib'

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
</script>

<Item title="OnMount" type="component" {example}>
	<div slot="description">
		Mounts an element on Svelte's <span> onMount </span>
		<a href="https://svelte.dev/docs#onMount" target="_blank">
			lifecycle hook
		</a>.
	</div>

	<button on:click={reload}>window.location.reload()</button>
	<div class="result" slot="result">
		{#if mounted}
			<OnMount>
				<div in:fly={{ y: 40, duration: 1000 }}>
					My intro transition will always play!
				</div>
			</OnMount>
		{/if}
	</div>
</Item>

<style>
	.result {
		min-height: 54px;
		overflow: hidden;
	}
</style>
