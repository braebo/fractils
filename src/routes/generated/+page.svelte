<!-- hmr-reset -->

<script lang="ts">
	import type { PageData } from './$types'

	import Doc from '$examples/_lib/Doc/Doc.svelte'
	import Resizable from '$lib/utils/Resizable.svelte'

	export let data: PageData
</script>

<Resizable>
	<h1 class="col">wow</h1>
</Resizable>

<Resizable --width="5rem" />

{#each data.docs as contents}
	{#if contents}
		<Doc doc={contents} />
	{/if}
{/each}
