<script context="module">
	export const ssr = false;
</script>

<script lang="ts">
	import ClickOutside from '../test/ClickOutside.svelte'
	import Browser from './../test/Browser.svelte'
	import Item from '../test/Item.svelte'
	import { dev } from '$lib'
	import '../prism.css'
	import '../app.css'
</script>

<Item title='dev'>
	A boolean value indicating whether the app is in development mode.
	
	<pre>
		This app {dev ? 'is' : 'is not'} in development mode.
	</pre>
</Item>

<br />

<Browser />

<br />

<ClickOutside />
