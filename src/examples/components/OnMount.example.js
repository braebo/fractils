export default `<script>
	import { OnMount } from 'fractils'
</script>

<OnMount>
	<div in:fly={{ x: 100, duration: 1000 }}>
		My intro transition will always play!
	</div>
</OnMount>`
