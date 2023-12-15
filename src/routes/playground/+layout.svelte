<script lang="ts">
	import type { LayoutData } from './$types'
	import { page } from '$app/stores'

	export let data: LayoutData
</script>

<div class="layout">
	<nav>
		{#each data.routes as route, i}
			<a class:active={$page.route.id === '/playground/' + route} href="/playground/{route}"
				>{route}</a
			>

			{#if i < data.routes.length - 1}<span class="dot">·</span>{/if}
		{/each}
	</nav>

	<div class="br" />

	<div class="page" style:--max-width="900px">
		<slot />
	</div>
</div>

<style>
	nav {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 0.5rem;

		padding: 1rem;

		width: 100%;

		background: var(--bg-b);
        box-shadow: var(--shadow-lg);
	}

	a {
		color: var(--fg-d);
		font-family: var(--font-b);
	}

	.dot {
		user-select: none;
	}

	a.active {
		color: var(--fg-a);
	}

	a:hover {
		text-decoration: underline;
	}

	.layout {
		display: flex;
		flex-direction: column;

		min-height: 95vh;
	}

	.page {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;

		/* background: rgba(var(--bg-b-rgb, 0.5)); */
		padding: 2rem;
		margin: 2rem auto;

		border-radius: 0.5rem;
		width: fit-content;
	}
</style>
