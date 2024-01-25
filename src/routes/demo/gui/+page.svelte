<script lang="ts">
	import Code from '$lib/components/Code.svelte'
	import { state } from '$lib/utils/state'
	import { Gui } from '$lib/gui/Gui'
	import { onMount } from 'svelte'

	let gui: Gui

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

		ok.set(gui)

		size = gui.size
		position = gui.position
		closed = gui.closed

		const f1 = gui.addFolder({ title: '1a' })

		const f2 = f1.addFolder({ title: '2a' })
		f2.addFolder({ title: '3a' })
		f1.addFolder({ title: '2b' }).addInput({ title: '2b', value: 0, folder: f2, type: 'number' })

		gui.addFolder({ title: 'sibling' })

		return gui.dispose
	})
</script>

<!-- <Gui /> -->
<div class="page">
	{#if ok}
		<button on:click={() => console.log(gui)}>Log Gui</button>

		{#if size && position && closed}
			{#key $size || $position || $closed}
				<div class="code-fade">
					<!-- <Code --max-height="100%" text={stringify(debrief(gui), 2)} /> -->
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
