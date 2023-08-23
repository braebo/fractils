export default `<script>
	import { mobileThreshold, mobile, screenH, screenW, scrollY } from 'fractils'

	$mobileThreshold = 1000
<\/script>

mobile: {$mobile}
screenH: {$screenH}
screenW: {$screenW}
scrollY: {$scrollY}
mouse: {$mouse.x}, {$mouse.y}
`