<script>
	import Example from '$examples/_lib/Item/Example.svelte';
	import Params from '$examples/_lib/Item/Params.svelte';
	import Range from '$lib/components/Range.svelte';
	import Item from '../_lib/Item/Item.svelte';
	import html from './Clamp.html?raw';
	import { clamp } from '$lib';

	const path = 'utils/clamp.ts';

	const params = [
		{
			type: 'param',
			title: 'value',
			description: 'The value to clamp.',
		},
		{
			type: 'param',
			title: 'min',
			description: 'The minimum return value.',
		},
		{
			type: 'param',
			title: 'max',
			description: 'The maximum return value.',
		},
		{
			type: 'returns',
			description: 'The value clamped between the minimum and maximum.',
		},
	];

	$: value = clamp(value ?? 50, 25, 75);
</script>

<Item title="clamp" type="function" {path}>
	<div slot="description">
		Clamps a value between a minimum and maximum.

		<Params {params} --width="150px" />
	</div>

	<Example {html}>
		<div class="result">
			<div class="col">
				<div class="row value">
					{value}
				</div>
				<div
					class="range-wrapper"
					class:minClamped={value === 25}
					class:maxClamped={value === 75}
				>
					<Range bind:value min={0} max={100} step={1} />
				</div>
			</div>
		</div>
	</Example>
</Item>

<style>
	.result {
		display: flex;

		padding: 5px;
	}

	.col {
		display: flex;
		flex-direction: column;
		justify-content: space-around;

		width: 100%;
		height: 75px;
	}

	.row {
		display: flex;
		justify-content: center;

		width: 3rem;
		padding: 0.25rem 1rem;
		margin: 0 auto;
		border-radius: 5px;

		text-align: center;
	}

	.range-wrapper {
		position: relative;
		width: 75%;
		margin: 0 auto;
	}

	.range-wrapper.minClamped::before,
	.range-wrapper.maxClamped::after {
		color: tomato;
	}

	.range-wrapper::before {
		content: '|';
		position: absolute;
		top: -1.5rem;
		left: 25%;
	}
	.range-wrapper::after {
		content: '|';
		position: absolute;
		top: -1.5rem;
		left: 75%;
	}
</style>
