export default `<script>
	import { wait } from 'fractils'

	let ready, set, go
	async function start() {
		ready = true
		await wait(500)
		set = true
		await wait(500)
		go = true
	}
<\/script>`