<script>
	import { fly } from 'svelte/transition'
	import Item from './Item.svelte'
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
		Mounts an element on Svelte's <span
			class="token language-javascript"
			style="display: inline; padding: 2px 5px; font-style: normal; font-size: 0.8rem; margin: 0 3px;"
			>onMount</span
		>
		<a href="https://svelte.dev/docs#onMount" target="_blank">
			lifecycle hook
		</a>.
	</div>

	<button on:click={reload}>window.location.reload()</button>
	<div class="result" slot="result">
		{#if mounted}
			<OnMount>
				<div in:fly={{ x: 100, duration: 1000 }}>
					My intro transition will always play!
				</div>
			</OnMount>
		{/if}
	</div>
</Item>

<style>
	.result {
		min-height: 22px;
	}
	button {
		width: max-content;
		margin: 0.5rem auto auto auto;
		background: var(--text-a);
		color: var(--bg-a);
		border-radius: var(--border-radius);
		font-size: 0.9rem;
		padding: 3px 5px;
	}
</style>
