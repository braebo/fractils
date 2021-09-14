<script lang="ts">
	import Item from './Item.svelte'
	import { clickOutside } from '$lib'

	let clickedOutside = false
	let timer: ReturnType<typeof setTimeout> | null = null
	const handleClickOutside = (e: CustomEvent) => {
		if (timer) clearTimeout(timer)
		clickedOutside = true
		timer = setTimeout(() => {
			clickedOutside = false
		}, 1000)
	}

	const example = `<script lang="ts">
	import { clickOutside } from 'fractils'

	let clickedOutside

	function handleClickOutside(e: CustomEvent) {
		clickedOutside = true
		setTimeout(() => { clickedOutside = false }, 1000)
	}
<\/script>

<div use:clickOutside={handleClickOutside}>
	clickedOutside: {clickedOutside}
</div>
`
</script>

<Item title="clickOutside" type="action" {example}>
	<div slot="description">
		Calls a function when the user clicks outside the element.

		<div class="param">
			<span>@param</span> callback — The function to call.
		</div>
	</div>

	<div slot="result">
		<div
			class="clickoutside"
			class:clickedOutside
			use:clickOutside={handleClickOutside}
		>
			clickedOutside = {clickedOutside}
		</div>
	</div>
</Item>

<style lang="scss">
	.clickoutside {
		border: 1px solid #0001;
		justify-content: center;
		align-items: center;
		display: flex;
		width: 90%;
		margin: auto;
		height: 50px;
		border-radius: var(--border-radius);
		transition: border-color 0.2s ease;
		&:hover {
			border: 1px solid #000;
		}
	}
	.clickedOutside {
		border: 1px solid var(--color-primary);
	}
</style>
