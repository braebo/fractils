<script lang="ts">
	import type { InputNumber } from '$lib/gui/inputs/InputNumber'

	import { inspectElement } from '$lib/actions/inspectElement'
	import Orbs from '../resizable/Orbs.svelte'
	import { Color } from '$lib/color/color'
	import { Gui } from '$lib/gui/Gui'
	import { onMount } from 'svelte'

	let gui: Gui
	let slider: InputNumber['state']

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
			// container: document.getElementById('svelte')!,
			storage: {
				key: 'fractils::fracgui',
			},
			windowManager: {
				draggable: {
					defaultPosition: {
						x: 16,
						y: 16,
					},
				},
				resizable: {
					sides: ['right', 'left'],
					corners: [],
				},
			},
			themer: false,
			closed: false,
		})

		size = gui.size
		position = gui.position
		closed = gui.closed

		const f1 = gui.addFolder({ title: 'Orbs' })

		slider = f1.addNumber({
			title: 'count',
			view: 'Slider',
			binding: {
				target: params,
				key: 'orbs',
			},
			min: 1,
			max: 500,
			step: 1,
		}).state

		f1.addNumber({
			title: 'size',
			view: 'Slider',
			binding: {
				target: params,
				key: 'size',
			},
			min: 1,
			max: 30,
			step: 1,
		})

		f1.addNumber({
			title: 'a1',
			view: 'Slider',
			binding: {
				target: params,
				key: 'a1',
			},
			min: 0,
			max: 3,
			step: 0.001,
		})

		f1.addNumber({
			title: 'a2',
			view: 'Slider',
			binding: {
				target: params,
				key: 'a2',
			},
			min: 1,
			max: 3,
			step: 0.001,
		})

		f1.addNumber({
			title: 'width',
			view: 'Slider',
			binding: {
				target: params,
				key: 'width',
			},
			min: 10,
			max: window.innerWidth,
			step: 1,
		})

		f1.addNumber({
			title: 'height',
			view: 'Slider',
			binding: {
				target: params,
				key: 'height',
			},
			min: 10,
			max: window.innerHeight,
			step: 1,
		})

		f1.addNumber({
			title: 'speed',
			view: 'Slider',
			binding: {
				target: params,
				key: 'speed',
			},
			min: 0.0001,
			max: 2,
			step: 0.0001,
		})

		f1.addNumber({
			title: 'mid',
			view: 'Slider',
			binding: {
				target: params,
				key: 'mid',
			},
			min: 1,
			max: 100,
			step: 1,
		})

		f1.addNumber({
			title: 'brightness',
			view: 'Slider',
			binding: {
				target: params,
				key: 'brightness',
			},
			min: 0,
			max: 1,
			step: 0.01,
		})

		f1.addColor({
			title: 'color',
			mode: 'hsva',
			// value: params.color,
			// value: params.color,
			binding: {
				target: params,
				key: 'color',
			},
		})

		f1.addColor({
			title: 'accent',
			view: 'Color',
			mode: 'hsla',
			// mode: 'rgba',
			// value: params.accent,
			binding: {
				target: params,
				key: 'accent',
			},
		})

		f1.addNumber({
			title: 'glowR',
			view: 'Slider',
			binding: {
				target: params,
				key: 'glowR',
			},
			min: 0,
			max: 20,
			step: 0.01,
		})

		f1.addNumber({
			title: 'glowG',
			view: 'Slider',
			binding: {
				target: params,
				key: 'glowG',
			},
			min: 0,
			max: 20,
			step: 0.01,
		})

		f1.addNumber({
			title: 'glowB',
			view: 'Slider',
			binding: {
				target: params,
				key: 'glowB',
			},
			min: 0,
			max: 20,
			step: 0.01,
		})

		// const f2 = f1.addFolder({ title: '2b' })

		// f2.add({
		// 	title: 'width',
		// 	view: 'Color',
		// 	binding: {
		// 		target: params,
		// 		key: 'color',
		// 	},
		// })

		// f2.add<InputColor>({
		// 	title: 'color',
		// 	value: '#ff0000',
		// 	view: 'Color',
		// })

		// //? Cool self themer majig 🌈
		// import('$lib/gui/gui.scss?raw').then((x) => {
		// 	setTimeout(() => {
		// 		const root = document.querySelector('.fracgui-root') as HTMLDivElement
		// 		if (!root) {
		// 			console.error('no root')
		// 			return
		// 		}

		// 		const matches = x.default.match(/--gui-[\w-]+(?=\s*:)/g)?.map((x) => x.trim())
		// 		if (!matches) return

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
		// 			storage: {
		// 				key: 'fractils::gui-themer',
		// 			},
		// 			resizable: {
		// 				sides: ['right', 'left'],
		// 				corners: [],
		// 			},
		// 			themer: false,
		// 			draggable: {
		// 				defaultPosition: {
		// 					x: window.innerWidth - 250,
		// 					y: 0,
		// 				},
		// 			},
		// 			closed: false,
		// 		})

		// 		const f = themerGui.addFolder({ title: 'theme' })

		// 		for (const [k, v] of Object.entries(theme)) {
		// 			if (v.endsWith('rem')) {
		// 				f.add<InputSlider>({
		// 					title: k.replace('--gui-', '').replace(/-/g, ' '),
		// 					value: parseFloat(v),
		// 					view: 'Slider',
		// 				}).onChange((v) => {
		// 					root.style.setProperty(k, v + 'rem')
		// 				})
		// 			}
		// 		}
		// 	}, 1000)
		// })

		inspectElement(gui.element)

		return () => {
			gui.dispose()
		}
	})
</script>

<div class="page">
	<button on:click={() => console.log(gui)}>Log Gui</button>

	<div class="orbs">
		<Orbs bind:params />
	</div>
</div>

<style lang="scss">
	:global(html) {
		background: var(--bg-c) !important;
	}

	.page {
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: flex-start;
		gap: 1rem;
		flex-grow: 1;

		max-width: 400px;
		height: 100%;
		padding: 1rem;
		margin: auto;
	}

	.orbs {
		width: 20rem;
		height: 20rem;
		margin: auto;
	}
</style>
