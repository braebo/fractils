<script lang="ts">
	import { onMount, tick } from 'svelte'

	const paths = ['env', 'actions', 'components', 'utils']
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
		grabEls()
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
	}
</script>

<svelte:window on:scroll={trackScroll} />

<ul>
	{#each paths as path, i}
		<li
			class:active={active === i}
			on:click|capture={(e) => handleClick(i)}
		>
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

	.active,
	.active a {
		color: var(--color-primary);
		filter: brightness(1.25);
	}

	li.active:after {
		transform: scale(1);
	}
</style>
