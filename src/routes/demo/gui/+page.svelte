<!-- @hmr:reset -->

<script lang="ts">
	import { params } from '$lib/components/orbs/params'
	import Orbs from '$lib/components/orbs/Orbs.svelte'
	import { Gui } from '$lib/gui/Gui'
	import { Code } from '$lib'

	import { demoGui, code } from './demoGui'

	import { onDestroy, onMount } from 'svelte'
	import { fly } from 'svelte/transition'

	let gui: Gui
	let ready = false

	onMount(async () => {
		params.update(p => {
			p.height = Math.round(window.innerHeight / 10)
			p.width = Math.round(window.innerWidth / 7)
			return p
		})
		gui = await demoGui(params.value)
		ready = true
	})

	onDestroy(() => {
		gui?.dispose()
		globalThis.window?.location.reload()
	})

	function onResize() {
		params.update(p => {
			p.height = Math.round(window.innerHeight / 10)
			p.width = Math.round(window.innerWidth / 7)
			return p
		})
	}
</script>

<svelte:window on:resize={onResize} />

<div class="page">
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
			<Orbs {params} />
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
