<script lang="ts">
	import Orbs, { params } from './Orbs.svelte'
	import { resizable } from '$lib'
</script>

<div class="page">
	<div class="orbs" use:resizable={{ visible: true }}>
		<Orbs />
	</div>
</div>

<style lang="scss">
	.page {
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: flex-start;
		gap: 1rem;

		max-width: 400px;
		height: 100%;
		flex-grow: 1;
		margin: auto;

		padding: 1rem;
	}

	.orbs {
		position: absolute;

		width: 200px;
		height: 200px;
		margin: auto;
	}
</style>
