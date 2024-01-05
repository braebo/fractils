<script>
	import { mobile, screenH, screenW, scrollY, mouse } from '$lib'
	import Example from '$examples/_lib/Item/Example.svelte'
	import Params from '$examples/_lib/Item/Params.svelte'
	import Item from '../_lib/Item/Item.svelte'
	import html2 from './Device2.html?raw'
	import html1 from './Device.html?raw'
	// import { Device } from '$lib'

	const path = 'stores/Device.svelte'

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
			description: `Writable store to adjust the $mobile 'breakpoint' threshold. Default <span class="code">900</span>`,
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
	<div slot="description">A series of device related stores.</div>
	<Params {params} --width="210px" />
	First, the stores need to be registered. &nbsp;Ideally in the root layout:
	<br /><br />

	<Example result={false} file={'src/routes/__layout.svelte'} html={html2} />

	<br />

	Now, they're reactive:<br /><br />
	<Example --h="283px" file="Example.svelte" html={html1}>
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
