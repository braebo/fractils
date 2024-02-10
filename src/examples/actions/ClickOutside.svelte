<script lang="ts">
	import { clickOutside, type ClickOutsideEvent } from '$lib/actions/clickOutside.js';
	import Example from '$examples/_lib/Item/Example.svelte';
	import Params from '$examples/_lib/Item/Params.svelte';
	import Item from '$examples/_lib/Item/Item.svelte';
	import html from './ClickOutside.html?raw';

	let clickedOutside = false;

	let timer: ReturnType<typeof setTimeout> | null = null;

	const handleClickOutside = (e: ClickOutsideEvent) => {
		if (timer) clearTimeout(timer);
		clickedOutside = true;

		timer = setTimeout(() => {
			clickedOutside = false;
		}, 500);
	};

	const path = 'actions/clickOutside.ts';

	const params = [
		{
			type: 'param',
			title: 'whitelist',
			description:
				'Array of classnames.  If the click target element has one of these classes, it will not be considered an outclick.',
		},
		{
			type: 'event',
			title: 'outclick',
			description: 'Fired when the user clicks outside of the element.',
			children: [
				{
					type: 'detail',
					title: 'target',
					description:
						'The element that was clicked.  Access with <span class="code" style="display: inline">e.detail.target</span>',
				},
			],
		},
	];
</script>

<Item title="clickOutside" type="action" {path}>
	<div slot="description">
		Emits an event when the user clicks outside the element. Great for modals.

		<Params {params} --width="175px" />
	</div>

	<Example --h="382px" {html}>
		<div class="row">
			<div
				class="clickoutside"
				class:clickedOutside
				on:outclick={handleClickOutside}
				use:clickOutside={{ whitelist: ['notme'] }}
			>
				clickedOutside = {clickedOutside}
			</div>
			<div class="notme">🚫</div>
		</div>
	</Example>
</Item>

<style lang="scss">
	.clickoutside {
		display: flex;
		align-items: center;
		justify-content: center;

		width: 50%;
		height: 50px;
		background: var(--bg-c);

		color: var(--fg-a);

		transition: color 0.2s ease;
		cursor: not-allowed;

		&:hover {
			color: #666666;
		}
	}
	.clickedOutside {
		color: var(--theme-a);
	}

	.row {
		display: flex;
		flex-direction: row;
		justify-content: space-around;
		align-items: center;

		border-radius: var(--radius);
	}

	.notme {
		display: flex;
		align-items: center;
		justify-content: center;

		height: 50px;
		width: 50px;

		background: #ff634755;
		filter: saturate(0);

		user-select: none;
		cursor: not-allowed;
	}
</style>
