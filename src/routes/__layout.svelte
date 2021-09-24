<script>
	import 'greset/css/greset.css'

	import '../prism.css'
	import '../app.scss'

	import { scrollY } from '$examples/stores'
	import Nav from '$examples/_lib/Nav.svelte'

	import { Fractils } from '$lib'
</script>

<Fractils />

<svelte:window bind:scrollY={$scrollY} />

<div class="page">
	<header>
		<h1>fractils</h1>
		<p class="description">
			<span style="opacity: 0.5">utilities for sveltekit</span>
		</p>
	</header>

	<h2>npm i -D fractils</h2>

	<Nav />

	<slot />
</div>

<style>
	.page {
		position: relative;
	}
	header {
		padding-top: 0.5rem;

		color: white;
	}
	h1,
	h2,
	p {
		padding: 0 1rem;

		color: white;
	}
	h2 {
		margin: 1.5rem auto 0 auto;
		width: max-content;
		padding: 6px 10px 6px 10px;

		font-family: var(--mono);
		letter-spacing: 1px;
		text-align: center;
		font-size: 1.1rem;
		font-weight: 300;

		color: var(--color-primary);

		border-radius: var(--border-radius);
		background-color: rgb(21, 22, 29);
	}
	span {
		font-style: normal !important;
		font-size: 0.9rem;
	}
</style>
