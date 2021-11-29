<script>
	import { onMount, tick } from 'svelte'
	import { pulse } from './lib_stores'
	import { theme, log } from '$lib'

	let pulseBottom, pulseTop
	let bottomY, bottomX, topY, topX
	let h = 0
	const w = 200
	let ready = false

	async function place() {
		await tick()
		pulseBottom = document.getElementById('theme-out')?.getBoundingClientRect()
		pulseTop = document.getElementById('theme-in')?.getBoundingClientRect()

		if (pulseBottom && pulseTop) {
			const docTop = document.documentElement.scrollTop
			topY = Math.floor(pulseTop.top + pulseTop.height / 2 + docTop)
			topX = Math.floor(pulseTop.left)
			bottomY = Math.floor(pulseBottom.top + pulseTop.height / 2 + docTop)
			bottomX = Math.floor(pulseBottom.left - w - 30)
			h = topY - bottomY
		}

		if (!ready) ready = true
	}

	let pulsate, timer
	const triggerPulse = () => {
		if (timer) clearTimeout(timer)
		pulsate = true
		timer = setTimeout(() => {
			pulsate = false
		}, 1000)
	}

	$: {
		$pulse
		triggerPulse()
	}

	onMount(() => setTimeout(place, 1000))
</script>

<svelte:window on:resize={place} />

{#if pulseBottom && ready}
	{#key $theme}
		<div
			class="pulsewrapper"
			style="
		left: {bottomX}px;
		top: {bottomY}px;
        "
		>
			<svg
				id="pulse"
				style="width: {w}px; height: {h}px;"
				viewBox="0 0 {w} {h}"
				preserveAspectRatio="none"
				class:pulsate
			>
				<path
					class:dark={$theme === 'dark'}
					d="
                    M {w} 3
                    H {w * 0.75}
                    C {w * 0.5} 3 {w * 0.5} 2 {w * 0.5} {h * 0.1 + 3}
                    V {h * 0.9}
                    C {w * 0.5} {h - 3} {w * 0.5} {h - 3} {w * 0.75} {h - 3}
                    H {w}
                "
					fill="none"
					stroke="yellow"
					stroke-width="3"
				/>
				<circle cx={10} cy={bottomY} r="50" fill="red" />
				<circle cx={10} cy={topY} r="50" fill="red" />
			</svg>
		</div>
	{/key}
{/if}

<style lang="scss">
	.pulsewrapper {
		position: absolute;
	}
	#pulse {
		position: absolute;

		stroke-dashoffset: 5%;
	}
	path {
		stroke-dasharray: 100 1200;
		stroke: white;

		&.dark {
			stroke: black;
		}
	}
	.pulsate {
		animation: pulsate 1s ease-in-out;
	}
	@keyframes pulsate {
		0% {
			stroke-dashoffset: 5%;
		}
		100% {
			stroke-dashoffset: 200%;
		}
	}
</style>
