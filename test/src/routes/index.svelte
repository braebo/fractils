<script context="module">
	export const ssr = true;
</script>

<script>
	// import ThemeToggle from '../../../src/lib/components/ThemeToggle.svelte';
	// import { theme, initTheme } from '../../../src/lib/theme';
	import { theme, initTheme, ThemeToggle } from 'fractils';
	import { onMount } from 'svelte';

	onMount(async () => {
		await initTheme();
		console.log($theme);
		localStorage.clear();
	});
</script>

<ThemeToggle init={false} />

{$theme}
