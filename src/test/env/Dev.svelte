<script>
	import Item from '$test/Item.svelte'
	import { dev } from '$lib'
	const example = `<script>
	import { dev } from 'fractils'
<\/script>

This app {dev ? 'is' : 'is not'} in development mode.
`
</script>

<Item title="dev" type="boolean" {example}>
	<div slot="description">
		A boolean value indicating whether the app is in development mode.
	</div>

	<div slot="result" style="padding: 1rem;">
		This app {dev ? 'is' : 'is not'} in development mode.
	</div>
</Item>
