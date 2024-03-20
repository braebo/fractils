<script lang="ts">
	import type { PageData } from './$types'
	export let data: PageData
</script>

<div class="br-xl" />

{#each data.routes as route}
	<a href="/demo/{route}">{route}</a>
{/each}

<style lang="scss">
	a {
		margin: 1rem auto;
	}
</style>
