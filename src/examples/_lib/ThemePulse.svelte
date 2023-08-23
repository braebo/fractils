<script>
	import { onMount, tick } from 'svelte';
	import { pulse } from './lib_stores';
	import { theme } from '$lib';

	let pulseBottom, pulseTop;
	let bottomY, bottomX, topY, topX;

	let h = 0;
	const w = 300;
	let ready = false;

	async function place() {
		await tick();
		// pulseBottom = document.getElementById('theme-out')?.getBoundingClientRect();
		// pulseTop = document.getElementById('theme-in')?.getBoundingClientRect();
		pulseBottom = document.getElementById('theme-in')?.getBoundingClientRect();
		pulseTop = document.getElementById('theme-out')?.getBoundingClientRect();

		if (pulseBottom && pulseTop) {
			const { scrollTop } = document.documentElement;
			bottomY = Math.floor(pulseBottom.top + pulseBottom.height / 2 + scrollTop);
			bottomX = Math.floor(pulseBottom.left - w);
			topY = Math.floor(pulseTop.top + pulseTop.height / 2 + scrollTop);
			topX = Math.floor(pulseTop.left);
			h = topY - bottomY;
			// h = bottomY - topY; // Change to bottomY - topY
		}

		if (!ready) ready = true;
	}

	let pulsate, timer;
	const triggerPulse = () => {
		if (timer) clearTimeout(timer);
		pulsate = true;
		timer = setTimeout(() => {
			pulsate = false;
		}, 1000);
	};

	$: {
		$pulse;
		triggerPulse();
	}

	onMount(() => setTimeout(place, 1000));
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
		z-index: 2;
	}
	#pulse {
		position: absolute;
		backface-visibility: hidden;

		stroke-dashoffset: 310%;
	}
	path {
		stroke-dasharray: 100 1300;
		stroke: var(--fg-a);

		&.dark {
			stroke: var(--black);
		}
	}
	.pulsate {
		animation: pulsate 1s ease-out;
	}
	@keyframes pulsate {
		0% {
			stroke-dashoffset: 303%;
		}
		100% {
			stroke-dashoffset: 101%;
		}
	}
</style>
