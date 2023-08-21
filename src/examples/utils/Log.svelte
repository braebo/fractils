<script>
	import Item from '../_lib/Item/Item.svelte'
	import { log } from '$lib'
	import Example from '$examples/_lib/Item/Example.svelte'
	import Params from '$examples/_lib/Item/Params.svelte'

	const example = `<script>
	import { log } from 'fractils'
    
    log('Hello world', 'blue', '#222', 20, 'font-weight: bold;')
<\/script>
`

	function logger() {
		log('Hello world', '#00bcd4', '#222', 20, 'font-weight: bold;')
	}
	logger()

	const path = 'utils/log.ts'

	const params = [
		{
			type: 'param',
			title: 'msg',
			description: 'A string or object to log.',
		},
		{
			type: 'param',
			title: 'color',
			description: 'Any CSS color value ( named | hex | rgb | hsl ).',
		},
		{
			type: 'param',
			title: 'bgColor',
			description: 'Same as color ⇧.',
		},
		{
			type: 'param',
			title: 'fontSize',
			description: 'Any number.',
		},
		{
			type: 'param',
			title: 'css',
			description: 'Optional additional CSS.',
		},
	]
</script>

<Item title="log" type="function" {path}>
	<div slot="description">
		A simple logger that only runs in dev environments.

		<Params {params} --width="150px" />
	</div>

	<Example {example}>
		<div class="result">
			<div class="timestamp">04:20:69.173</div>

			<pre
				style="padding:5px;color:#00bcd4;background:var(--fg-d);border:1px solid lightblue;font-size:20px;font-weight: bold;">Hello world</pre>
			<div class="file">log.ts:22</div>
		</div>
	</Example>
</Item>

<style>
	.result {
		display: flex;

		border: 1px solid #999;
		border-right: none;
		border-left: none;
		padding: 5px;
	}
	.timestamp {
		font-size: 11px;
		padding: 2px 12px 0 0;
	}
	.file {
		font-size: 13px;
		margin-left: auto;

		text-decoration: underline;
	}
	pre {
		width: max-content;
		padding: 0 20px;
	}
</style>
