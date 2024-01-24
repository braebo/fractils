<script>
	import Example from '$examples/_lib/Item/Example.svelte';
	import Params from '$examples/_lib/Item/Params.svelte';
	import Item from '../_lib/Item/Item.svelte';
	import html from './Log.html?raw';
	import { log } from '$lib';

	function logger() {
		log('Hello world', '#00bcd4', '#222', 20, 'font-weight: bold;');
	}
	logger();

	const path = 'utils/log.ts';

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
	];
</script>

<Item title="log" type="function" {path}>
	<div slot="description">
		<p>A simple logger that only runs in dev environments.</p>

		<Params {params} --width="150px" />
	</div>

	<Example {html}>
		<div class="result">
			<div class="console">
				<div class="timestamp">04:20:69.173</div>

				<pre class="helloworld">Hello world</pre>
				<div class="file">log.ts:21</div>
			</div>
		</div>
	</Example>

	<br />

	<p class="dim">
		&#9432; &nbsp;
		<em>
			Add <code>log.ts</code> to devtools
			<a href="https://developer.chrome.com/docs/devtools/settings/ignore-list/">
				ignore list
			</a>
			to forward stack traces
			<em
				>(It's pretty annoying when you click on a log's link in devtools and it takes you
				to the logger file instead of the callsite).</em
			>
		</em>
	</p>
</Item>

<style lang="scss">
	.result {
		padding: 0.5rem 0;
	}
	.console {
		display: flex;
		border: 1px solid var(--fg-d);
		border-image: linear-gradient(
				to right,
				transparent,
				var(--bg-d) 5%,
				var(--bg-d) 95%,
				transparent
			)
			1;
		border-right: none;
		border-left: none;
		padding: 0.5rem 0;

		width: 100%;
	}

	pre.helloworld {
		padding: 5px;
		color: var(--brand-a);
		background: var(--bg-b);
		border: 1px solid var(--brand-a);
		font-size: 20px;
		font-weight: bold;
	}

	:global(html[theme='light']) pre.helloworld {
		background: var(--fg-b);
	}

	.timestamp {
		font-size: 11px;
		padding: 2px 12px 0 0.5rem;
	}

	.file {
		font-size: 13px;
		margin-left: auto;

		padding-right: 0.5rem;

		text-decoration: underline;
	}

	pre {
		width: max-content;
		padding: 0 20px;
	}

	em code {
		font-size: 0.9rem;
		font-family: var(--font-mono);
		font-variation-settings: 'wght' 800;
	}

	em em {
		color: var(--fg-d);
	}
</style>
