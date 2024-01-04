<!-- hmr-reset -->

<script lang="ts">
	import type { ParsedSvelteFile } from '$scripts/extractinator/src/types'
	import type { PageData } from './$types'

	import Doc from '$examples/_lib/Doc/Doc.svelte'

	export let data: PageData

	function isSvelteFile(file: any): file is ParsedSvelteFile {
		return file.type === 'svelte'
	}

	// if (BROWSER) console.log(data.docs[0])
</script>

{#each data.docs as contents}
	{#if contents}
		<Doc doc={contents} />
	{/if}
{/each}
