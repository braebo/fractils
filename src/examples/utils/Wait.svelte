<script>
	import Item from '../Item.svelte'
	import { wait } from '$lib'
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

<Item title="wait" type="function" {example} {path} --eg-h="332px">
	<div slot="description">
		A simple wait timer.
		<div class="param">
			<span class="var">param</span> <span class="var-title">t</span> — &nbsp;Time to wait in ms
		</div>
		<div class="param">
			<span class="var">returns</span> A promise that resolves after t ms
		</div>
	</div>

	<div class="result" slot="result">
		<p class:active={ready}>ready</p>
		<p class:active={set}>set</p>
		<p class:active={go}>go</p>
	</div>
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
