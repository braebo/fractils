<script>
	import Item from '../test/Item.svelte'
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
	let canvas // canvas confetti
	let ready, set, go
	async function start() {
		const c = await import('https://cdn.skypack.dev/canvas-confetti')
		const confetti = c.default
		const yay = confetti.create(canvas, {
			resize: true,
			useWorker: true,
			// particleCount: 100,
			// spread: 50,
			disableForReducedMotion: true,
			// decay: 0.99,
		})

		ready = true
		await wait(500)
		set = true
		await wait(500)
		go = true
		yay()

		await wait(1500)
		ready = false
		set = false
		go = false
	}
</script>

<Item title="dev" type="boolean" {example}>
	<div slot="description">
		A boolean value indicating whether the app is in development mode.
	</div>

	<div class="result" slot="result">
		<p class:active={ready}>ready</p>
		<p class:active={set}>set</p>
		<p class:active={go}>go</p>
		<canvas bind:this={canvas} />
	</div>
	<button on:click={() => start()}>start()</button>
</Item>

<style>
	.result {
		position: relative;
		/* overflow: hidden; */
	}
	canvas {
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		/* transform: scale(1.2); */
		/* background: #000; */
	}
	p {
		text-align: center;
	}
	.active {
		color: green;
	}
</style>
