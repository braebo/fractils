<script lang="ts">
	import type { Node } from '$examples/_lib/Nav.svelte'

	import { createEventDispatcher } from 'svelte'
	import { fly, fade } from 'svelte/transition'
	import { quintOut } from 'svelte/easing'
	import { mobile } from '$lib'

	export let active: string
	export let node: Node
	$: children = node.children

	const dispatch = createEventDispatcher()
	function handleClick(index: number, path: string) {
		dispatch('click', {
			index,
			path,
		})
	}
</script>

{#each children ?? [] as node, i}
	<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
	<li
		class="path"
		in:fly={{ x: -30, easing: quintOut, delay: 100 * i, duration: 1000 }}
		out:fade={{ duration: 200 }}
		class:mobile={$mobile}
		class:sub-path={node.depth > 1}
		class:child-active={node.childActive}
		class:active={active === node.name && node.depth > 1}
		on:click|capture|preventDefault={() => handleClick(i, node.name)}
		on:touchstart|capture={() => handleClick(i, node.name)}
		on:keydown|capture|preventDefault={() => handleClick(i, node.name)}
	>
		<a href="#{node.name}">{node.name}</a>

		{#if node.children}
			<svelte:self {node} {active} on:click on:touchstart on:keydown />
		{/if}
	</li>
{/each}

<style lang="scss">
	li {
		position: relative;

		list-style-type: none;

		&:after {
			position: absolute;
			top: 5px;
			left: -21px;

			width: 10px;
			height: 10px;

			border-radius: 100%;

			background: var(--brand-a);

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

			transition: 0.1s ease-in-out;
		}

		&.active:after {
			transform: scale(1);
		}
	}

	.path {
		margin-top: 1rem;
		margin-bottom: 0.25rem;

		font-size: 1.25rem;
		font-variation-settings: 'wght' 400;
		font-family: var(--font-a);

		&.active:not(.sub-path) {
			color: var(--brand-a);
			filter: brightness(1.25);
		}

		&:has(.sub-path.active) {
			&:after {
				top: 15.5px !important;
			}
		}
	}

	:global(html[theme='light']) .path {
		font-variation-settings: 'wght' 600;
	}

	:global(.child-active) {
		color: var(--fg-a);
		filter: brightness(1);
	}
	:global(.child-active .sub-path) {
		color: var(--fg-d);
		filter: brightness(1);
	}

	.sub-path {
		font-family: var(--font-mono);
		margin-top: 0.25rem;

		padding-left: 1.5rem;
		font-size: 0.9rem;

		&.active,
		&.active {
			color: var(--brand-a);
			filter: brightness(1.25);
		}
	}
</style>
