<script>
	let el
	let scale = 0.5
	let stop = false

	function check() {
		if (stop) return
		requestAnimationFrame(check)
		if (!el) return
		scale = 1

		console.log(el.offsetWidth)
		// console.log(el.getBoundingClientRect().left)
	}
	// check()

	let i = 0
	function watch(node) {
		new ResizeObserver(() => {
			console.log('resize', i++)
		}).observe(node)
	}

	setTimeout(() => {
		stop = true
		scale = 1
	}, 2000)
</script>

<div bind:this={el} style:scale use:watch>
	<h1>Test</h1>
</div>

<style>
	div {
		background-color: lightgray;
		padding: 10px;
		translate: 50px 50px;
		transition: scale 2s;
	}
	h1 {
		color: gray;
	}
</style>
