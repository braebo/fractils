<script>
	import { ThemeToggle, theme } from '$lib'
	import Item from '../Item.svelte'
	import { onMount } from 'svelte'

	let TT
	async function init() {
		const { ThemeToggle } = await import('../../lib')
		TT = ThemeToggle
	}

	const example = `<script>
    import { ThemeToggle } from 'fractils'
<\/script>

<ThemeToggle />
`
	let mounted = true

	const reload = () => {
		mounted = false
		setTimeout(() => {
			mounted = true
		}, 0)
	}

	onMount(() => {
		// init()
	})
</script>

<Item title="ThemeToggle" type="component" {example}>
	<div slot="description">A simple component to toggle between light and dark themes.</div>

	<div class="result" slot="result" class:dark={$theme == 'dark'}>
		<ThemeToggle />
	</div>
</Item>

<style>
	.result {
		display: flex;
		justify-content: center;

		min-height: 54px;

		border-radius: var(--border-radius);

		overflow: hidden;
		transition: background-color 0.2s;
	}
	.dark {
		background-color: #1d1d1d;
		border-radius: var(--border-radius);
	}
</style>
