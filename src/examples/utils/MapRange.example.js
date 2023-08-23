export default `<script>
	import { mapRange } from 'fractils'
	
	let value = 50
    $: valueMapped = mapRange(value, 0, 100, -10, 10)
<\/script>

{value}

<input bind:value type='range'/>

{valueMapped}`