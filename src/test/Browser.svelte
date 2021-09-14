<script>
	import Item from './Item.svelte'
	import { browser } from '$lib'

	const example = `<script>
	import { browser } from '$lib'
<\/script>

This app {browser ? 'is' : 'is not'} running in a browser.
`
</script>

<Item title="browser" type="boolean" {example}>
	<div slot="description">
		Indicates whether the app is running in the browser.
	</div>

	<div slot="result">
		This app {browser ? 'is' : 'is not'} running in a browser.
	</div>
</Item>
