<script lang="ts">
	import Example from '$examples/_lib/Item/Example.svelte'
	import Params from '$examples/_lib/Item/Params.svelte'
	import Item from '$examples/_lib/Item/Item.svelte'
	import { visibility } from '$lib/actions'
	import { bounceOut } from 'svelte/easing'
	import { fly } from 'svelte/transition'
	import { onMount } from 'svelte'

	// onMount(async () => {
	// 	const { visibility } = await import('../../lib/actions/visibility')
	// })

	let visible,
		scrollDir,
		options = { threshold: 0.75 }

	const example = ` <script>
	import { bounceOut } from 'svelte/easing'
	import { fly } from 'svelte/transition'
	import { visibility } from 'fractils'
 	
	let visible, scrollDir, options = {threshold: 0.75}

 	function handleChange(e) {
 		visible = e.detail.isVisible
 		scrollDir = e.detail.scrollDirection
 	}
 <\/script>

 <div use:visibility={options} on:change={handleChange}>
	{#if visible}
 		<div in:fly={{ y: -20, easing: bounceOut }}>
			going {scrollDir === 'down' ? '⬇' : '⬆'}
		<\/div>
	{\/if}
 <\/div>
`

	const path = 'actions/visibility.ts'

	const params = [
		{
			type: 'param',
			title: 'options',
			description: 'Optional config (view, rootMargin, threshold, once)',
			children: [
				{
					type: 'param',
					title: 'view',
					description: 'The root view (default: window)',
				},
				{
					type: 'param',
					title: 'margin',
					description: "Margin around root view - 'px' or '%' (default: '0px')",
				},
				{
					type: 'param',
					title: 'threshold',
					description:
						"% of pixels required in view to trigger event.  An array will trigger multiple events - '0-1' (default: 0)",
				},
				{
					type: 'param',
					title: 'once',
					description: 'Whether to dispatch events only once (default: false)',
				},
			],
		},
		{
			type: 'event',
			title: 'change',
			description: 'Triggered when the element enters or leaves view',
		},
		{
			type: 'event',
			title: 'enter',
			description: 'Triggered when the element enters view',
		},
		{
			type: 'event',
			title: 'leave',
			description: 'Triggered when the element leaves view',
		},
	]

	const handleChange = ({ detail }) => {
		visible = detail.isVisible
		scrollDir = detail.scrollDirection.vertical
	}
</script>

<Item title="visibility" type="action" {path}>
	<div slot="description">
		Observes an element's current viewport visibility and dispatches relevant events.

		<Params {params} --width="183px" />
	</div>

	<Example example={example.replace('// ', '')} --h="382px">
		<div class="visibility" use:visibility={options} on:change={handleChange}>
			{#if visible}
				<div in:fly={{ y: -20, delay: 250, duration: 1000, easing: bounceOut }}>
					going {scrollDir === 'down' ? '⬇' : '⬆'}
				</div>
			{/if}
		</div>
	</Example>
</Item>

<style lang="scss">
	.visibility {
		display: flex;
		align-items: center;
		justify-content: center;

		width: 90%;
		height: 50px;
		margin: auto;

		color: var(--text);
	}
</style>
