<script lang="ts">
	import type { Node } from './Nav.svelte'

	export let node: Node
</script>

<div class="nodes">
	<div class:active={node.childActive}>{node.name}</div>
	{#if node.children}
		{#each node.children as child}
			<svelte:self node={child} />
		{/each}
	{/if}
</div>

<style lang="scss">
	.nodes {
		position: sticky;
		top: 5rem;

		margin-left: 1rem;
	}

	div {
		color: var(--fg-d);
	}
	.active {
		color: var(--theme-a);
	}
</style>
