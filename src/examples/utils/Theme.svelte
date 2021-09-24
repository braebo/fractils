<script lang="ts">
	import Example from '$examples/_lib.svelte/Item/Example.svelte'
	import Params from '$examples/_lib.svelte/Item/Params.svelte'
	import { pulse } from '$examples/_lib.svelte/lib_stores'
	import { theme, applyTheme, toggleTheme } from '$lib'
	import Item from '../_lib.svelte/Item/Item.svelte'

	const params = [
		{
			type: 'store',
			title: 'theme',
			description: 'A writable, persistant store to manage the active theme.',
		},
		{
			type: 'function',
			title: 'initTheme',
			description:
				'Initializes theme from system preference or theme store and registers a prefers-media listener for changes.',
		},
		{
			type: 'function',
			title: 'toggleTheme',
			description: `Toggles <span class="code inline">$theme</span> to and from light and dark mode.`,
			child: {
				type: 'param',
				title: 'newTheme',
				description: 'The theme to apply.',
			},
		},
	]

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

<Item title="Theme" type="store + functions" {path}>
	<div slot="description">
		A series of utilitites for managing the active theme.
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
					description:
						'Initializes theme from system preference or theme store and registers a prefers-media listener for changes.',
				},
			]}
			--width="183px"
		/>
	</div>

	<Example {example}>
		<div class="result" id="theme-out" class:dark={theme2 == 'dark'}>
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
				child: {
					type: 'param',
					title: 'newTheme',
					description: 'The theme to apply.',
				},
			},
		]}
		--width="183px"
	/>

	<br />
	<Example example={example2}>
		<div class="result" id="theme-in2" class:dark={theme2 == 'dark'}>
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

	.row {
		display: flex;
		justify-content: space-evenly;

		width: 100%;
	}
</style>
