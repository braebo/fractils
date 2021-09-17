<script lang="ts">
	import { toggleTheme, initTheme } from '$theme/themeManager'
	import { spring, tweened } from 'svelte/motion'
	import { expoOut } from 'svelte/easing'
	import { fly } from 'svelte/transition'
	import { theme } from '$theme/theme'
	import { browser } from '$app/env'
	import { onMount } from 'svelte'

	if (browser) {
		initTheme()
	}

	let transitioning = false,
		hovering = true,
		waxOn: HTMLAudioElement,
		waxOff: HTMLAudioElement

	const bubble = spring(0, { stiffness: 0.15, damping: 0.4 })
	const lightBG = tweened(0, { duration: 1000 })
	const darkBG = tweened(0, { duration: 1000 })

	const wait = (t: number) => new Promise((res) => setTimeout(res, t))

	async function click() {
		// hovering = false
		transitioning = true
		bubble.set(0)
		waxOn = new Audio('/static/audio/Clicky.opus')
		waxOff = new Audio('/static/audio/Clicky.opus')
		waxOff.volume = 0.1
		waxOn.volume = 0.1
		$theme == 'light' ? waxOff.play() : waxOn.play()
		$theme == 'light' ? darkBG.set(5) : lightBG.set(5)

		await wait(250)

		toggleTheme()

		await wait(1000)
		$theme == 'light' ? lightBG.set(0) : darkBG.set(0)
		bubble.set(1)

		transitioning = false
	}

	const mouseover = () => {
		if (!transitioning) {
			// hovering = true
			bubble.set(1.2)
		}
	}

	const mouseout = () => {
		if (!transitioning) {
			// hovering = false
			bubble.set(1)
		}
	}

	onMount(() => {
		setTimeout(() => {
			bubble.set(1)
		}, 1000)
	})
</script>

<template lang="pug">

	.bubble-wrap
	.bg.dark-bg(style='transform: scale({$darkBG})')
	.bg.light-bg(style='transform: scale({$lightBG})')

	.bubble(
		style="transform: scale({$bubble});"
		on:mouseover='{mouseover}'
		on:mouseout='{mouseout}'
		on:focus='{mouseover}'
		on:blur='{mouseout}'
		on:click='{click}'
	)
		+if('hovering')
			+key('theme')
				.icon(transition:fly='{{ y: 20, easing: expoOut }}') {$theme == 'light' ? '🌙' : '☀️'}

</template>

<style lang="scss">
	.bubble-wrap {
		position: fixed;
		top: 0;

		width: 100vw;
		height: 100vw;

		overflow: hidden;
		pointer-events: none;
	}

	.bg {
		position: absolute;
		right: -100vh;
		top: -100vh;
		z-index: -1;

		width: 200vh;
		height: 200vh;

		border-radius: 50%;
	}

	.dark-bg {
		background-color: var(--always-dark);
	}

	.light-bg {
		background-color: #ffffff;
	}

	.bubble {
		position: absolute;
		right: -60px;
		top: -60px;
		z-index: 20;

		width: 100px;
		height: 100px;

		border-radius: 100%;
		background-color: var(--dark-a);

		overflow: hidden;

		cursor: pointer;
		pointer-events: all;
		transition: color 0.5s;

		.icon {
			position: absolute;
			bottom: 15px;
			left: 20px;

			font-size: 1rem;

			background-color: transparent;

			pointer-events: none;
		}
	}
</style>
