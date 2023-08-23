export default `<script>
	import { clamp } from 'fractils'

	$: value = clamp(value ?? 50, 25, 75)
<\/script>

{value}

<input bind:value type='range'/>`;
