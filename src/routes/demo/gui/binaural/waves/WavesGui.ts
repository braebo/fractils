// @ts-nocheck
// import type { BinauralBeatsGui } from '../beats/BinauralBeatsGui'
import type { Waves } from './Waves'

import { WAVE_PRESETS } from '../beats/BinauralBeats'
// import { Folder } from '$lib/gui/Folder'
import { Gui } from '$lib/gui/Gui'

const dims = {
	mx: 10,
	my: 150,
	w: 500,
	h: 250,
}

export class WavesGui extends Gui {
	// params = {
	// 	vol: 0.5,
	// }

	constructor(
		public waves: Waves,
		public kind: keyof typeof WAVE_PRESETS,
		// parentFolder: BinauralBeatsGui,
	) {
		const positions = {
			alpha: {
				x: window.innerWidth / 2 - dims.w - dims.mx,
				y: dims.my,
			},
			beta: {
				x: window.innerWidth / 2 + dims.mx,
				y: dims.my,
			},
			theta: {
				x: window.innerWidth / 2 - dims.w - dims.mx,
				y: dims.my + dims.h + dims.my,
			},
			delta: {
				x: window.innerWidth / 2 + dims.mx,
				y: dims.my + dims.h + dims.my,
			},
		}

		super({
			title: kind,
			closed: false,
			windowManager: waves.beats.gui!.windowManager,
			position: positions[kind],
			storage: false,
		})

		console.log(this.opts.position)

		// todo - handle state so we can do:
		// gui.add({
		// 	title: 'Right Frequency',
		// 	value: params.freqL,
		// })

		const btnGrid = this.addButtonGrid({
			title: 'Playback',
			value: [
				[
					{
						label: 'Start',
						onClick: () => {
							if (waves.playing) return
							waves.start()
							this.allInputs.forEach(c => c.refresh())
						},
						isActive() {
							return waves.playing && !waves.stopping
						},
					},
					{
						label: 'Stop',
						onClick: (item) => {
							if (!waves.playing) return
							waves.stop()
							const startBtn = btnGrid.buttons.get('Start')
							startBtn?.element.setAttribute('disabled', '')
							const { color } = item.element.style
							item.element.style.color = 'tomato'
							setTimeout(() => {
								startBtn?.element.removeAttribute('disabled')
								item.element.style.color = color
							}, 0.25 * 1000)
						},
						isActive() {
							return waves.stopping
						},
					},
				],
			],
		})

		const folderL = this.addFolder({ title: 'Left' })

		folderL
			.addNumber({
				title: 'Gain',
				value: waves.volL,
				min: 0,
				max: 1,
				step: 0.01,
			})
			.on('change', v => {
				waves.volL = v
			})

		folderL
			.addNumber({
				title: 'Frequency',
				value: waves.freqL,
				min: 20,
				max: 440,
				step: 1,
			})
			.on('change', v => {
				this.waves.freqL = v
			})

		const folderR = this.addFolder({ title: 'Right' })

		folderR
			.addNumber({
				title: 'Gain',
				value: waves.volR,
				min: 0,
				max: 1,
				step: 0.01,
			})
			.on('change', v => {
				this.waves.volR = v
			})

		folderR
			.addNumber({
				title: 'Frequency',
				value: waves.freqR,
				min: 20,
				max: 440,
				step: 1,
			})
			.on('change', v => {
				this.waves.freqR = v
			})
	}
}
