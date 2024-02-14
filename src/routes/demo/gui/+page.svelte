<script lang="ts">
	import type { InputSlider } from '$lib/gui/Input'

	import Code from '$lib/components/Code.svelte'
	import Orbs from '../resizable/Orbs.svelte'
	import { state } from '$lib/utils/state'
	import { Gui } from '$lib/gui/Gui'
	import { onMount } from 'svelte'

	let gui: Gui
	let slider: InputSlider['state']

	let ok = state({} as Gui)
	let key = false

	$: if ($ok.size || $ok.position || $ok.closed) {
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
				// todo - `visible` is broken
				// visible: false,
				sides: ['right'],
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

		// gui.add(params) // todo

		ok.set(gui)

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

		return gui.dispose
	})
</script>

<!-- <Gui /> -->

{#if slider}
	{$slider}
	<input bind:value={$slider} type="range" min="0" max="1" step="0.01" />
{/if}

<div class="page">
	{#if ok}
		<button on:click={() => console.log(gui)}>Log Gui</button>

		<div class="orbs">
			<Orbs bind:params />
		</div>

		{#if size && position && closed}
			{#key $size || $position || $closed}
				<div class="code-fade">
					<Code
						--max-height="100%"
						text={JSON.stringify(
							{
								size: $size,
								position: $position,
								closed: $closed,
							},
							null,
							2,
						)}
					/>
				</div>
			{/key}
		{/if}
	{/if}
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

	.code-fade {
		width: 15rem;
	}
</style>
