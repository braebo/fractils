<script>
	import { page } from '$app/stores'
</script>

<a href="/demo" class:active={$page.url.pathname === '/demo'}>/demo</a>

<slot />

<style>
	a {
		position: absolute;
		top: 1.1rem;
		right: 8rem;
		color: var(--fg-d);
		font-family: var(--font-c);
		text-decoration-color: var(--bg-d);

		&.active {
			text-decoration-color: var(--theme-a);
		}
	}
</style>
