<script lang="ts">
	// import Gui from '$lib/gui/Gui.svelte'

	import { highlight } from '$lib/utils/highlight'
	import Code from '$lib/components/Code.svelte'
	import { fade } from 'svelte/transition'
	import { Gui } from '$lib/gui/Gui'
	import { onMount } from 'svelte'

	let gui: Gui

	let closed: Gui['closed']
	let state: Gui['state']

	onMount(() => {
		gui = new Gui({
			container: document.getElementById('svelte')!,
			localStorageKeys: {
				closed: 'fractils::gui::closed',
				position: 'fractils::gui::position',
				size: 'fractils::gui::size',
			},
			resizable: {
				visible: true,
				sides: ['left', 'right'],
			},
			themer: false,
			draggable: {
				position: {
					x: 16,
					y: 0,
				},
			},
		})

		closed = gui.closed
		state = gui.state

		const f1 = gui.addFolder()

		f1.addFolder({ title: 'Nested' })

		gui.addFolder({ title: 'Titled' })
	})

	const fallback = `{
  "title": "Controls",
  "closed": false,
  "state": {
    "position": {
      "x": 87,
      "y": 60
    },
    "size": {
      "width": 16,
      "height": 16
    },
    "closed": false
  }
}`

	const getState = () =>
		JSON.stringify(
			{
				title: gui.title,
				closed: $closed,
				state: $state,
			},
			null,
			2,
		)
</script>

<!-- <Gui /> -->
<div class="page">
	{#if gui}
		<button on:click={() => console.log(gui)}>Log Gui</button>

		{#key $state}
			<div class="code-fade">
				<Code text={getState()} />
			</div>
		{/key}
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
