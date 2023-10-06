<script lang="ts">
	import Inspector from './Inspector.svelte'
	import {
		mobileThreshold,
		screenW,
		screenH,
		scrollY,
		mobile,
		mouse,
	} from '../../stores/Device.svelte'
</script>

<Inspector
	register={{
		mobile,
		mobileThreshold,
		mouse,
		screenW,
		screenH,
		scrollY,
	}}
/>
