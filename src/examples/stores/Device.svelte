<!-- TODO: this wont work.. maybe we can make an init function for
	use in __layout to attach listeners to the root layout..? -->
<script>
	import Example from '$examples/_lib/Item/Example.svelte'
	import Params from '$examples/_lib/Item/Params.svelte'
	import { mobile, screenH, screenW, scrollY, mouse } from '$lib'

	import Item from '../_lib/Item/Item.svelte'

	const example1 = `<script>
	import { mobileThreshold, mobile, screenH, screenW, scrollY } from 'fractils'
    
    $mobileThreshold = 1000
<\/script>

mobile: {$mobile}
screenH: {$screenH}
screenW: {$screenW}
scrollY: {$scrollY}
mouse: \`\${$mouse.x}, \${$mouse.y}\`
`

	const example2 = `<script>
	import { Fractils } from 'fractils'
<\/script>

<Fractils />

<slot />
`

	const path = 'stores/device.svelte'

	$: stores = {
		mobile: $mobile,
		screenW: $screenW,
		screenH: $screenH,
		scrollY: Math.floor($scrollY),
		mouse: `${$mouse.x}, ${$mouse.y}`,
	}

	const params = [
		{
			type: 'store',
			title: 'mobile',
			description: `Detects if <span class="code inline">screenW</span> &lt; <span class="code inline">mobileThreshold</span>`,
		},
		{
			type: 'store',
			title: 'mobileThreshold',
			description: `Writable store to adjust the $mobile 'breakpoint' threshold. Default 900.`,
		},
		{
			type: 'store',
			title: 'screenW',
			description: `Tracks the screen width.`,
		},
		{
			type: 'store',
			title: 'screenH',
			description: `Tracks the screen height.`,
		},
		{
			type: 'store',
			title: 'scrollY',
			description: `Tracks the users scroll position.`,
		},
		{
			type: 'store',
			title: 'mouse',
			description: `Tracks the users mouse position.`,
		},
	]
</script>

<Item title="device" type="stores" {path}>
	<div slot="description" class="device">
		A series of device related stores.
		<Params {params} --width="200px" />

		<br /><br />First, the stores need to be registered. Ideally in the root layout:<br /><br />

		<Example example={example2} result={false} file={'src/routes/__layout.svelte'} />
		<br />
	</div>

	They can then be consumed normally:<br /><br />
	<Example example={example1} --h="283px" file="Example.svelte">
		<div class="result">
			<div class="grid">
				{#each Object.entries(stores) as _, i}
					<div class="store">
						<div class="key">{Object.keys(stores)[i]}</div>
						<div class="value">{Object.values(stores)[i]}</div>
					</div>
				{/each}
			</div>
		</div>
	</Example>
</Item>

<style>
	.grid {
		display: flex;
		justify-content: space-around;
	}
	:global(.device .inline) {
		transform: translateY(-2px);
	}
	.value {
		min-width: 75px;
	}
</style>
