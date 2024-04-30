<script lang="ts">
	import { Color } from '$lib/color/color'
	import { onMount } from 'svelte'

	import { tweened } from 'svelte/motion'
	let count = 10
	export let params = {
		orbs: 50,
		size: 5,
		a1: 0.1,
		a2: 0.5,
		drift: 1,
		modulate: true,
		width: count * 10,
		height: count * 10,
		speed: 0.02,
		mid: count * 5,
		brightness: 0.4,
		color: new Color({ r: 10, g: 200, b: 250, a: 1 }),
		accent: new Color({ r: 0, g: 50, b: 100, a: 1 }),
		glowR: 10,
		glowG: 10,
		glowB: 50,
		floop: 1,
	}
	const a1t = tweened(params.a1, { duration: 500 })
	const a2t = tweened(params.a2, { duration: 500 })
	const floop = tweened(params.floop, { duration: 300 })

	$: time = 1
	// $: snake = circle()
	let snake = circle()
	function circle() {
		let arr: number[][] = []
		for (let i = 0; i < params.orbs; i++) {
			arr[i] = [
				(Math.sin((i / Math.PI + (params.orbs - i) * params.drift) * $a1t - time) /
					Math.PI) *
					params.width +
					params.mid,
				(Math.cos((i / Math.PI + (params.orbs - i) * params.drift) * $a2t - time) /
					Math.PI) *
					params.height +
					params.mid,
			]
		}
		return arr
	}

	function animate() {
		requestAnimationFrame(() => {
			$a1t = params.a1 * (!params.modulate ? 1 : 0.5 + Math.sin(time) / 2)
			$a2t = params.a2 * (!params.modulate ? 1 : 0.5 + Math.cos(time) / 2)
			$floop = params.floop
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
								r="{Math.max(
									0,
									params.size * Math.sin($floop * time * (params.orbs + 1 - i)),
								)}px"
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
											params.color.rgba.r *
												(((i + 1) * params.brightness) / params.orbs + 0.5),
											params.color.rgba.g *
												(((i + 1) * params.brightness) / params.orbs + 0.5),
											params.color.rgba.b *
												(((i + 1) * params.brightness) / params.orbs + 0.5),
										]});stop-opacity:{params.color.rgba.a}"
									/>
									<stop
										offset="100%"
										style="stop-color:rgb({[
											params.accent.rgba.r +
												(i + 1) * params.brightness * params.glowR,
											params.accent.rgba.g +
												(i + 1) * params.brightness * params.glowG,
											params.accent.rgba.b +
												(i + 1) * params.brightness * params.glowB,
										]});stop-opacity:{params.accent.rgba.a}"
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
