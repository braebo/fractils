<script>
	import 'greset/css/greset.css'

	import '../prism.css'
	import '../app.scss'

	import Nav from '$examples/Nav.svelte'
</script>

<header>
	<h1>fractils</h1>
	<p class="description">
		<span style="opacity: 0.5">utilities for sveltekit</span>
	</p>
</header>

<h3>npm i -D fractils</h3>

<Nav />

<slot />

<style>
	header {
		padding-top: 0.5rem;

		color: white;
	}
	h1,
	h3,
	p {
		padding: 0 1rem;

		color: white;
	}
	h3 {
		text-align: center;
		font-size: 0.9rem;

		color: var(--color-primary);
	}
	span {
		font-style: normal !important;
		font-size: 0.9rem;
	}
</style>
