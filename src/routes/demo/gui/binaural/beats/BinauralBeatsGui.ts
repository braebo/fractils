import { BinauralBeats, WAVE_PRESETS } from './BinauralBeats'
import { Gui } from '$lib/gui/Gui'

export class BinauralBeatsGui extends Gui {
	constructor(public beats: BinauralBeats) {
		super({ title: 'Binaural Beats', position: 'top-center' })

		this.folder.addButtonGrid({
			title: 'Presets',
			value: [
				Object.keys(WAVE_PRESETS).map(kind => {
					return {
						text: kind,
						onClick: ({ button }) => {
							let wave =
								this.beats.waves.get(kind)

							if (!wave) {
								button.active = true
								wave = this.beats.addWave(kind as keyof typeof WAVE_PRESETS)
							} else {
								button.active = false
								this.beats.removeWave(kind as keyof typeof WAVE_PRESETS)
							}
						},
					}
				}),
			],
		})

		this.folder
			.addNumber({
				title: 'Volume',
				value: this.beats.volume,
			})
			.on('change', v => {
				this.beats.volume = v
			})
	}
}
