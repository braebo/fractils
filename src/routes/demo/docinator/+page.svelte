<!-- hmr-reset -->

<script lang="ts">
	import type { PageData } from './$types'

	import Doc from '$examples/_lib/Doc/Doc.svelte'

	export let data: PageData
</script>

{#each data.docs as contents}
	{#if contents}
		<Doc doc={contents} />
	{/if}
{/each}
