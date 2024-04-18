<script lang="ts">
	import { localStorageStore } from '$lib'
	import { onMount } from 'svelte'
	import { get } from 'svelte/store'

	onMount(() => {
		localStorage.setItem('test', JSON.stringify("foo"))
		const store = localStorageStore('test', 'bar')
		console.log(get(store))
	})
</script>

<style lang="scss">
	:global(.page) {
		color: red;
	}
</style>
