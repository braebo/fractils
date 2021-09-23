<script>
	import Item from '../_lib.svelte/Item/Item.svelte'
	import { wait } from '$lib'
	import Example from '$examples/_lib.svelte/Item/Example.svelte'
	const example = `<script>
	import { wait } from 'fractils'
    
    let ready, set, go
	async function start() {
		ready = true
		await wait(500)
		set = true
		await wait(500)
		go = true
	}
<\/script>
`

	let ready, set, go
	async function start() {
		ready = true
		await wait(500)
		set = true
		await wait(500)
		go = true
		await wait(1500)
		ready = false
		set = false
		go = false
	}

	const path = 'utils/wait.ts'
</script>

<Item title="wait" type="function" {path}>
	<div slot="description">
		A simple wait timer.
		<div class="param">
			<span class="var">param</span> <span class="var-title">t</span> — &nbsp;Time to wait in ms
		</div>
		<div class="param">
			<span class="var">returns</span> A promise that resolves after t ms
		</div>
	</div>

	<Example {example} --h="332px">
		<div class="result">
			<p class:active={ready}>ready</p>
			<p class:active={set}>set</p>
			<p class:active={go}>go</p>
		</div>
	</Example>
	<button on:click={() => start()}>start()</button>
</Item>

<style>
	p {
		text-align: center;
	}

	.active {
		color: green;
	}
</style>
