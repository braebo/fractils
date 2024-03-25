<script lang="ts">
	import { inspectElement } from '$lib/actions/inspectElement'
	import Orbs from '../resizable/Orbs.svelte'
	import { Themer } from '$lib/themer/Themer'
	import { Color } from '$lib/color/color'
	import { Gui } from '$lib/gui/Gui'
	import { onMount } from 'svelte'

	let themer: Themer

	let gui: Gui
	let size: Gui['size']
	let position: Gui['position']
	let closed: Gui['closed']

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

	onMount(() => {
		gui = new Gui({
			title: 'Orbs',
			container: document.getElementById('svelte')!,
			storage: {
				key: 'fractils::fracgui',
			},
			closed: false,
			placement: {
				position: 'bottom-right',
			},
		})

		size = gui.size
		position = gui.position
		closed = gui.closed

		const f1 = gui.addFolder({ title: 'main' })

		f1.add({
			title: 'count',
			binding: {
				target: params,
				key: 'orbs',
			},
			min: 1,
			max: 250,
			step: 1,
		})

		f1.addNumber({
			title: 'width',
			binding: {
				target: params,
				key: 'width',
			},
			min: 10,
			max: window.innerWidth,
			step: 1,
		}).set(window.innerWidth / 2)

		f1.addNumber({
			title: 'height',
			binding: {
				target: params,
				key: 'height',
			},
			min: 10,
			max: window.innerHeight,
			step: 1,
		}).set(window.innerHeight / 2)

		const motionFolder = f1.addFolder({ title: 'motion' })

		motionFolder.addNumber({
			title: 'speed',
			binding: {
				target: params,
				key: 'speed',
			},
			min: 0.0001,
			max: 2,
			step: 0.0001,
		})

		motionFolder.addNumber({
			title: 'a1',
			binding: {
				target: params,
				key: 'a1',
			},
			min: 0,
			max: 3,
			step: 0.001,
		})

		motionFolder.addNumber({
			title: 'a2',
			binding: {
				target: params,
				key: 'a2',
			},
			min: 1,
			max: 3,
			step: 0.001,
		})

		const appearanceFolder = f1.addFolder({ title: 'appearance' })

		appearanceFolder.addNumber({
			title: 'size',
			binding: {
				target: params,
				key: 'size',
			},
			min: 1,
			max: 30,
			step: 1,
		})

		appearanceFolder.addNumber({
			title: 'brightness',
			binding: {
				target: params,
				key: 'brightness',
			},
			min: 0,
			max: 1,
			step: 0.01,
		})

		appearanceFolder.addColor({
			title: 'color',
			mode: 'hsva',
			binding: {
				target: params,
				key: 'color',
			},
		})

		appearanceFolder.addColor({
			title: 'accent',
			mode: 'hsla',
			binding: {
				target: params,
				key: 'accent',
			},
		})

		const glowFolder = appearanceFolder.addFolder({ title: 'glow' })

		glowFolder.addNumber({
			title: 'glowR',
			binding: {
				target: params,
				key: 'glowR',
			},
			min: 0,
			max: 20,
			step: 0.01,
		})

		glowFolder.addNumber({
			title: 'glowG',
			binding: {
				target: params,
				key: 'glowG',
			},
			min: 0,
			max: 20,
			step: 0.01,
		})

		glowFolder.addNumber({
			title: 'glowB',
			binding: {
				target: params,
				key: 'glowB',
			},
			min: 0,
			max: 20,
			step: 0.01,
		})

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
		// 		for (const [key, value] of folders.entries()) {
		// 			if (value.controls.size === 0) {
		// 				value.dispose()
		// 			} else {
		// 				value.close()
		// 			}
		// 		}
		// 	}, 1000)
		// })

		inspectElement(gui.element)

		// themer = new Themer(gui.element, {
		// 	mode: $theme,
		// })

		// const unsub = theme.subscribe(v => {
		// 	// const color = v === 'light' ? 'white' : 'black'
		// 	themer.mode.set(v)
		// 	// document.body.style.backgroundColor = color
		// 	// document.documentElement.style.backgroundColor = color
		// })

		return () => {
			// unsub()
			themer.dispose()
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

		background: var(--bg-b);
		outline: 1px solid red;

		overflow: hidden;
	}

	.orbs {
		width: 20rem;
		height: 20rem;
	}
</style>
