import type { ColorRepresentation, HexColor } from '../../color/color'
import type { ElementMap, InputOptions } from './Input'
import type { State } from '../../utils/state'
import type { Folder } from '../Folder'

import { colorSlidersController } from '../controllers/color'
import { entries } from '../../utils/object'
import { create } from '../../utils/create'
import { Logger } from '../../utils/logger'
import { Color } from '../../color/color'
import { state } from '../../utils/state'
import { Input } from './Input'

export type ColorMode = 'hex' | 'rgba' | 'hsla' | 'rgbaString' | 'hslaString' | 'array'

export interface ColorControllerElements extends ElementMap {
	container: HTMLDivElement
	input: HTMLInputElement
	sliders: {
		container: HTMLDivElement
		a: HTMLInputElement
		b: HTMLInputElement
		c: HTMLInputElement
		d: HTMLInputElement
	}
}

export interface ColorInputOptions extends InputOptions {
	value: ColorRepresentation | Color
	mode: ColorMode
}
//⌟

export const COLOR_INPUT_DEFAULTS: ColorInputOptions = {
	view: 'Color',
	title: 'Color',
	value: '#FF0000FF',
	mode: 'hex',
} as const

export class InputColor extends Input<Color, ColorInputOptions, ColorControllerElements> {
	readonly isColor = true as const

	#mode: ColorMode
	get mode() {
		return this.#mode
	}
	set mode(v: ColorMode) {
		this.#mode = v
		this.refreshSliders(v)
	}

	#log = new Logger('InputColor', { fg: 'cyan' })

	constructor(options: Partial<ColorInputOptions>, folder: Folder) {
		const opts = { ...COLOR_INPUT_DEFAULTS, ...options }
		super(opts, folder)

		this.opts = opts
		this.#log.fn('constructor').info({ opts, this: this }).groupEnd()

		this.#mode = opts.mode

		if (opts.binding) {
			this.initialValue = opts.binding.target[opts.binding.key]

			if (typeof this.initialValue !== 'object' || !this.initialValue.isColor) {
				this.initialValue = this.initialValue
			} else {
			}

			this.initialValue = new Color(this.initialValue)

			console.log(this.initialValue)

			this.state = state(this.initialValue)

			this.disposeCallbacks.add(
				this.state.subscribe((v) => {
					opts.binding!.target[opts.binding!.key] = v
				}),
			)
		} else {
			this.initialValue = new Color(opts.value)
			this.state = state(this.initialValue)
		}

		const container = create<HTMLDivElement>('div', {
			classes: ['gui-input-color-container'],
			parent: this.elements.content,
		})

		this.elements.controllers = {
			container,
			input: create<HTMLInputElement>('input', {
				type: 'color',
				classes: ['gui-input-color-input'],
				parent: container,
				value: String(this.state.value.hex),
			}),
			sliders: colorSlidersController(this, opts, container),
		}

		this.state.subscribe((v) => {
			this.elements.controllers.input.value = String(v.hex)
			this.refreshSliders()
			this.callOnChange()
		})
	}

	refreshSliders(mode = this.opts.mode) {
		if (mode === 'rgba') {
			for (const [k, v] of entries(this.elements.controllers.sliders)) {
				if (k === 'container') continue
				;(v as HTMLInputElement).disabled = false
				;(v as HTMLInputElement).min = '0'
				;(v as HTMLInputElement).max = k === 'd' ? '255' : '1'
				;(v as HTMLInputElement).step = k === 'd' ? '0.01' : '1'
			}
		}

		if (mode === 'hsla') {
			for (const [k, v] of entries(this.elements.controllers.sliders)) {
				if (k === 'container') continue
				;(v as HTMLInputElement).disabled = false
				;(v as HTMLInputElement).min = '0'
				;(v as HTMLInputElement).max = k === 'a' ? '100' : k === 'd' ? '360' : '1'
				;(v as HTMLInputElement).step = k === 'd' ? '0.01' : '1'
			}
		}

		// Disable the sliders.
		for (const [k, v] of entries(this.elements.controllers.sliders)) {
			if (k === 'container') continue
			;(v as HTMLInputElement).disabled = true
		}
	}

	updateState = (v: Color | Event) => {
		console.log('updateState', v)
		if (v instanceof Event) {
			if (v?.target && 'valueAsColor' in v.target) {
				this.state.value.hex = v.target.valueAsColor as HexColor
			}
		} else {
			this.state.set(v)
		}
	}

	dispose() {
		super.dispose()
	}
}
