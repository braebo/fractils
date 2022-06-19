<script lang="ts">
	import type { Direction } from '$lib/actions/visibility'
	import type { VisibilityEvent } from '$lib/index'

	import { visibility } from '$lib/actions'

	import Example from '$examples/_lib/Item/Example.svelte'
	import Params from '$examples/_lib/Item/Params.svelte'
	import Item from '$examples/_lib/Item/Item.svelte'

	import { bounceOut } from 'svelte/easing'
	import { fly } from 'svelte/transition'

	let visible: boolean,
		scrollDir: Direction | undefined,
		options = { threshold: 0.75 }

	const example = ` <script>
	import { bounceOut } from 'svelte/easing'
	import { fly } from 'svelte/transition'
	//import { visibility } from 'fractils'
 	
	let visible, scrollDir, options = {threshold: 0.75}

 	function handleChange(e) {
 		visible = e.detail.isVisible
 		scrollDir = e.detail.scrollDirection
 	}
 <\/script>

 <div use:visibility={options} on:f-enter={handleChange}>
	{#if visible}
 		<div in:fly={{ y: -20, easing: bounceOut }}>
			going {scrollDir === 'down' ? '⬇' : '⬆'}
		<\/div>
	{\/if}
 <\/div>
`

	const path = 'actions/visibility/index.ts'

	const params = [
		{
			type: 'param',
			title: 'options',
			description: 'Optional config:',
			children: [
				{
					type: 'option',
					title: 'view',
					description: 'The root view.  Defaults to `window`.',
				},
				{
					type: 'option',
					title: 'margin',
					description: "Margin around root view - 'px' or '%'. Default '0px'.",
				},
				{
					type: 'option',
					title: 'threshold',
					description:
						"% of pixels required in view to trigger event.  An array will trigger multiple events - '0-1'.  Default 0.",
				},
				{
					type: 'option',
					title: 'once',
					description: 'Whether to dispatch events only once. Default false.',
				},
			],
		},
		{
			type: 'event',
			title: 'f-change',
			description: 'Triggered when the element enters or leaves view.',
		},
		{
			type: 'event',
			title: 'f-enter',
			description: 'Triggered when the element enters view.',
		},
		{
			type: 'event',
			title: 'f-leave',
			description: 'Triggered when the element leaves view.',
		},
		{
			type: 'event',
			title: 'detail',
			description: '',
			children: [
				{
					type: 'boolean',
					title: 'isVisible',
					description: 'True if the element is currently in the viewport.',
				},
				{
					type: 'element',
					title: 'entry',
					description: 'The element being observed.',
				},
				{
					type: 'Direction',
					title: 'scrollDirection',
					description: `{<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;horizontal:&nbsp;&nbsp; 'up' | 'down' | 'left' | 'right',<br>
					&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;vertical:&nbsp;&nbsp; 'up' | 'down' | 'left' | 'right'<br>}`,
				},
			],
		},
	]

	const handleChange = ({ detail }: VisibilityEvent) => {
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
		<div class="visibility" use:visibility={options} on:f-enter={handleChange}>
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
