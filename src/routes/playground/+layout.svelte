<script lang="ts">
	import type { LayoutData } from './$types'

	import { page } from '$app/stores'

	export let data: LayoutData
</script>

<div class="layout">
	<nav>
		{#each data.routes as route, i}
			<a data-sveltekit-preload-code data-sveltekit-preload-data class:active={$page.route.id === '/playground/' + route} href="/playground/{route}"
				>{route}</a
			>

			{#if i < data.routes.length - 1}<span class="dot">·</span>{/if}
		{/each}
	</nav>

	<div class="br" />

	<section class="page" style:--max-width="900px">
		<slot />
	</section>
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

		&:focus {
			outline: 1px solid var(--theme-a);
			outline-offset: 0.2rem;
			border: none;
			border-radius: var(--radius-sm);
		}
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

		max-width: calc(100vw - var(--padding-sm));
		padding: var(--padding-sm);
		margin: 2rem auto;

		border-radius: 0.5rem;
		width: fit-content;
	}
</style>
