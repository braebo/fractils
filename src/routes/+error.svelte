<script>
	import FourOhFour from '../examples/_lib/FourOhFour.svelte'
	import { page } from '$app/stores'
	import { DEV } from 'esm-env'

	if (DEV) {
		console.error($page.error)
	}
</script>

<FourOhFour />

{#if DEV && $page.status !== 404}
	<div class="error">
		<a href="/"> go back</a>
		<pre class="message">{$page.error?.message}</pre>
	</div>
{/if}

<slot />

<style>
	a {
		display: flex;

		width: max-content;
		/* margin: -5rem auto 0 auto; */

		font-size: 1.5rem;
		text-align: center;

		color: var(--dark-a, slategray);
		text-decoration-skip-ink: auto;
		text-decoration-color: #ffffff50;
	}

	.error {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;

		margin-top: 10vh;
		text-align: center;
	}

	.error::-webkit-scrollbar {
		background-color: var(--light-a);
		width: 10px;
		height: 10px;
	}
	.error::-webkit-scrollbar-thumb {
		background-color: rgba(var(--light-d-rgb), 0.5);
		border-radius: 5px;
	}
	.error::-webkit-scrollbar-track {
		background-color: rgba(var(--light-d-rgb), 0.1);
	}
	.error::-webkit-scrollbar-corner {
		background-color: rgba(var(--light-d-rgb), 0.1);
	}

	pre {
		max-width: 90vw;

		text-align: left;
		line-height: 1.5rem;
	}

	.message {
		width: max-content;
		height: max-content;
		margin: 1rem auto;
		padding: 1rem;

		color: var(--dark-d);
		background: transparent;
		border: 1px solid var(--light-d);
		border-radius: var(--radius-lg);
	}
</style>
