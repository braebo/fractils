<!-- @hmr:reset -->

<script lang="ts" context="module">
	let count = 10

	let params = {
		orbs: 50,
		size: 5,
		a1: 0.1,
		a2: 0.5,
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
	import { Color } from '$lib/color/color'
	import { demoGui } from './demoGui'
	import { Gui } from '$lib/gui/Gui'
	import { onMount } from 'svelte'

	let gui: Gui

	onMount(() => {
		gui = demoGui(params)

		return () => {
			gui.dispose()
		}
	})
</script>

<div class="page">
	<button on:click={() => console.log(gui)}>Log Gui</button>
	<button on:click={() => localStorage.clear()}>Clear localStorage</button>

	<div class="orbs">
		<Orbs bind:params />
	</div>
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
		width: 50%;
		height: 50%;
		margin: auto;
	}
</style>
