<script>
	import Example from '$examples/_lib/Item/Example.svelte';
	import Params from '$examples/_lib/Item/Params.svelte';
	import { pulse } from '$examples/_lib/lib_stores';
	import Item from '../_lib/Item/Item.svelte';
	import { Tooltip, theme } from '$lib';
	import html from './Tooltip.html?raw';

	const path = 'components/Tooltip.svelte';

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

<Item title="Tooltip" type="component" {path} --width="190px">
	<div slot="description">
		A thin Svelte wrapper around the <span class="code">tippy.js</span> library for easy
		tooltips.
		<Params
			params={[
				{
					type: 'prop',
					title: 'content',
					description: 'Text content of the tooltip.',
				},
				{
					type: 'prop',
					title: 'placement',
					description: '<span class="code">top | right | bottom | left</span>.',
				},
				{
					type: 'prop',
					title: 'delay',
					description: 'Intro & outro delay in ms.  Default [500, 100].',
				},
				{
					type: 'prop',
					title: 'offset',
					description: 'X and Y offset in px.  Default [10, 0].',
				},
				{
					type: 'prop',
					title: 'arrow',
					description: 'Whether to show the arrow connecting the tooltip to the target.',
				},
				{
					type: 'prop',
					title: 'interactive',
					description: 'Whether the tooltip should be interactive.',
				},
				{
					type: 'prop',
					title: 'display',
					description: '<span class="code">none | contents</span>',
				},
				{
					type: 'prop',
					title: 'instance',
					description: 'The tippy instance in case you need to access it.',
				},
			]}
		/>
	</div>

	<Example {html}>
		<div class="result">
			<Tooltip content="Thanks!">
				<div class="hover-1"> Hover over me! </div>
			</Tooltip>
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

	.hover-1 {
		color: var(--fg-a);
		background-color: var(--bg-a);
		border-radius: var(--border-radius);
	}
</style>
