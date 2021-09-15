<script>
	import Item from '../Item.svelte'
	import { browser } from '$lib'

	const example = `<script>
	import { browser } from 'fractils'
<\/script>

This app {browser ? 'is' : 'is not'} running in a browser.
`
</script>

<Item title="browser" type="boolean" {example}>
	<div slot="description">
		Indicates whether the app is running in the browser.
	</div>

	<div slot="result" style="padding: 1rem;">
		This app {browser ? 'is' : 'is not'} running in a browser.
	</div>
</Item>
