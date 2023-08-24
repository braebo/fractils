<script lang="ts">
	import ThemePulse from '$examples/_lib/ThemePulse.svelte';
	import { entries } from '$lib/utils/object';
	import { EXAMPLES } from '$examples';
</script>

{#each entries(EXAMPLES) as example}
	{@const categoryName = example[0].toLowerCase()}
	{@const category = example[1]}

	<h2 id={categoryName}>
		<a class="double-under" href="#{categoryName}">{categoryName}</a>
	</h2>

	{#each Object.values(category) as example, j}
		{#if j === 0}
			<svelte:component this={ThemePulse} />
		{/if}

		<svelte:component this={example} />
	{/each}
{/each}

<div class="buffer" style="min-height: 50px" />

<style lang="scss">
	h2 {
		display: flex;
		justify-content: center;
	}

	a {
		position: relative;

		max-width: fit-content !important;
		margin: 5rem auto -1rem auto;
		padding: 0 1rem;

		text-align: center;
		text-decoration: none;

		font-family: var(--font-a);

		color: var(--fg-a);

		&:first-of-type {
			margin-top: 2.5rem;
		}
	}
</style>
