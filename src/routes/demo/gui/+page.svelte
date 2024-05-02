<!-- @hmr:reset -->

<script lang="ts" context="module">
	let count = 10

	let params = {
		orbs: 50,
		size: 5,
		floop: 0.01,
		// a1: 0.1,
		// a2: 0.5,
		a1: 1,
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

	export type Params = typeof params
</script>

<script lang="ts">
	import Orbs from '../resizable/Orbs.svelte'
	import { demoGui, code } from './demoGui'
	import { Color } from '$lib/color/color'
	import { fly } from 'svelte/transition'
	import { Gui } from '$lib/gui/Gui'
	import { onMount } from 'svelte'
	import { Code } from '$lib'

	let gui: Gui
	let ready = false
	// let container: HTMLElement

	onMount(() => {
		// const min = Math.min(window.innerHeight, window.innerWidth)
		// params.height = min / 10
		// params.width = params.height * 2
		params.height = Math.round(window.innerHeight / 10)
		params.width = Math.round(window.innerWidth / 7)
		gui = demoGui(params)
		ready = true

		return () => {
			gui.dispose()
		}
	})

	function onResize() {
		params.height = window.innerHeight / 10
		params.width = window.innerWidth / 7
		// gui.refresh()
	}
</script>

<svelte:window on:resize={onResize} />

<div class="page">
	<!-- <div bind:this={container} /> -->

	{#if $code}
		<div class="debug" in:fly={{ y: 10 }}>
			{#key $code}
				<Code --max-height="90vh" lang="ts" text={$code} on:close={() => ($code = '')} />
			{/key}
		</div>
	{/if}

	<button on:click={() => console.log(gui)}>Log Gui</button>
	<button on:click={() => localStorage.clear()}>Clear localStorage</button>

	{#if ready}
		<div class="orbs">
			<Orbs bind:params />
		</div>
	{/if}
</div>

<style lang="scss">
	.page {
		width: 100vw;
		height: 100vh;
		max-height: 100vh;
		padding: 1rem;

		background: color-mix(in lch, var(--bg-a), var(--bg-b));
		outline: 1px solid red;

		overflow: hidden;
	}

	.orbs {
		position: relative;
		width: 50vmin;
		height: 100%;
		// margin: 45% auto 0 auto;
		margin: 20vh auto 0 auto;
		z-index: 20;
		pointer-events: none;
	}

	.debug {
		position: absolute;
		top: 5rem;
		left: 1rem;
		z-index: 0;
	}
</style>
