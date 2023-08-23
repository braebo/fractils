<script lang="ts" context="module">
	export interface Node {
		name: string;
		path: string;
		element: HTMLElement | null;
		isActive: boolean;
		childActive: boolean;
		parent: Node | null;
		depth: number;
		disabled: boolean;
		children: Node[];
	}
</script>

<script lang="ts">
	import { mobile, clickOutside, entries } from '$lib';
	import Paths from '$examples/_lib/Paths.svelte';
	import { onMount, tick } from 'svelte';
	import { EXAMPLES } from '$examples';
	import Burger from './Burger.svelte';

	onMount(async () => {
		await tick();
		disableTracker = false;
		buildNodeTree();
		await tick();
		rootNode = rootNode;
	});

	let rootEl: HTMLUListElement;

	let rootNode = {} as any as Node;
	let key = true;
	let initial = true;

	/**
	 * Builds the nav node tree and saves a ref to each
	 * section's header to the corresponding node.
	 */
	function buildNodeTree() {
		rootNode = {
			name: 'root',
			path: '#root',
			element: rootEl,
			isActive: true,
			childActive: false,
			parent: null,
			depth: 0,
			disabled: true,
			children: [] as Node[],
		} satisfies Node;

		rootNode.children = recurse(rootNode, EXAMPLES);

		function recurse(parent: Node, obj: Record<string, any>, depth = 1) {
			let children = [] as Node[];

			for (const [key, value] of entries(obj)) {
				const element = document.getElementById(key);

				const node = {
					name: key,
					path: '#' + key,
					element,
					childActive: false,
					isActive: active === key,
					parent,
					depth,
					disabled: depth < 2,
					children: [] as Node[],
				} satisfies Node;

				children.push(node);

				if (typeof value === 'object') {
					node.children = recurse(node, value, depth + 1);
				}
			}

			return children;
		}

		recurse(rootNode, EXAMPLES);

		if (initial) {
			initial = false;
			const hash = document.location.hash.slice(1);
			if (hash) {
				const node = enabledNodes().find((n) => n.name === hash);

				if (node) {
					updateActiveNode(node);
				}
			}
		}

		key = !key;
	}

	function allNodes() {
		let allNodes = [] as Node[];
		recurse(rootNode);

		function recurse(node: Node) {
			allNodes.push(node);

			for (const child of node.children) {
				recurse(child);
			}
		}

		return allNodes;
	}

	function enabledNodes() {
		return allNodes().filter((n) => !n.disabled);
	}

	function updateActiveNode(node: Node) {
		active = node.name;

		for (const node of allNodes()) {
			updateChildActive(node, false);
		}

		let parent = node.parent;
		while (parent) {
			updateChildActive(parent, true);
			parent = parent.parent;
		}

		rootNode = rootNode;
	}

	function updateChildActive(node: Node, state: boolean) {
		node.childActive = state;
		if (node.name === 'root') return;
		state
			? node.element?.classList.add('child-active')
			: node.element?.classList.remove('child-active');
	}

	let active = 'root';
	let disableTracker = true;

	let timer: NodeJS.Timeout | null = null;
	function handleClick(e: CustomEvent) {
		if (timer) clearTimeout(timer);

		disableTracker = true;
		active = e.detail.path;

		if (menuOpen) menuOpen = false;

		const here = document.location.origin + document.location.pathname;
		document.location = here + '#' + active;

		timer = setTimeout(() => {
			disableTracker = false;
		}, 600);
	}

	function trackScroll() {
		if (disableTracker === false) {
			for (const node of enabledNodes()) {
				if (!node.element) continue;
				if (node.name === 'root') continue;

				const top = node.element.getBoundingClientRect().top;

				if (top > 0 && top < window.innerHeight * 0.33) {
					active = node.name;
					updateActiveNode(node);
					break;
				}
			}
		}
	}

	let menuOpen = false;
</script>

<svelte:window on:scroll={trackScroll} />

<div class="overlay" class:menuOpen />

{#if $mobile}
	<Burger bind:menuOpen />
{/if}

{#if !$mobile || menuOpen}
	<ul
		bind:this={rootEl}
		class:mobile={$mobile}
		class:menuOpen
		use:clickOutside
		on:outclick={() => (menuOpen = false)}
	>
		<Paths node={rootNode} on:click={(e) => handleClick(e)} {active} />
	</ul>
{/if}

<style lang="scss">
	ul {
		position: fixed;
		top: 10rem;
		left: 1rem;

		display: flex;
		flex-direction: column;

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
			background: var(--fg-d);
			opacity: 0;

			transition: opacity 0.2s;
			inset: 0;

			&.menuOpen {
				opacity: 1;
			}
		}
	}

	.overlay {
		position: fixed;

		z-index: 9;

		width: 100vw;
		height: 100vh;

		opacity: 0;
		background: var(--fg-d);

		transition: opacity 0.2s;
		pointer-events: none;
		inset: 0;

		&.menuOpen {
			opacity: 0.8;
		}
	}
</style>
