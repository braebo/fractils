<script>
	import Example from '$examples/_lib/Item/Example.svelte'
	import Params from '$examples/_lib/Item/Params.svelte'
	import Item from '../_lib/Item/Item.svelte'
	import { Range, mapRange } from '$lib'

	const example = `<script>
	import { mapRange } from 'fractils'
	
	let value = 50
    $: valueMapped = mapRange(value, 0, 100, -10, 10)
<\/script>

{value}

<input bind:value type='range'/>

{valueMapped}
`

	const path = 'utils/log.ts'

	const params = [
		{
			type: 'param',
			title: 'value',
			description: 'The value to map.',
		},
		{
			type: 'param',
			title: 'x1',
			description: 'Lower bound of the input range.',
		},
		{
			type: 'param',
			title: 'x2',
			description: 'Upper bound of the input range.',
		},
		{
			type: 'param',
			title: 'y1',
			description: 'Lower bound of the output range.',
		},
		{
			type: 'param',
			title: 'y2',
			description: 'Upper bound of the output range.',
		},
		{
			type: 'returns',
			description: 'A number mapped from the input range to the output range',
		},
	]

	let value = 50,
		valueMapped = '0.00'
	$: valueMapped = mapRange(value, 0, 100, -10, 10).toFixed(2)
</script>

<Item title="mapRange" type="function" {path}>
	<div slot="description">
		Maps a value from one range to another.

		<Params {params} --width="150px" />
	</div>

	<Example {example}>
		<div class="result">
			<div class="col">
				<div class="row value">
					{value}
				</div>
				<Range {value} min={0} max={100} />
				<input type="range" bind:value min="0" max="100" />
				<div class="row">
					{valueMapped}
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

		width: 4rem;
		margin: 0 auto;
		border-radius: 3px;
		height: 23px;
		line-height: 23px;

		text-align: center;

		background: var(--bg-a);
		color: var(--fg-a);
	}
</style>
