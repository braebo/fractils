<script lang="ts">
	import { fly, fade } from 'svelte/transition'
	import { mobile, clickOutside } from '$lib'
	import { quintOut } from 'svelte/easing'
	import { onMount, tick } from 'svelte'
	import Burger from './Burger.svelte'

	const paths = ['components', 'utils', 'theme', 'actions']
	let els: HTMLElement[] | [] = []
	function grabEls() {
		els = []
		paths.forEach((path) => {
			const el = document.getElementById(`${path}`)
			if (el) {
				els = [...els, el]
			}
		})
		trackScroll()
	}

	onMount(() => {
		setTimeout(grabEls, 0)
	})

	$: active = 0
	let disableTracker = false
	async function trackScroll() {
		await tick()
		if (!disableTracker) {
			els.forEach(async (el, i) => {
				const { top, width } = el.getBoundingClientRect()
				if (width === 0) grabEls() // fixes weird bug where rects are all 0
				if (top < 200) {
					active = i
				}
			})
		}
	}

	let timer: ReturnType<typeof setTimeout> | null = null
	function handleClick(i: number) {
		if (timer) clearTimeout(timer)
		disableTracker = true
		active = i
		timer = setTimeout(() => {
			disableTracker = false
			grabEls()
		}, 600)
		if (menuOpen) menuOpen = false
		const here = document.location.toString().split('#')[0]
		document.location = here + '#' + [paths[i]]
	}

	let menuOpen = false
</script>

<svelte:window on:scroll={trackScroll} />

<div class="overlay" class:menuOpen />

{#if $mobile}
	<Burger bind:menuOpen />
{/if}

{#if !$mobile || menuOpen}
	<ul
		out:fade={{ duration: 200 }}
		class:mobile={$mobile}
		class:menuOpen
		use:clickOutside
		on:outclick={() => (menuOpen = false)}
	>
		{#each paths as path, i}
			<li
				in:fly={{ x: -30, easing: quintOut, delay: 100 * i, duration: 1000 }}
				class:mobile={$mobile}
				class:active={active === i}
				on:click|capture|preventDefault={(e) => handleClick(i)}
			>
				<a href="#{path}">{path}</a>
			</li>
		{/each}
	</ul>
{/if}

<style lang="scss">
	ul {
		display: flex;
		position: fixed;
		flex-direction: column;
		top: 40vh;
		left: 1rem;
		gap: 1rem;

		color: var(--bg-a);

		&.mobile {
			z-index: 10;

			width: max-content;
			height: max-content;

			margin: auto;
			padding: 2rem;
			padding-left: 3rem;

			font-size: 1.5rem;

			border-radius: var(--border-radius);
			border: 1px solid var(--bg-a);
			background: var(--text-a);
			opacity: 0;

			transition: opacity 0.2s;
			inset: 0;

			&.menuOpen {
				opacity: 1;
			}
		}

		li {
			position: relative;

			list-style-type: none;

			&:after {
				position: absolute;
				top: 9px;
				left: -21px;

				width: 10px;
				height: 10px;

				border-radius: 100%;

				background: var(--color-primary);

				content: '';
				transition: 0.2s ease-out;

				transform: scale(0);
			}

			&.mobile:after {
				top: 15.5px !important;
			}

			&,
			a {
				text-decoration: none;

				color: var(--bg-a);

				transition: 0.2s ease-in-out;
			}

			&.active:after {
				transform: scale(1);
			}
		}
	}

	.active,
	.active a {
		color: var(--color-primary);
		filter: brightness(1.25);
	}

	.overlay {
		position: fixed;

		z-index: 9;

		width: 100vw;
		height: 100vh;

		opacity: 0;
		background: var(--text-a);

		transition: opacity 0.2s;
		pointer-events: none;
		inset: 0;

		&.menuOpen {
			opacity: 0.8;
		}
	}
</style>
