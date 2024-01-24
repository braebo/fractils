<script lang="ts">
	import Example from '$examples/_lib/Item/Example.svelte';
	import Params from '$examples/_lib/Item/Params.svelte';
	import { theme, applyTheme, toggleTheme } from '$lib';
	import { pulse } from '$examples/_lib/lib_stores';
	import Item from '../_lib/Item/Item.svelte';
	import html2 from './Theme2.html?raw';
	import html from './Theme.html?raw';
	import { onMount } from 'svelte';

	let theme2: string = $theme;
	let timer: ReturnType<typeof setTimeout> | null = null;
	const updateTheme = (theme: string) => {
		if (timer) clearTimeout(timer);
		timer = setTimeout(() => {
			theme2 = theme;
		}, 900);
	};

	$: {
		$pulse;
		updateTheme($theme);
	}

	// $: {
	// 	$theme;
	// 	if (!$pulse) theme2 = $theme;
	// }

	function toggle(theme?: 'light' | 'dark') {
		if (theme) {
			applyTheme(theme);
		} else {
			toggleTheme();
		}
		$pulse = !$pulse;
	}

	onMount(() => {
		// applyTheme('dark');
	});

	const path = 'theme/index.ts';
</script>

<Item title="theme" type="store + functions" {path}>
	<div slot="description">
		A series of utilitites for managing the active theme. <span
			class="code"
			style:display="inline">{'<ThemeToggle />'}</span
		>
		component manages all of this by default.
		<Params
			params={[
				{
					type: 'store',
					title: 'theme',
					description: 'A writable, persistant store to manage the active theme.',
				},
				{
					type: 'function',
					title: 'initTheme',
					description: `Initializes theme from system preference or theme store and registers a prefers-media listener for changes.<br/><em>note: &lt;ThemeToggle /&gt; component does this for you.</em>`,
				},
			]}
			--width="183px"
		/>
	</div>

	<Example {html}>
		<div
			class="result"
			id="theme-out"
			class:dark={theme2 == 'dark'}
			class:light={theme2 == 'light'}
		>
			{#key theme}{theme2}{/key}
		</div>
	</Example>

	<br />
	<Params
		params={[
			{
				type: 'function',
				title: 'toggleTheme',
				description: `Toggles <span class="code inline">$theme</span> to and from light and dark mode.`,
			},
			{
				type: 'function',
				title: 'applyTheme',
				description: `Manually apply a specific theme.`,
				children: [
					{
						type: 'param',
						title: 'newTheme',
						description: 'The theme to apply.',
					},
				],
			},
		]}
		--width="183px"
	/>

	<br />
	<Example html={html2}>
		<div
			class="result"
			id="theme-in2"
			class:dark={theme2 == 'dark'}
			class:light={theme2 == 'light'}
		>
			{#key theme}
				<div class="row">
					<button on:click={() => toggle('light')}> Light </button>
					<button on:click={() => toggle()}> Toggle </button>
					<button on:click={() => toggle('dark')}> Dark </button>
				</div>
			{/key}
		</div>
	</Example>
</Item>

<style lang="scss">
	.result {
		display: flex;

		text-align: center;
		box-shadow: var(--shadow-inset-b);

		transition: 0.1s;
	}

	.dark {
		color: var(--fg-d);
		background: var(--bg-a);
		border-radius: var(--radius);
	}

	.light {
		color: var(--bg-a);
		background: var(--fg-d);
		border-radius: var(--radius);
	}

	.row {
		display: flex;
		justify-content: space-evenly;

		width: 100%;
	}
</style>
