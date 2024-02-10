<script lang="ts">
	import { onMount } from 'svelte'

	import { tweened } from 'svelte/motion'
	let count = 10
	export let params = {
		orbs: 50,
		size: 5,
		a1: 0.1,
		a2: 0.5,
		width: count * 10,
		height: count * 10,
		speed: 0.02,
		mid: count * 5,
		brightness: 0.4,
	}
	const a1t = tweened(params.a1, { duration: 500 })
	const a2t = tweened(params.a2, { duration: 500 })

	$: time = 1
	$: snake = circle()
	function circle() {
		let arr = [] as number[][]
		for (let i = 0; i < params.orbs; i++) {
			arr = [
				...arr,
				[
					(Math.sin((i / Math.PI) * $a1t - time) / Math.PI) * params.width + params.mid,
					(Math.cos((i / Math.PI) * $a2t - time) / Math.PI) * params.height + params.mid,
				],
			]
		}
		return arr
	}

	function animate() {
		requestAnimationFrame(() => {
			$a1t = params.a1
			$a2t = params.a2
			requestAnimationFrame(() => {
				time += params.speed / 10
				snake = circle()
				animate()
			})
		})
	}

	onMount(animate)
</script>

<div class="orbs">
	<svg width="100%" height="100%">
		<svg id="die" viewBox="0 0 100 100">
			<g transform="rotate({0})">
				{#each snake as [x, y], i}
					{#if x && y}
						{#key time}
							<circle
								class="dot"
								fill="url(#orb{i})"
								cx={x}
								cy={y}
								r="{Math.max(0, params.size)}px"
							/>

							<defs>
								<radialGradient
									id="orb{i}"
									cx="25%"
									cy="25%"
									r="100%"
									fx="35%"
									fy="25%"
								>
									<stop
										offset="0%"
										style="stop-color:rgb({[
											10 *
												(((i + 1) * params.brightness) / params.orbs + 0.5),
											200 *
												(((i + 1) * params.brightness) / params.orbs + 0.5),
											250 *
												(((i + 1) * params.brightness) / params.orbs + 0.5),
										]});stop-opacity:1"
									/>
									<stop
										offset="100%"
										style="stop-color:rgb({[
											(i + 1) * params.brightness * 10,
											50 + (i + 1) * params.brightness * 10,
											100 + (i + 1) * params.brightness * 50,
										]});stop-opacity:1"
									/>
								</radialGradient>
							</defs>
						{/key}
					{/if}
				{/each}
			</g>
		</svg>
	</svg>
</div>

<style>
	.orbs {
		display: flex;
		width: 100%;
		height: 100%;
	}

	#die {
		width: 100%;
		height: 100%;
		border-radius: 5px;
	}

	stop {
		transition: all 0.6s ease-in-out;
	}

	.dot,
	g {
		transition: all 0.6s ease-in-out;
	}

	svg {
		backface-visibility: hidden;
		overflow: visible;
	}
</style>
