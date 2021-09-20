<script>
	import { ThemeToggle } from '$lib'
	import Item from '../Item.svelte'

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
</script>

<Item title="ThemeToggle" type="component" {example}>
	<div slot="description">A simple component to toggle between light and dark themes.</div>

	<div class="result" slot="result">
		<ThemeToggle />
	</div>
</Item>

<style>
	.result {
		min-height: 54px;
	}
</style>
