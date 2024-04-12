<script lang="ts">
	import { BinauralBeats } from './beats/BinauralBeats'
	import { onMount } from 'svelte'

	onMount(() => {
		new BinauralBeats({ volume: 0.5 })
	})
</script>
