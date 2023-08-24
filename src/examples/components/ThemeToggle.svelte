<script>
	import Example from '$examples/_lib/Item/Example.svelte';
	import Params from '$examples/_lib/Item/Params.svelte';
	import { pulse } from '$examples/_lib/lib_stores';
	import Item from '../_lib/Item/Item.svelte';
	import { ThemeToggle, theme } from '$lib';
	import html from './ThemeToggle.html?raw';

	const path = 'components/ThemeToggleExample.svelte';

	let timer;
	let animating = false;
	const handlePulse = () => {
		if (animating) return;
		animating = true;

		if (timer) clearTimeout(timer);
		$pulse = true;
		timer = setTimeout(() => {
			$pulse = false;
			animating = false;
		}, 1000);
	};
</script>

<Item title="ThemeToggle" type="component" {path}>
	<div slot="description">
		A simple component to toggle between light and dark <a href="#theme">theme</a>.
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

	<Example {html}>
		<div
			class:dark={$theme == 'dark'}
			class:light={$theme == 'light'}
			class="result"
			id="theme-in"
		>
			<div on:pointerdown|stopPropagation|capture={handlePulse}>
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
		box-shadow: var(--shadow-inset);

		overflow: hidden;
		transition: background-color 0.2s;
	}

	.dark {
		color: var(--fg-a);
		background-color: var(--bg-a);
		border-radius: var(--border-radius);
	}

	.light {
		color: var(--bg-a);
		background: var(--fg-d);
		border-radius: var(--border-radius);

		box-shadow: -2px 2px 5px 1px #000a inset;
	}
</style>
