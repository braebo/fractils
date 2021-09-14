<script context="module">
	export const ssr = false
</script>

<script lang="ts">
	import ClickOutside from '../test/ClickOutside.svelte'
	import Browser from '../test/Browser.svelte'
	import OnMount from '../test/OnMount.svelte'
	import Dev from '../test/Dev.svelte'
	import 'greset/css/greset.css'
	import '@fontsource/alata'
	import '../prism.css'
	import '../app.scss'
</script>

<Dev />

<Browser />

<ClickOutside />

<OnMount />
