<script>
	import { theme } from '$lib'
	import Item from '../Item.svelte'

	const example = `<script>
    import { theme } from 'fractils'
<\/script>

{$theme}
`

	const path = 'theme/index.ts'
</script>

<Item title="Theme" type="store + functions" {example} {path}>
	<div slot="description">
		A series of utilitites for managing the active theme.
		<div class="param">
			<span class="var">store</span> <span class="var-title">&nbsp; &nbsp; theme</span> — &nbsp;A
			writable, persistant store to manage the active theme.
		</div>
		<div class="param">
			<span class="var">function</span> <span class="var-title">initTheme</span> — &nbsp;Initializes
			theme from system preference or theme store and registers a prefers-media listener for changes.
		</div>
		<div class="param">
			<span class="var">function</span> <span class="var-title">toggleTheme</span> —
			&nbsp;Toggles
			<span>$theme</span>
			to and from light and dark mode.
		</div>
		<div class="param col">
			<div class="row">
				<span class="var">function</span> <span class="var-title apply">applyTheme</span> — &nbsp;Applies
				a specific theme.
			</div>
			<div class="connector" />
			<div class="param indented">
				<span class="var">param</span> <span class="var-title">newTheme</span> — &nbsp;The theme
				to apply.
			</div>
		</div>
	</div>

	<div class="result" slot="result">
		{$theme}
	</div>
</Item>

<style lang="scss">
	.result {
		display: flex;

		text-align: center;
	}

	.indented {
		margin-left: 1.5rem;
		margin-top: 5px;
	}

	.col {
		position: relative;
		flex-direction: column;
	}
	.col span {
		position: relative;
		z-index: 2;

		transform: unset;
	}

	.row {
		display: flex;
		flex-direction: row;

		& span {
			margin-right: 1rem;
		}
	}

	.apply {
		margin-right: 0.5rem !important;
		margin-left: -0.25rem !important;
	}
</style>
