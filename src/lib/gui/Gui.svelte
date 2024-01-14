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
				element: options.container || containerEl,
				persistent: options.persistent ?? true,
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

		// min-width: 25vw;
		// min-height: 25vw;

		// width: var(--width, 30rem);
		// height: var(--height, 30rem);

		// background: rgba(var(--bg-a-rgb), 0.8);
		// outline: 1px solid rgba(var(--bg-b-rgb), 0.5);
		// border-radius: var(--radius);
		// backdrop-filter: blur(0.2rem);
		// box-shadow:
		// 	var(--shadow-lg),
		// 	inset 0 0 10px rgba(var(--bg-b-rgb), 0.33);

		// z-index: 9999;
		// overflow: visible;
	}
</style>
