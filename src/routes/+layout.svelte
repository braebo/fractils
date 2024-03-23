<script lang="ts">
	import 'greset/greset.css'

	import '../prism.css'
	import '../app.scss'

	import { initTheme, theme, toggleTheme } from '$lib/theme/theme'
	import MacScrollbar from '$lib/components/MacScrollbar.svelte'
	import Switch from '$lib/components/Switch.svelte'
	import Device from '$lib/stores/Device.svelte'
	import Github from '$lib/icons/Github.svelte'
	import { onDestroy, onMount } from 'svelte'
	import { wait } from '$lib/utils/wait'
	import { BROWSER } from 'esm-env'

	// https://github.com/sveltejs/kit/pull/8724
	onMount(async () => {
		initTheme()
		await wait(1)
		document.documentElement.style.scrollBehavior = 'smooth'
	})

	onDestroy(() => {
		if (BROWSER) {
			console.clear()
			document.documentElement.style.scrollBehavior = ''
			window.location.reload()
		}
	})

	$: checked = $theme !== 'dark'
</script>

<Device />

<MacScrollbar --color="var(--bg-d)" />

<div class="corner">
	<a href="https://github.com/fractalhq/fractils" rel="noopener noreferrer" target="_blank">
		<div class="gh">
			<Github />
		</div>
	</a>

	<Switch on="🌞" off="🌙" bind:checked on:change={toggleTheme} --switch-accent="var(--bg-c)" />
</div>

<slot />

<div class="br-grow" />

<footer>
	<a href="https://github.com/fractalhq/fractils" rel="noopener noreferrer" target="_blank">
		<div class="gh">
			<Github />
		</div>
	</a>
</footer>

<style lang="scss">
	footer {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;

		display: flex;
		justify-content: center;
		align-items: center;

		height: 4rem;
		margin: 0 auto;
	}

	.gh {
		width: 1.5rem;
		height: 1.5rem;
		aspect-ratio: 1/1;

		fill: var(--fg-c);
		transition: 0.2s;

		filter: drop-shadow(0 2px 2px #0005);

		&:hover,
		&:focus {
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

	.corner {
		position: absolute;
		right: 1rem;
		top: 1rem;

		display: flex;
		gap: 1rem;
	}
</style>
