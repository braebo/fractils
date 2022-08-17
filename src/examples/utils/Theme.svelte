<script lang="ts">
	import Example from '$examples/_lib/Item/Example.svelte'
	import Params from '$examples/_lib/Item/Params.svelte'
	import { theme, applyTheme, toggleTheme } from '$lib'
	import { pulse } from '$examples/_lib/lib_stores'
	import Item from '../_lib/Item/Item.svelte'

	const example = `<script>
    import { theme, initTheme } from 'fractils'
	import { onMount } from 'svelte'

	onMount(() => initTheme())
<\/script>

{$theme}
`

	const example2 = `<script>
    import { toggleTheme, applyTheme } from 'fractils'
<\/script>

<button on:click='{() => applyTheme("light")}'> Light </button>
<button on:click='{toggleTheme}'> Toggle </button>
<button on:click='{() => applyTheme("dark")}'> Dark </button>
`

	let theme2 = $theme
	let timer: ReturnType<typeof setTimeout> | null = null
	const updateTheme = (theme: string) => {
		if (timer) clearTimeout(timer)
		timer = setTimeout(() => {
			theme2 = theme
		}, 900)
	}

	$: {
		$pulse
		updateTheme(String($theme))
	}

	$: {
		$theme
		if (!$pulse) theme2 = $theme
	}

	const path = 'theme/index.ts'
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

	<Example {example}>
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
	<Example example={example2}>
		<div
			class="result"
			id="theme-in2"
			class:dark={theme2 == 'dark'}
			class:light={theme2 == 'light'}
		>
			{#key theme}
				<div class="row">
					<button on:click={() => applyTheme('light')}> Light </button>
					<button on:click={toggleTheme}> Toggle </button>
					<button on:click={() => applyTheme('dark')}> Dark </button>
				</div>
			{/key}
		</div>
	</Example>
</Item>

<style lang="scss">
	.result {
		display: flex;

		text-align: center;

		transition: 0.1s;
	}

	.dark {
		color: #ffffff;
		background: #1d1d1d;
		border-radius: var(--border-radius);
	}

	.light {
		color: #1d1d1d;
		background: #ffffff;
		border-radius: var(--border-radius);
	}

	.row {
		display: flex;
		justify-content: space-evenly;

		width: 100%;
	}
</style>
