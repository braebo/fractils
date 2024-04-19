<script lang="ts">
	import { stringify, highlight } from '$lib'
	// export let insidePos = { x: 0, y: 0 }
	export let data: any
</script>

<div class="debug-inside">
	<p>.innerbox</p>
	{#await highlight(stringify(data, 2), { lang: 'json' }) then _}
		{@html _.replaceAll(/"|/g, '')}
	{/await}
</div>

<style lang="scss">
	.debug-inside {
		position: absolute;
		top: 4rem;
		left: 1rem;

		background: var(--bg-b);
		border: 1px solid var(--bg-a);
		border-radius: var(--radius-sm);
		padding: 0.5rem;
	}
</style>
