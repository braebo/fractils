<script>
	import 'greset/css/greset.css'

	import '../prism.css'
	import '../app.scss'

	import MacScrollbar from '$lib/components/MacScrollbar.svelte'
	import Nav from '$examples/_lib/Nav.svelte'
	import { scrollY } from '$examples/stores'
	import { Fractils } from '$lib'
</script>

<template lang="pug">

	Fractils
	
	MacScrollbar
	
	header
		h1 fractils
		p.description
			span utilities for sveltekit

	h2 npm i -D fractils

	Nav

	slot

</template>

<style>
	header {
		padding-top: 0.5rem;

		color: white;
	}
	h1,
	p {
		padding: 0 1rem;

		color: white;
	}
	span {
		font-style: normal !important;
		font-size: 0.9rem;

		opacity: 0.5;
	}
	h2 {
		margin: 1.5rem auto 0 auto;
		padding: 6px 10px 7px 10px;
		width: max-content;

		font-family: var(--mono);
		letter-spacing: 1px;
		text-align: center;
		font-size: 1.1rem;
		font-weight: 300;

		color: var(--color-primary);

		border-radius: var(--border-radius);
		background-color: rgb(21, 22, 29);
	}
</style>
