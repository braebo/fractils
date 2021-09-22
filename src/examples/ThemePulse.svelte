<script>
	import { scrollY } from '$examples/stores'
	import { theme } from '$lib'
	import { onMount } from 'svelte'

	let themeIn, themeOut
	let startY, startX, endY, endX
	const h = 750
	const w = 200

	function place() {
		themeIn = document.getElementById('theme-in')?.getBoundingClientRect()
		themeOut = document.getElementById('theme-out')?.getBoundingClientRect()

		if (themeIn && themeOut) {
			startY = Math.floor(themeIn.top + themeOut.height / 2 + $scrollY)
			startX = Math.floor(themeIn.left)
			endY = themeOut.top + themeOut.height / 2
			endX = themeOut.left
		}
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
		$theme
		triggerPulse()
	}

	onMount(() => {
		setTimeout(place, 50)
	})
</script>

{#if themeIn}
	{#key $theme}
		<div
			class="pulsewrapper"
			style="
            left: {0}px;
            top: {startY}px;
        "
		>
			<svg
				id="pulse"
				style="
                width: {w}px;
                height: {h}px;
            "
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
			</svg>
		</div>
	{/key}
{/if}

<style lang="scss">
	.pulsewrapper {
		position: absolute;
		inset: 0;
	}
	#pulse {
		position: absolute;

		width: 500px;
		height: 500px;

		stroke-dashoffset: 15%;
	}
	path {
		stroke-dasharray: 100 1000;
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
			stroke-dashoffset: 15%;
		}
		100% {
			stroke-dashoffset: -175%;
		}
	}
</style>
