<script lang="ts">
	import type { PageData } from './$types'
	export let data: PageData
</script>

<h1>Demos</h1>

<div class="br-md" />

{#each data.routes as route}
	<a href="/demo/{route}">{route}</a>
{/each}

<style lang="scss">
	a {
		margin: 1rem auto;
	}
</style>
