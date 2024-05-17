<script lang="ts">
	import { fly } from 'svelte/transition'

	export let text: string
	export let style = ''

	/**
	 * True for 1.25s after the button is clicked.
	 */
	let active = false
	/**
	 * True, after `copied` becomes false again, for a duration approximately
	 * equal to the length of any subsequent CSS transitions.
	 */
	let outro = false

	let cooldown: ReturnType<typeof setTimeout>
	let outroCooldown: ReturnType<typeof setTimeout>
	let btn: HTMLButtonElement

	function copy() {
		if (typeof navigator === 'undefined') return
		if (active) return

		navigator.clipboard?.writeText?.(text)

		clearTimeout(cooldown)
		clearTimeout(outroCooldown)

		active = true

		cooldown = setTimeout(() => {
			btn.blur() // remove :active and :focus styles
			active = false
			outro = true

			clearTimeout(outroCooldown)
			outroCooldown = setTimeout(() => {
				outro = false
			}, 500)
		}, 1250)
	}
</script>

<button
	class="copy"
	class:active
	class:outro
	{style}
	title="copy to clipboard"
	transition:fly
	on:click|preventDefault={copy}
	bind:this={btn}
>
	<div class="svg-container">
		<svg
			class="icon copy"
			class:active
			class:outro
			xmlns="http://www.w3.org/2000/svg"
			width="100%"
			height="100%"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<path
				class="back"
				class:active
				class:outro
				d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
			/>
			<rect
				class="front"
				class:active
				class:outro
				width="13"
				height="13"
				x={active ? '5.5' : '9'}
				y={active ? '5.5' : '9'}
				rx={active ? '10' : '2'}
				ry={active ? '10' : '2'}
			/>
			<path class="check" class:active class:outro stroke-width="2" d="M17 9l-7 7-4-4" />
		</svg>
	</div>
</button>

<style lang="scss">
	button {
		display: grid;
		all: unset;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;

		max-width: 100%;
		max-height: 100%;
		padding: 0.25rem 0.5rem;
		margin: 0.5rem;

		border-radius: 0.2rem;
		outline: 1px solid transparent;
		color: var(--bg-d);

		&:hover {
			color: var(--fg-c);
			background: var(--bg-b);

			@at-root {
				:global(:root[theme='light']) & {
					&:hover {
						background: var(--bg-e);
						color: var(--bg-a);
					}
					&.active,
					&.outro {
						background: transparent;
					}
				}
			}
		}

		&:active,
		&:focus {
			color: var(--fg-b);
			background: var(--bg-c);
		}

		line-height: 1;
		height: 1rem;
		font-size: 0.8rem;
		font-family: var(--font-mono);

		transition: 0.25s;
	}

	.svg-container {
		display: flex;
		align-items: center;
		justify-content: center;

		width: 100%;
		height: 100%;

		grid-area: 1/1;
		aspect-ratio: 1/1;
	}

	$dur: 0.33s;
	$bounce: cubic-bezier(0.175, 0.885, 0.32, 1.275);
	$bounceXtreme: cubic-bezier(0.2, 2, 0.2, 0.85);
	$quintInOut: cubic-bezier(0.86, 0, 0.07, 1);
	$quartInOut: cubic-bezier(0.77, 0, 0.175, 1);
	button.copy {
		&:not(.active, .outro) {
			backdrop-filter: blur(0.35rem);
		}

		svg {
			overflow: visible;
		}
	}

	.front,
	.back,
	.check {
		transform-origin: 50% 50%;
	}

	.front {
		transition-duration: 0.66s;
		transition-timing-function: $bounce;

		stroke: currentColor;

		&.active {
			transition-timing-function: $bounceXtreme;
			transition-duration: 0.2s;

			transform: scale(2);
			fill: #12a084;
			stroke: #12a084;
		}

		&.outro {
			transition-duration: 0.5s;
		}
	}

	.back {
		transform: translate(0, 0);
		transition-duration: $dur;
		transition-timing-function: $quartInOut;

		&.active {
			transform: translate(15%, 15%);
		}

		&.outro {
			transition-delay: 0s;
			transition-duration: 1s;
		}
	}

	.check {
		fill: transparent;
		stroke: var(--color, var(--light-a));

		opacity: 0;

		transform: scale(0);

		transition: 0.2s $bounce 0s;

		&.active {
			opacity: 1;
			transform: scale(1.25);

			transition: 0.3s $bounceXtreme 0.1s;
		}
	}

	button.active,
	button.outro {
		outline-color: transparent;
		color: var(--bg-d);
		background: transparent;
	}
</style>
