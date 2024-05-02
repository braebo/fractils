import { BinauralBeats, WAVE_PRESETS } from './BinauralBeats'
import { Gui } from '$lib/gui/Gui'

export class BinauralBeatsGui extends Gui {
	constructor(public beats: BinauralBeats) {
		super({ title: 'Binaural Beats' })

		this.addButtonGrid({
			title: 'Presets',
			value: [
				Object.keys(WAVE_PRESETS).map(kind => {
					return {
						label: kind,
						onClick: ({ button }) => {
							this.beats.addWave(kind as keyof typeof WAVE_PRESETS)
							button.setAttribute('disabled', '')
						},
					}
				}),
			],
		})

		this.addNumber({
			title: 'Volume',
			value: this.beats.volume,
		}).on('change', v => {
			this.beats.volume = v
		})
	}
}
