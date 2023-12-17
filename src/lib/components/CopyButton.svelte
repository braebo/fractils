<script lang="ts">
	import Copy from '../icons/Copy.svelte'
	import { fly } from 'svelte/transition'

	export let text: string
	export let style = ''

	let copied = false
	let cooldown: NodeJS.Timeout

	function copy() {
		if (typeof navigator === 'undefined') return
		if (copied) return

		navigator.clipboard?.writeText?.(text)

		clearTimeout(cooldown)
		copied = true
		cooldown = setTimeout(() => {
			copied = false
		}, 1000)
	}
</script>

<button class="copy" title="copy to clipboard" on:click|preventDefault={copy} {style}>
	<div transition:fly>
		<Copy bind:active={copied} />
	</div>
</button>

<style lang="scss">
	button.copy {
		display: grid;
		all: unset;

		max-width: 100%;
		max-height: 100%;
		padding: 0.25rem 0.5rem;
		margin: 0.5rem;
		border-radius: 0.2rem;

		display: flex;
		align-items: center;
		justify-content: center;

		line-height: 1;
		height: 1rem;

		font-size: 0.8rem;
		font-family: var(--font-mono);

		color: var(--bg-d);
		background: var(--bg-a);

		transition: 0.15s;

		&:hover {
			color: var(--fg-c);
			background: var(--bg-b);
		}
		cursor: pointer;

		outline: 1px solid transparent;
		transition: 0.25s;

		&:focus {
			outline: 1px solid var(--bg-b);
		}

		&:active {
			color: var(--fg-b);
			background: var(--bg-c);
		}
	}

	div {
		display: flex;
		align-items: center;
		justify-content: center;

		width: 100%;
		height: 100%;

		grid-area: 1/1;
	}
</style>
