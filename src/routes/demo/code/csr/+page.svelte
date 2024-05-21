<script>
	import { keys, Code } from '$lib'

	const code = {
		typescript: `import { writable } from 'svelte/store'

export const count = writable(0)
`,
		svelte: `<script>
    import { count } from './store.js' // [!code --]
    import { count } from './store' // [!code ++]
<\/script>

<button on:click={() => $count++}>count: {$count}</button>
`,
	}
</script>

{#each keys(code) as lang}
	<Code text={code[lang]} {lang} title={lang} />
{/each}
