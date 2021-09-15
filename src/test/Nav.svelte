<script lang="ts">
	import { onMount } from 'svelte'

	const paths = ['env', 'actions', 'components', 'utils']
	let els: HTMLElement[] | [] = []

	onMount(async () => {
		paths.forEach((path) => {
			const el = document.getElementById(`${path}`)
			if (el) {
				els = [...els, el]
			}
		})
		trackScroll()
	})

	let active = 0
	function trackScroll() {
		els.forEach((el, i) => {
			if (el.getBoundingClientRect().top < 200) {
				active = i
			}
		})
	}
</script>

<svelte:window on:scroll={trackScroll} />

<ul>
	{#each paths as path, i}
		<li class:active={active === i}>
			<a href="#{path}">{path}</a>
		</li>
	{/each}
</ul>

<style>
	ul {
		display: flex;
		position: fixed;
		flex-direction: column;
		top: 40vh;
		left: 1rem;
		gap: 1rem;
		color: var(--bg-a);
	}

	li {
		position: relative;
		list-style-type: none;
	}

	a,
	li {
		text-decoration: none;
		color: var(--bg-a);
		transition: 0.2s ease-in-out;
	}

	li:after {
		content: '';
		position: absolute;
		left: -21px;
		top: 9px;

		width: 10px;
		height: 10px;

		background: var(--color-primary);
		border-radius: 100%;

		transform: scale(0);
		transition: 0.2s ease-out;
	}

	.active,
	.active a {
		color: var(--color-primary);
		filter: brightness(1.25);
	}

	li.active:after {
		transform: scale(1);
	}
</style>
