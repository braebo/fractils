export default `<script>
	import { localStorageStore } from 'fractils'

	const count = localStorageStore('count', 0)
<\/script>

<div on:click={() => $count++}>+<\/div>

{$count}

<div on:click={() => $count--}>-<\/div>`