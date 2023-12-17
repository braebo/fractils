<script>
	import Code from '$lib/components/Code.svelte'
	export let data
</script>

<p> This is the source code used to render this highlighed page on the server via ssr. </p>

{#each data.files as { title, text, highlightedText }}

	<Code ssr {title} {text} {highlightedText} /> <!-- [!code focus] -->

{/each}
