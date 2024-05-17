<!-- @hmr:reset -->

<script lang="ts">
	import { params } from '$lib/components/orbs/params'
	import Orbs from '$lib/components/orbs/Orbs.svelte'
	import { Gui } from '$lib/gui/Gui'
	import { Code } from '$lib'

	import { demoGui, code, showCode } from './demoGui'

	import { fly } from 'svelte/transition'
	import { onMount } from 'svelte'

	let gui: Gui
	let ready = false

	onMount(() => {
		params.update(p => {
			p.height = Math.round(window.innerHeight / 10)
			p.width = Math.round(window.innerWidth / 7)
			return p
		})
		gui = demoGui(params.value)
		ready = true
// 
		return () => {
			gui?.dispose()
			// globalThis.window?.location.reload()
		}
	})

	// onDestroy(() => {
	// gui?.dispose()
	// 	globalThis.window?.location.reload()
	// })

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
	{#if $showCode}
		<div class="debug" transition:fly={{ y: 10 }}>
			{#key $code}
				<Code
					--max-height="90vh"
					title="active preset"
					lang="ts"
					text={$code}
					on:close={() => ($code = '')}
				/>
			{/key}
		</div>
	{/if}

	<button class:active={$showCode} on:click={() => ($showCode = !$showCode)}>
		Show Active Preset
	</button>
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

		overflow: hidden;
	}

	.orbs {
		position: relative;

		width: 50vmin;
		height: 100%;
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

	button {
		background: var(--bg-a);
		color: var(--fg-c);
		outline: 1px solid var(--bg-c);
		border: none;
		&:hover {
			color: var(--fg-a);
		}
		&:active {
			color: var(--theme-a);
		}
	}

	button.active {
		background: var(--bg-a);
		color: var(--theme-a);
	}
</style>
