<script lang="ts">
	import MacScrollbar from '$lib/ui/Scrollbar.svelte'
	import { createEventDispatcher } from 'svelte'
	import { resize } from '$lib/utils/resizable'
	import { screenH } from 'fractils'

	export let isOpen = false
	export let right = false
	export let top = '10px'
	export let theme = ''
	export let nub = '🚀'

	interface Link {
		text: string
		path?: string
	}

	export let links: Link[]
	export let position = {
		top: '7vh',
		right: null as string | null,
		bottom: null as string | null,
		left: null as string | null,
	}
	const css = Object.entries(position).reduce((a, b) => (b[1] ? `${a + b.join(':')};` : a), '')

	const dispatch = createEventDispatcher()
	const toggle = () => {
		isOpen = !isOpen
		dispatch('menuToggle', {
			label: 'menu',
			isOpen,
		})
	}

	let content: HTMLElement

	$: if (content) {
		content.style.maxHeight = $screenH - content.getBoundingClientRect().top * 2 + 'px'
	}

	let e: Event
</script>

<div
	use:resize={{ side: 'left', color: 'hsla(0, 0%, 10%, 0.8)' }}
	style={`--sm-top: ${top};` + css}
	class="side-menu {theme}"
	id="inspector-side-menu"
	class:isOpen
	class:right
>
	<div class="nub" on:click={toggle}>{nub}</div>
	<div class="side-menu-content" bind:this={content} on:scroll={(ev) => (e = ev)}>
		<MacScrollbar root=".side-menu-content" {e} --mac-scrollbar-color="#131315" />
		<nav>
			{#each links as link}
				{#if link.path}
					<a href={link.path}>{link.text}</a>
				{:else}
					<h4>{link.text}</h4>
				{/if}
			{/each}
		</nav>
		<slot />
	</div>
</div>

<style lang="scss">
	#inspector-side-menu {
		--color: var(--dark-a);
		--nub-bg: var(--background-int);
		--highlight: var(--light-c);
		--lowlight: var(--light-b);
		--background-int: var(--light-a);
		--nub-bg: var(--background-int);
		--header-bg: var(--light-b);
		--header-color: var(--dark-c);
		--value-color: rgb(238, 135, 0);
		--key-color: rgb(31, 102, 133);
		--font-small: 0.9em;
	}
	.side-menu {
		position: fixed;
		/* top: var(--sm-top); */
		bottom: 100vh;
		right: 0;

		width: var(--width, 300px);
		// height: calc(100vw - var(--top-position));
		height: fit-content;

		font-family: sans-serif;

		transition: transform 0.2s var(--ease_in_out_quint, cubic-bezier(0.83, 0, 0.17, 1));
		transform: translate3d(100%, 0, 0);
		z-index: var(--z, 2001);

		border-radius: 5px;
	}

	.side-menu.isOpen {
		transform: translate3d(0, 0, 0);
	}

	.side-menu .nub {
		position: absolute;
		right: 99%;
		top: 20px;

		padding: 10px;

		background: var(--nub-bg, var(--header-bg));
		border-bottom: solid 1px var(--lowlight);
		border-right: solid 1px var(--lowlight);
		border-top: solid 1px var(--highlight);
		border-radius: 5px 0 0 5px;
		box-shadow: var(--level-4, -6px 14px 28px rgba(0, 0, 0, 0.1), -6px 10px 10px rgba(0, 0, 0, 0.12));

		cursor: pointer;
	}

	.side-menu-content {
		position: relative;
		box-sizing: border-box;

		// max-height: calc(100vh - var(--top-position));

		color: var(--color-int);
		background: var(--background-int);
		border-left: solid 1px var(--highlight);
		box-shadow: var(--level-4, 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22));
		border-radius: 5px 0 0 5px;

		// overflow: hidden;
		overflow-y: scroll;

		&::-webkit-scrollbar {
			width: 0px;
			display: none;
		}
		scrollbar-width: none;
		-ms-overflow-style: none;
		/* overflow-y: scroll; */
	}

	h4 {
		margin: 0;
		padding: 4px 6px;

		background: var(--header-bg);
		color: var(--header-color, --color);
		border-bottom: solid 1px var(--lowlight);
		border-top: solid 1px var(--highlight);
		box-shadow: var(--level-2, 0 2px 3px rgba(0, 0, 0, 0.1), 0 1px 5px rgba(0, 0, 0, 0.13));

		font-size: var(--heading-font-size, 12px);
		text-transform: capitalize;

		cursor: pointer;
	}

	a {
		display: block;

		padding: 10px;

		color: var(--color);
	}
</style>
