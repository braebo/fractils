import type { BinauralBeats } from '../beats/BinauralBeats'

import { WAVE_PRESETS } from '../beats/BinauralBeats'
import { WavesGui } from './WavesGui'
import { BROWSER } from 'esm-env'

export class Waves {
	merger!: ChannelMergerNode

	oscL?: OscillatorNode
	oscR?: OscillatorNode

	gainL!: GainNode
	gainR!: GainNode

	playing = false
	stopping = false

	gui?: WavesGui

	constructor(
		public beats: BinauralBeats,
		public kind: keyof typeof WAVE_PRESETS,
	) {
		if (!BROWSER) return

		console.log('init')

		this.#volL = beats.volume
		this.#volR = beats.volume

		const { freqL, freqR } = WAVE_PRESETS[kind]
		this.#freqL = freqL
		this.#freqR = freqR

		this.gainL = new GainNode(this.ctx, { gain: 0 })
		this.gainR = new GainNode(this.ctx, { gain: 0 })

		this.merger = new ChannelMergerNode(this.ctx, { numberOfInputs: 2 })

		this.addGui(kind)
	}

	get ctx() {
		return this.beats.ctx
	}

	#freqL = 0
	get freqL() {
		return this.#freqL
	}
	set freqL(v) {
		this.#freqL = v
		this.oscL?.frequency.setValueAtTime(v, this.ctx.currentTime + 0.02)
	}

	#freqR = 0
	get freqR() {
		return this.#freqR
	}
	set freqR(v) {
		this.#freqR = v
		this.oscR?.frequency.setValueAtTime(v, this.ctx.currentTime + 0.02)
	}

	#volR = 0
	get volR() {
		return this.#volR
	}
	set volR(v) {
		this.#volR = v
		this.gainR.gain.linearRampToValueAtTime(v, this.ctx.currentTime + 0.1)
	}

	#volL = 0
	get volL() {
		return this.#volL
	}
	set volL(v) {
		this.#volL = v
		this.gainL.gain.linearRampToValueAtTime(v, this.ctx.currentTime + 0.1)
	}

	start() {
		if (this.stopping) return
		if (this.playing) this.stop()

		this.playing = true

		const fade_in = 0.02

		this.oscL = new OscillatorNode(this.ctx, {
			type: 'sine',
			frequency: this.freqL,
			channelCount: 1,
		})
		this.oscR = new OscillatorNode(this.ctx, {
			type: 'sine',
			frequency: this.freqR,
			channelCount: 1,
		})

		this.oscL.connect(this.gainL).connect(this.merger, 0, 0) // Left channel
		this.oscR.connect(this.gainR).connect(this.merger, 0, 1) // Right channel

		this.merger.connect(this.beats.gain_node)

		this.oscL.start()
		this.oscR.start()

		// this.gainL.gain.exponentialRampToValueAtTime(this.volL, this.ctx.currentTime + 0.25)
		// this.gainR.gain.exponentialRampToValueAtTime(this.volR, this.ctx.currentTime + 0.25)
		this.gainL.gain.setTargetAtTime(this.volL, this.ctx.currentTime, fade_in)
		this.gainR.gain.setTargetAtTime(this.volR, this.ctx.currentTime, fade_in)
	}

	async stop() {
		if (!this.playing || this.stopping) return
		this.stopping = true

		const fade_out = 0.02

		this.gainL.gain.setTargetAtTime(0, this.ctx.currentTime, fade_out)
		this.gainR.gain.setTargetAtTime(0, this.ctx.currentTime, fade_out)

		this.oscL?.stop(fade_out + this.ctx.currentTime + 0.015)
		this.oscR?.stop(fade_out + this.ctx.currentTime + 0.015)

		setTimeout(() => {
			this.playing = false
			this.stopping = false
		}, fade_out * 1000)
	}

	addGui(kind: keyof typeof WAVE_PRESETS) {
		this.gui = new WavesGui(this, kind)
	}

	dispose() {
		this.stop()
		this.merger.disconnect()
		this.gui?.dispose()
	}
}
