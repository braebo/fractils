<script>
	import FourOhFour from '../examples/_lib/FourOhFour.svelte'
	import { page } from '$app/stores'
	import { DEV } from 'esm-env'

	if (DEV) {
		console.error($page.error)
	}
</script>

{#if $page.status === 404}
	<FourOhFour />
{:else}
	<pre class="message" style="position:absolute; bottom:0; right:1rem;">{$page.status}</pre>
	<div class="internal-error">
		<h1
			>{$page.status !== 500 && $page.error?.message
				? $page.error.message
				: 'Something went wrong'}</h1
		>
		<div class="br-sm"></div>
		<p>Sorry about that 🙁</p>
	</div>
	<div class="br-sm"></div>
	<div class="br"></div>
{/if}

<div class="error">
	<a href="/"> go back</a>
	{#if DEV}
		<pre class="message">{$page.error?.message}</pre>
	{/if}
</div>

<slot />

<style>
	.internal-error {
		width: fit-content;
		text-align: center;
		margin: auto;
		margin-top: 33vh;
	}

	a {
		display: flex;

		width: max-content;

		color: var(--fg-a, pink);

		font-size: 1.5rem;
		text-align: center;
		text-decoration-skip-ink: auto;
		text-decoration-color: #ffffff00;

		&:hover {
			text-decoration-color: #ffffff50;
		}
	}

	.error {
		display: flex;
		flex-direction: column;
		align-items: center;
		/* gap: 1rem; */

		text-align: center;
	}

	.error::-webkit-scrollbar {
		background-color: var(--fg-a);
		width: 10px;
		height: 10px;
	}
	.error::-webkit-scrollbar-thumb {
		background-color: rgba(var(--fg-d-rgb), 0.5);
		border-radius: 5px;
	}
	.error::-webkit-scrollbar-track {
		background-color: rgba(var(--fg-d-rgb), 0.1);
	}
	.error::-webkit-scrollbar-corner {
		background-color: rgba(var(--fg-d-rgb), 0.1);
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

		color: var(--fg-d);
		background: transparent;
		border: 1px solid var(--fg-d);
		border-radius: var(--radius-lg);
	}
</style>
