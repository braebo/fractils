<script lang="ts">
	import { stringify } from '$lib'
	import Code from '$lib/components/Code.svelte'
	import { Gui } from '$lib/gui/Gui'
	import { debrief } from '$lib/utils/debrief'
	import { state, type State } from '$lib/utils/state'
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

		// state = gui.state

		const f1 = gui.addFolder()

		f1.addFolder({ title: 'Nested' })

		gui.addFolder({ title: 'Titled' })
	})

	$: console.log(gui)
</script>

<!-- <Gui /> -->
<div class="page">
	{#if ok}
		<button on:click={() => console.log(gui)}>Log Gui</button>

		{#if size && position && closed}
			{#key $size || $position || $closed}
				<div class="code-fade">
					<Code --max-height="100%" text={stringify(debrief(gui), 2)} />
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
</style>
