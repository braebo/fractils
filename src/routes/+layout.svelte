<script lang="ts">
	import 'greset/greset.css';

	import '../prism.css';
	import '../app.scss';

	import MacScrollbar from '$lib/components/MacScrollbar.svelte';
	import Github from '$lib/components/Github.svelte';
	import Nav from '$examples/_lib/Nav.svelte';
	import { scrollY } from '$examples/stores';
	import { onMount, tick } from 'svelte';
	import { Device, wait } from '$lib';

	// https://github.com/sveltejs/kit/pull/8724
	onMount(async () => {
		await wait(1);
		document.documentElement.style.scrollBehavior = 'smooth';
	});
</script>

<template lang="pug">

	Device

	MacScrollbar(--color='var(--bg-d)')

	header
		h1 fractils
		p.description
			//- span Utilities for Svelte & Typescript...
			span Some stuff I often use...

	h2 pnpm i -D fractils

	Nav

	slot

	footer
			a(href='https://github.com/fractalhq/fractils' alt='Github' target='_blank' rel='noopener noreferrer')
				.gh
					Github

</template>

<style lang="scss">
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
		font-variation-settings: 'wght' 200;
		font-family: var(--font-b);
		font-size: 0.9rem;

		opacity: 0.5;
	}

	h2 {
		margin: 1.5rem auto 0 auto;
		padding: 6px 10px 7px 10px;
		width: max-content;

		font-family: var(--font-mono);
		letter-spacing: 1px;
		text-align: center;
		font-size: 1.1rem;
		font-weight: 300;

		color: var(--brand-a);

		border-radius: var(--border-radius);
		background-color: rgb(21, 22, 29);
	}

	footer {
		display: flex;
		justify-content: center;
		gap: 1rem;

		padding: 1rem 0;
	}

	.gh {
		width: 1.5rem;
		height: 1.5rem;
		aspect-ratio: 1/1;

		fill: var(--fg-c);
		transition: 0.2s;

		filter: drop-shadow(0 2px 2px #000);

		&:hover {
			fill: var(--fg-a);
			animation: bubble-up 0.2s ease-in-out forwards;
			filter: drop-shadow(0 3px 42px #fff);
		}
	}

	@keyframes bubble-up {
		0% {
			transform: scale(1);
		}
		75% {
			transform: scale(1.2);
		}
		100% {
			transform: scale(1.15);
		}
	}
</style>
