export default `<script>
	import { theme, initTheme } from 'fractils'
	import { onMount } from 'svelte'

	onMount(() => initTheme())
<\/script>

{$theme}`