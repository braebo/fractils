<script>
	import Item from '../Item.svelte'
	import { log } from '$lib'

	const example = `<script>
	import { log } from 'fractils'
    
    log('Hello world', 'orange', '#333', 20, 'font-weight: bold;')
<\/script>
`

	function logger() {
		log('Hello world', 'orange', '#333', 20, 'font-weight: bold;')
	}
	logger()
</script>

<Item title="log" type="function" {example}>
	<div slot="description">
		A simple logger that only runs in dev environments.
		<div class="param">
			<span>param</span> msg - A string or object to log
		</div>
		<div class="param">
			<span>param</span> color - Any CSS color value ( named | hex | rgb |
			hsl )
		</div>
		<div class="param">
			<span>param</span> bgColor - Same as color ⇧
		</div>
		<div class="param">
			<span>param</span> fontSize - Any number
		</div>
		<div class="param">
			<span>param</span> css - Optional additional CSS
		</div>
	</div>

	<div class="result" slot="result">
		<!-- prettier-ignore -->
		<div class="timestamp">04:20:69.173</div>

		<pre
			style="padding:5px;color:orange;background:#333;border:1px solid orange;font-size:20px;font-weight: bold;">Hello world</pre>
		<div class="file">log.ts:22</div>
		<!-- <button on:click={() => logger()}>log()</button> -->
	</div>
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
		font-size: 8px;
		padding-right: 12px;
	}
	.file {
		font-size: 13px;
		margin-left: auto;
	}
	pre {
		width: max-content;
		padding: 0 20px;
	}
</style>
