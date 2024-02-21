<script lang="ts">
	import type { InputSlider } from '$lib/gui/Input'

	import { inspectElement } from '$lib/actions/inspectElement'
	import Orbs from '../resizable/Orbs.svelte'
	import { state } from '$lib/utils/state'
	import { Gui } from '$lib/gui/Gui'
	import { onMount } from 'svelte'
	import { DEV } from 'esm-env'

	let gui: Gui
	let slider: InputSlider['state']

	const church = state({} as Gui)
	let key = false

	$: if ($church) {
		key = !key
	}

	let size: Gui['size']
	let position: Gui['position']
	let closed: Gui['closed']

	let count = 10
	let params = {
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

	onMount(() => {
		gui = new Gui({
			container: document.getElementById('svelte')!,
			storage: {
				key: 'fractils::gui',
				closed: true,
				size: true,
				position: true,
			},
			resizable: {
				sides: ['right', 'left'],
				corners: [],
			},
			themer: false,
			draggable: {
				defaultPosition: {
					x: 16,
					y: 0,
				},
			},
			closed: false,
		})

		church.set(gui)

		size = gui.size
		position = gui.position
		closed = gui.closed

		const f1 = gui.addFolder({ title: 'Orbs' })

		slider = f1.add<InputSlider>({
			title: 'count',
			view: 'Slider',
			binding: {
				target: params,
				key: 'orbs',
			},
			min: 1,
			max: 500,
			step: 1,
		}).state

		f1.add<InputSlider>({
			title: 'size',
			view: 'Slider',
			binding: {
				target: params,
				key: 'size',
			},
			min: 1,
			max: 30,
			step: 1,
		})

		f1.add<InputSlider>({
			title: 'a1',
			view: 'Slider',
			binding: {
				target: params,
				key: 'a1',
			},
			min: 0,
			max: 3,
			step: 0.001,
		})

		f1.add<InputSlider>({
			title: 'a2',
			view: 'Slider',
			binding: {
				target: params,
				key: 'a2',
			},
			min: 1,
			max: 3,
			step: 0.001,
		})

		f1.addFolder({ title: '2b' }).add({
			title: '2b',
			value: 0,
			view: 'Slider',
		})

		gui.addFolder({ title: 'sibling' })

		if (DEV) inspectElement(gui.element)

		return gui.dispose
	})
</script>

<!-- <Gui /> -->

{#if slider}
	<label>
		{$slider}
		<input bind:value={$slider} type="range" min="0" max="500" step="0.01" />
	</label>
{/if}

<div class="page">
	<button on:click={() => console.log(gui)}>Log Gui</button>

	<div class="orbs">
		<Orbs bind:params />
	</div>
</div>

<style lang="scss">
	.page {
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: flex-start;
		gap: 1rem;

		max-width: 400px;
		height: 100%;
		flex-grow: 1;
		margin: auto;

		padding: 1rem;
	}

	.orbs {
		width: 20rem;
		height: 20rem;
		margin: auto;
	}

	label {
		display: flex;
		gap: 0.5rem;

		width: 13rem;
		padding: 0.5rem;

		background: rgba(var(--bg-b-rgb), 0.5);
		border-radius: var(--radius);
		box-shadow: var(--shadow), var(--shadow-inset);
	}
	input {
		// width: 10rem;
		min-width: 0;
		max-width: unset;
	}
</style>
