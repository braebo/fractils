<script lang="ts">
	import type { InputSlider } from '$lib/gui/Input'
	
	import Code from '$lib/components/Code.svelte'
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
				// visible: true,
				sides: ['left', 'right'],
			},
			themer: false,
			draggable: {
				position: {
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

		const f1 = gui.addFolder({ title: 'Controls' })
		
		const f2 = f1.addFolder({ title: 'Orbs' })
		const slidersFolder = f2.addFolder({ title: 'Sliders' })
		
		slider = slidersFolder.add<InputSlider>({ title: 'Slider 1', value: 0.5, view: 'Slider' }).state
		
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

	.code-fade {
		width: 15rem;
	}
</style>
