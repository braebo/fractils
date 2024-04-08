<script lang="ts" context="module">
	let count = 10

	let params = {
		orbs: 50,
		size: 5,
		a1: 0.1,
		a2: 0.5,
		width: count * 10,
		height: count * 10,
		speed: 0.02,
		mid: count * 5,
		brightness: 0.4,
		color: new Color({ r: 10, g: 200, b: 250, a: 1 }),
		accent: new Color({ r: 0, g: 50, b: 100, a: 1 }),
		glowR: 10,
		glowG: 10,
		glowB: 50,
	}

	export type Params = typeof params
</script>

<script lang="ts">
	// import { DivTweaker } from './divTweaker'
	import Orbs from '../resizable/Orbs.svelte'
	import { Color } from '$lib/color/color'
	import { demoGui } from './demoGui'
	import { Gui } from '$lib/gui/Gui'
	import { onMount } from 'svelte'

	let gui: Gui

	onMount(() => {
		const gui = demoGui(params)
		gui
		
		// //? Cool self themer majig 🌈
		// import('$lib/gui/gui.scss?raw').then(x => {
		// 	setTimeout(() => {
		// 		const root = document.querySelector('.fracgui-root') as HTMLDivElement
		// 		if (!root) {
		// 			console.error('no root')
		// 			return
		// 		}

		// 		const matches = x.default.match(/--fracgui-[\w-]+(?=\s*:)/g)?.map(x => x.trim())
		// 		if (!matches) {
		// 			console.error('no matches')
		// 			return
		// 		}

		// 		const theme = matches.reduce(
		// 			(acc, key) => {
		// 				acc[key] = getComputedStyle(root).getPropertyValue(key).trim()
		// 				return acc
		// 			},
		// 			{} as Record<string, string>,
		// 		)

		// 		const themerGui = new Gui({
		// 			container: document.getElementById('svelte')!,
		// 			title: 'themer',
		// 			// storage: {
		// 			// 	key: 'fractils::fracgui-themer',
		// 			// },
		// 			storage: {
		// 				key: 'fractils::fracgui-themer',
		// 			},
		// 			windowManager: {
		// 				resizable: {
		// 					sides: ['right', 'left'],
		// 					corners: [],
		// 				},
		// 				draggable: {
		// 					defaultPosition: {
		// 						x: window.innerWidth - 250,
		// 						y: 0,
		// 					},
		// 				},
		// 			},
		// 		})

		// 		const folders = new Map<string, Folder>()
		// 		// let currentFolder = themerGui.addFolder({ title: 'theme' })
		// 		let currentFolder = themerGui as Folder

		// 		for (const [key, value] of Object.entries(theme)) {
		// 			const parts = key.replace('--fracgui-', '').split('-')

		// 			for (let i = 0; i < parts.length - 2; i++) {
		// 				const folderName = parts[i]
		// 				if (!folders.has(folderName)) {
		// 					const newFolder = currentFolder.addFolder({ title: folderName })
		// 					folders.set(folderName, newFolder)
		// 				}
		// 				currentFolder = folders.get(folderName)!
		// 			}

		// 			const propertyName = parts.length >= 2 ? parts.slice(-2).join(' ') : parts[0]

		// 			if (value.endsWith('rem')) {
		// 				currentFolder
		// 					.add({
		// 						title: propertyName,
		// 						value: parseFloat(value),
		// 						min: parseFloat(value) - parseFloat(value) * 5,
		// 						max: parseFloat(value) * 5,
		// 						step: 0.01,
		// 					})
		// 					.onChange(v => {
		// 						root.style.setProperty(key, v + 'rem')
		// 					})
		// 			} else if (value.endsWith('px')) {
		// 				currentFolder
		// 					.add({
		// 						title: propertyName,
		// 						value: parseFloat(value),
		// 						min: parseFloat(value) - parseFloat(value) * 5,
		// 						max: parseFloat(value) * 5,
		// 						step: 0.01,
		// 					})
		// 					.onChange(v => {
		// 						root.style.setProperty(key, v + 'px')
		// 					})
		// 			} else if (value.endsWith('%')) {
		// 				currentFolder
		// 					.add({
		// 						title: propertyName,
		// 						value: parseFloat(value),
		// 						min: 0,
		// 						max: 100,
		// 						step: 0.01,
		// 					})
		// 					.onChange(v => {
		// 						root.style.setProperty(key, v + '%')
		// 					})
		// 			} else if (parseFloat(value)) {
		// 				currentFolder
		// 					.add({
		// 						title: propertyName,
		// 						value: parseFloat(value),
		// 						min: parseFloat(value) - parseFloat(value) * 5,
		// 						max: parseFloat(value) * 5,
		// 						step: 0.01,
		// 					})
		// 					.onChange(v => {
		// 						root.style.setProperty(key, String(v))
		// 					})
		// 			} else if (value.startsWith('#')) {
		// 				currentFolder
		// 					.addColor({
		// 						title: propertyName,
		// 						value: value as any as Color,
		// 						expanded: false,
		// 					})
		// 					.onChange(v => {
		// 						root.style.setProperty(key, v.hex8String)
		// 					})
		// 			} else {
		// 				console.warn('Unsupported value:', value)
		// 			}
		// 		}

		// 		// delete empty folders
		// 		for (const value of folders.values()) {
		// 			if (value.controls.size === 0) {
		// 				value.dispose()
		// 			} else {
		// 				value.close()
		// 			}
		// 		}
		// 	}, 1000)
		// })

		// inspectElement(gui.element)

		// // themer = new Themer(gui.element, {
		// // 	mode: $theme,
		// // })

		// // const unsub = theme.subscribe(v => {
		// // 	// const color = v === 'light' ? 'white' : 'black'
		// // 	themer.mode.set(v)
		// // 	// document.body.style.backgroundColor = color
		// // 	// document.documentElement.style.backgroundColor = color
		// // })

		// // const pageTweaker = new DivTweaker(pageEl)

		return () => {
			// unsub()
			// themer.dispose()
			gui.dispose()
		}
	})
</script>

<div class="page">
	<button on:click={() => console.log(gui)}>Log Gui</button>

	<!-- {#if gui?.themer}
		<ThemerComponent themer={gui.themer} --right="-0.75rem" --top="1.5rem" />
	{/if} -->

	<div class="orbs">
		<Orbs bind:params />
	</div>
</div>

<style lang="scss">
	.page {
		width: 100vw;
		height: 100vh;
		max-height: 100vh;
		padding: 1rem;

		background: color-mix(in lch, var(--bg-a), var(--bg-b));
		outline: 1px solid red;

		overflow: hidden;
	}

	.orbs {
		width: 50%;
		height: 50%;
		margin: auto;
	}
</style>
