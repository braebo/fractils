<!-- TODO: this wont work.. maybe we can make an init function for
	use in __layout to attach listeners to the root layout..? -->
<script>
	import Example from '$examples/_lib.svelte/Item/Example.svelte'
	import Params from '$examples/_lib.svelte/Item/Params.svelte'
	import { mobile, screenH, screenW, scrollY } from '$lib'

	import Item from '../_lib.svelte/Item/Item.svelte'

	const example1 = `<script>
	import { mobileThreshold, mobile, screenH, screenW, scrollY } from '$lib'
    
    $mobileThreshold = 1000
<\/script>

mobile: {$mobile}
screenH: {$screenH}
screenW: {$screenW}
scrollY: {$scrollY}
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
		scrollY: $scrollY,
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
			title: 'scrollY',
			description: `Tracks the users scroll position.`,
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
				{#each Object.entries(stores) as key, i}
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
</style>
