<script lang="ts">
	import type { ParsedSvelteFile } from '$scripts/extractinator/src/types'
	import type { PageData } from './$types'

	import Doc from '$examples/_lib/Doc/Doc.svelte'

	export let data: PageData

	function isSvelteFile(file: any): file is ParsedSvelteFile {
		return file.componentName !== undefined
	}
</script>

{#each data.docs as { path, contents }}
	{#if isSvelteFile(contents)}
		<Doc doc={contents} />
	{:else}
		<center><h3>{contents.fileName}</h3></center>
	{/if}
{/each}
