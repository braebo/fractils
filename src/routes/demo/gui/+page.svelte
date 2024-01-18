<script lang="ts">
	import Code from '$lib/components/Code.svelte'
	import { Gui } from '$lib/gui/Gui'
	import { onMount } from 'svelte'

	let gui: Gui

	let state: Gui['state']

	onMount(() => {
		gui = new Gui({
			container: document.getElementById('svelte')!,
			persist: {
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
			closed: false
		})

		state = gui.state

		const f1 = gui.addFolder()

		f1.addFolder({ title: 'Nested' })

		gui.addFolder({ title: 'Titled' })
	})
</script>

<!-- <Gui /> -->
<div class="page">
	{#if gui}
		<button on:click={() => console.log(gui)}>Log Gui</button>

		{#key $state}
			<div class="code-fade">
				<Code text={JSON.stringify($state, null, 2)} />
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
