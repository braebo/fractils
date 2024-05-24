import type { Waves } from './Waves'

import { WAVE_PRESETS } from '../beats/BinauralBeats'
import { Gui } from '$lib/gui/Gui'

const dims = {
	mx: 10,
	my: 150,
	w: 500,
	h: 250,
}

export class WavesGui extends Gui {
	constructor(
		public waves: Waves,
		public kind: keyof typeof WAVE_PRESETS,
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
			_windowManager: waves.beats.gui!.windowManager,
			position: positions[kind],
			storage: false,
		})

		const btnGrid = this.addButtonGrid({
			title: 'Playback',
			value: [
				[
					{
						text: 'Start',
						onClick: () => {
							if (waves.playing) return
							waves.start()
							this.folder.allInputs.forEach(c => c.refresh())
						},
						active() {
							return waves.playing && !waves.stopping
						},
					},
					{
						text: 'Stop',
						onClick: ({ button }) => {
							if (!waves.playing) return
							waves.stop()
							const startBtn = btnGrid.buttons.get('Start')
							startBtn?.element.setAttribute('disabled', '')
							const { color } = button.element.style
							button.element.style.color = 'tomato'
							setTimeout(() => {
								startBtn?.element.removeAttribute('disabled')
								button.element.style.color = color
							}, 0.25 * 1000)
						},
						active() {
							return waves.stopping
						},
					},
				],
			],
		})

		const folderL = this.addFolder({ title: 'Left' })

		// todo - handle state so we can do:
		// gui.add({
		// 	title: 'Right Frequency',
		// 	value: params.freqL,
		// })

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
