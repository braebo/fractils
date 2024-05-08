<script lang="ts">
	import { Gui, type GuiOptions } from './Gui'
	import { onMount } from 'svelte'

	export let gui: Gui | undefined = undefined
	export let options: Partial<GuiOptions> = {}

	let containerEl: HTMLDivElement

	onMount(async () => {
		const module = await import('../gui/Gui')

		if (!gui) {
			gui = new module.Gui({
				container: options.container || containerEl,
				// localStorageKeys: options.localStorageKeys ?? true,
				storage: options.storage ?? {
					key: 'fractils::fracgui-svelte',
				},
			})
		}
	})
</script>

<div class="root container" bind:this={containerEl}>
	<slot />
</div>

<style lang="scss">
	.container {
		position: relative;

		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
</style>
