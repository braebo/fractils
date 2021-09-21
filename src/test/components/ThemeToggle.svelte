<script>
	import { onMount } from 'svelte'
	import Item from '../Item.svelte'

	let TT
	async function init() {
		const { ThemeToggle } = await import('../../lib')
		TT = ThemeToggle
	}

	const example = `<script>
    import { ThemeToggle } from 'fractils'
<\/script>

<ThemeToggle />
`
	let mounted = true

	const reload = () => {
		mounted = false
		setTimeout(() => {
			mounted = true
		}, 0)
	}

	onMount(() => {
		init()
	})
</script>

<Item title="ThemeToggle" type="component" {example}>
	<div slot="description">A simple component to toggle between light and dark themes.</div>

	<div class="result" slot="result">
		{#if TT}
			<svelte:component this={TT} />
		{/if}
	</div>
</Item>

<style>
	.result {
		min-height: 54px;
	}
</style>
