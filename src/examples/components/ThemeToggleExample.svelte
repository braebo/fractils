<script>
	import Example from '$examples/_lib/Item/Example.svelte'
	import Params from '$examples/_lib/Item/Params.svelte'
	import { pulse } from '$examples/_lib/lib_stores'
	import { ThemeToggle, theme, toggleTheme } from '$lib'
	import Item from '../_lib/Item/Item.svelte'

	const example = `<script>
    import { ThemeToggle } from 'fractils'
<\/script>

<ThemeToggle />
`

	const path = 'components/ThemeToggleExample.svelte'

	let timer
	const handlePulse = () => {
		if (timer) clearTimeout(timer)
		$pulse = true
		toggleTheme()
		timer = setTimeout(() => {
			$pulse = false
		}, 1000)
	}
</script>

<Item title="ThemeToggle" type="component" {path}>
	<div slot="description">
		A simple component to toggle between light and dark <a href="#Theme">theme</a>.
		<Params
			params={[
				{
					type: 'prop',
					title: 'init',
					description:
						'Make false to prevent <span class="code inline">initTheme()</span> from being called when the component mounts.  Defaults to true.',
				},
			]}
		/>
	</div>

	<Example {example}>
		<div class:dark={$theme == 'dark'} class="result" id="theme-in">
			<div on:click|stopPropagation|capture={handlePulse}>
				<ThemeToggle />
			</div>
		</div>
	</Example>
</Item>

<style>
	.result {
		display: flex;
		justify-content: center;

		min-height: 54px;

		border-radius: var(--border-radius);

		overflow: hidden;
		transition: background-color 0.2s;
	}
	.dark {
		background-color: #1d1d1d;
		border-radius: var(--border-radius);
	}
</style>
