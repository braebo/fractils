<script lang="ts">
	import Item from '$test/Item.svelte'
	import { onMount } from 'svelte'

	let _clickOutside
	onMount(async () => {
		const { clickOutside } = await import('../../lib/actions/clickOutside')
		// @ts-ignore
		_clickOutside = clickOutside
	})

	let clickedOutside = false
	let timer: ReturnType<typeof setTimeout> | null = null
	const handleClickOutside = (e: CustomEvent) => {
		if (timer) clearTimeout(timer)
		clickedOutside = true
		timer = setTimeout(() => {
			clickedOutside = false
		}, 1000)
	}

	const example = `<script>
	// import { clickOutside } from 'fractils'

	let clickedOutside

	function handleClickOutside() {
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
		{#if _clickOutside}
			<div class="clickoutside" class:clickedOutside use:_clickOutside={handleClickOutside}>
				clickedOutside = {clickedOutside}
			</div>
		{/if}
	</div>
</Item>

<style lang="scss">
	.clickoutside {
		display: flex;
		align-items: center;
		justify-content: center;

		width: 90%;
		height: 50px;
		margin: auto;

		border: 1px solid #00000011;
		border-radius: var(--border-radius);

		transition: border-color 0.2s ease;

		&:hover {
			border: 1px solid #000000;
		}
	}
	.clickedOutside {
		border: 1px solid var(--color-primary);
	}
</style>
