<script lang="ts">
	import { stringify, highlight } from '$lib'
	import { quintOut } from 'svelte/easing'
	import { fly } from 'svelte/transition'

	export let data: any
</script>

<div class="debug-inside" transition:fly={{ y: 5, easing: quintOut }}>
	{#await highlight(stringify(data, 2), { lang: 'json' }) then _}
		{@html _.replaceAll(/"|/g, '')}
	{/await}
</div>

<style lang="scss">
	.debug-inside {
		position: absolute;
		top: 4rem;
		left: 1rem;

		max-height: 90vh;
		overflow: auto;
		padding: 0.5rem;

		background: var(--dark-b);
		border: 1px solid var(--bg-a);
		border-radius: var(--radius-lg);

		font-size: 0.8rem;
	}

	:global(:root[theme='light'] .debug-inside) {
		background: var(--dark-c);
	}
</style>
