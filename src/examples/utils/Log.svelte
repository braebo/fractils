<script>
	import Item from '../_lib.svelte/Item/Item.svelte'
	import { log } from '$lib'
	import Example from '$examples/_lib.svelte/Item/Example.svelte'

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
</script>

<Item title="log" type="function" {path}>
	<div slot="description">
		A simple logger that only runs in dev environments.
		<div class="param">
			<span class="var">param</span> <span class="var-title">msg</span> — &nbsp;A string or object
			to log
		</div>
		<div class="param">
			<span class="var">param</span> <span class="var-title">color</span> — &nbsp;Any CSS color
			value ( named | hex | rgb | hsl )
		</div>
		<div class="param">
			<span class="var">param</span> <span class="var-title">bgColor</span> — &nbsp;Same as color
			⇧
		</div>
		<div class="param">
			<span class="var">param</span> <span class="var-title">fontSize</span> — &nbsp;Any number
		</div>
		<div class="param">
			<span class="var">param</span> <span class="var-title">css</span> — &nbsp;Optional additional
			CSS
		</div>
	</div>

	<Example {example}>
		<div class="result">
			<!-- prettier-ignore -->
			<div class="timestamp">04:20:69.173</div>

			<pre
				style="padding:5px;color:#00bcd4;background:var(--text-a);border:1px solid lightblue;font-size:20px;font-weight: bold;">Hello world</pre>
			<div class="file">log.ts:22</div>
		</div>
	</Example>
</Item>

<style>
	.result {
		display: flex;

		border: 1px solid #999;
		border-left: none;
		border-right: none;
		padding: 5px;
		margin: 1rem 0;
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
