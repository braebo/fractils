<script lang="ts">
	// import Gui from '$lib/gui/Gui.svelte'

	import { theme, ThemeToggle } from '$lib'
	import { Gui } from '$lib/gui/Gui'
	import { onMount } from 'svelte'

	onMount(() => {
		const gui = new Gui({
			persistent: true,
			resizable: {},
			themerOptions: {
				mode: $theme as 'light' | 'dark' | 'system',
			},
		})

		const f1 = gui.addFolder()

		f1.addFolder({ title: 'Nested' })

		gui.addFolder({ title: 'Titled' })

		const unsub = theme.subscribe((v) => {
			const color = v === 'light' ? 'white' : 'black'
			gui.themer?.mode.set(v)
			document.body.style.backgroundColor = color
			document.documentElement.style.backgroundColor = color
		})

		return () => {
			unsub()
			gui.dispose()
		}
	})
</script>

<div style="position: fixed; right: 1rem; top: 1rem;">
	<ThemeToggle />
</div>

<!-- <Gui /> -->
