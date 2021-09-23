<script>
	import { ThemeToggle, theme } from '$lib'
	import Item from '../_lib.svelte/Item/Item.svelte'

	const example = `<script>
    import { ThemeToggle } from 'fractils'
<\/script>

<ThemeToggle />
`

	const path = 'components/ThemeToggleExample.svelte'
</script>

<Item title="ThemeToggle" type="component" {example} {path}>
	<div slot="description">
		A simple component to toggle between light and dark <a href="#Theme">theme</a>.
	</div>

	<div class="result" id="theme-in" slot="result" class:dark={$theme == 'dark'}>
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
