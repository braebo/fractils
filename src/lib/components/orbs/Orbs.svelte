<script lang="ts">
	import type { State } from '../../utils/state'

	import { Color } from '../../color/color'
	import { tweened } from 'svelte/motion'
	import { onMount } from 'svelte'

	export let params: State<typeof defaults>

	let count = 10
	const defaults = {
		orbs: 50,
		size: 5,
		floop: 0.01,
		a1: 1,
		// a2: 0.5,
		a2: 1,
		drift: 0,
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
	}

	let p = params?.value ?? defaults

	const sinX = tweened(p.a1, { duration: 500 })
	const sinY = tweened(p.a2, { duration: 500 })
	const floop = tweened(p.floop, { duration: 300 })

	let time = 0
	// $: snake = circle()
	let snake = circle()
	function circle() {
		let arr: number[][] = []
		for (let i = 0; i < p.orbs; i++) {
			arr[i] = [
				(Math.sin((i / Math.PI + (p.orbs - i) * p.drift) * $sinX - time) / Math.PI) *
					p.width +
					p.mid,
				(Math.cos((i / Math.PI + (p.orbs - i) * p.drift) * $sinY - time) / Math.PI) *
					p.height +
					p.mid,
			]
		}
		return arr
	}

	function animate() {
		requestAnimationFrame(() => {
			$sinX = p.a1 * (!p.modulate ? 1 : 0.25 + Math.sin(time) / 2)
			$sinY = p.a2 * (!p.modulate ? 1 : 0.75 + Math.cos(time) / 2)
			$floop = p.floop
			requestAnimationFrame(() => {
				time += p.speed / 10
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
									p.size * Math.sin($floop * time * (p.orbs + 1 - i)),
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
											p.color.rgba.r *
												(((i + 1) * p.brightness) / p.orbs + 0.5),
											p.color.rgba.g *
												(((i + 1) * p.brightness) / p.orbs + 0.5),
											p.color.rgba.b *
												(((i + 1) * p.brightness) / p.orbs + 0.5),
										]});stop-opacity:{p.color.rgba.a}"
									/>
									<stop
										offset="100%"
										style="stop-color:rgb({[
											p.accent.rgba.r + (i + 1) * p.brightness * p.glowR,
											p.accent.rgba.g + (i + 1) * p.brightness * p.glowG,
											p.accent.rgba.b + (i + 1) * p.brightness * p.glowB,
										]});stop-opacity:{p.accent.rgba.a}"
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
