<script>
	import FourOhFour from '../examples/_lib/FourOhFour.svelte'
</script>

<FourOhFour />

<a href="/">go back</a>

<slot />

<style>
	a {
		display: flex;

		width: max-content;
		margin: -5rem auto 0 auto;

		font-size: 1.5rem;
		text-align: center;

		color: var(--dark-a, slategray);
		text-decoration-skip-ink: auto;
		text-decoration-color: #ffffff50;
	}
</style>
