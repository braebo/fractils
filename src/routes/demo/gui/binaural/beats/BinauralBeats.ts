import { BinauralBeatsGui } from './BinauralBeatsGui'
import { Waves } from '../waves/Waves'
import { BROWSER } from 'esm-env'
import { clamp } from '$lib'

export const WAVE_PRESETS = {
	alpha: {
		freqL: 440,
		freqR: 444,
		description: 'Alpha waves (8-13 Hz) are associated with relaxation and stress reduction.',
	},
	beta: {
		freqL: 220,
		freqR: 224,
		description:
			'Beta waves (13-30 Hz) are associated with focus, concentration, and alertness.',
	},
	theta: {
		freqL: 110,
		freqR: 114,
		description:
			'Theta waves (4-8 Hz) are associated with deep relaxation, meditation, and creativity.',
	},
	delta: {
		freqL: 55,
		freqR: 59,
		description: 'Delta waves (0.5-4 Hz) are associated with deep sleep and healing.',
	},
} as const

export class BinauralBeats {
	gui?: BinauralBeatsGui

	ctx!: AudioContext
	gain_node!: GainNode
	waves = new Map<string, Waves>()

	#volume!: number
	get volume() {
		return this.#volume
	}
	set volume(v) {
		this.#volume = v
		this.gain_node.gain.linearRampToValueAtTime(v, this.ctx.currentTime + 0.02)
	}

	constructor(options?: { volume?: number }) {
		if (!BROWSER) return
		this.ctx = new AudioContext()

		this.#volume = clamp(options?.volume ?? 0.5, 0, 1)
		this.gain_node = new GainNode(this.ctx, { gain: this.#volume })
		this.gain_node.connect(this.ctx.destination)

		this.gui = new BinauralBeatsGui(this)
	}

	addWave = (kind: keyof typeof WAVE_PRESETS) => {
		const wave = new Waves(this, kind)
		this.waves.set(kind, wave)
		return wave
	}

	removeWave = (kind: keyof typeof WAVE_PRESETS) => {
		const wave = this.waves.get(kind)
		if (wave) {
			wave.dispose()
			this.waves.delete(kind)
		} else {
			console.error(`Wave kind "${kind}" not found`)
		}
	}
}
