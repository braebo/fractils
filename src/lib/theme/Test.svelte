<script>
	import { writable } from 'svelte/store'

	// Example initialization
	const themes = writable([{ title: 'default' }, { title: 'dark' }, { title: 'light' }])
	const theme = writable({ title: 'default' })
</script>

<select value={$theme.title} on:change={() => {}}>
	{#each $themes.sort((a, b) => a.title.localeCompare(b.title)) as themeValue}
		<option value={themeValue.title}>{themeValue.title}</option>
	{/each}
</select>

{JSON.stringify($theme, null, 2)}
