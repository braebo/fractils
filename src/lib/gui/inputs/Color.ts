import type { ColorRepresentation, HexColor } from '../../color/color'
import type { State } from '../../utils/state'
import type { InputOptions } from './Input'
import type { Folder } from '../Folder'

import { create } from '../../utils/create'
import { Logger } from '../../utils/logger'
import { Color } from '../../color/color'
import { state } from '../../utils/state'
import { Input } from './Input'

export type ColorMode = 'hex' | 'rgb' | 'hsl' | 'rgbString' | 'hslString' | 'array'

type ElementMap = {
	[key: string]: HTMLInputElement | HTMLDivElement | ElementMap
}

export interface ColorControllerElements {
	[key: string]: HTMLInputElement | HTMLDivElement | ElementMap
	container: HTMLInputElement
	input: HTMLInputElement
	sliders: {
		container: HTMLDivElement
		a: HTMLInputElement
		b: HTMLInputElement
		c: HTMLInputElement
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
	value: '#FF0000',
	mode: 'hex',
} as const

export class InputColor extends Input<Color, ColorInputOptions, ColorControllerElements> {
	state: State<Color>
	initialValue: Color
	opts: ColorInputOptions

	#log = new Logger('InputColor', { fg: 'cyan' })
	#disposeCallbacks = new Set<() => void>()

	constructor(options: Partial<ColorInputOptions>, folder: Folder) {
		const opts = { ...COLOR_INPUT_DEFAULTS, ...options }
		super(opts, folder)

		this.opts = opts
		this.#log.fn('constructor').info({ opts, this: this }).groupEnd()

		if (opts.binding) {
			this.initialValue = opts.binding.target[opts.binding.key]

			if (typeof this.initialValue !== 'object' || this.initialValue.isColor) {
				this.initialValue = this.initialValue
			}

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

		this.elements.controller = colorController(this, opts)

		this.state.subscribe((v) => {
			this.elements.controller.input.value = String(v)

			this.callOnChange()
		})
	}

	refreshSliders(mode = this.opts.mode) {
		if (mode === 'rgb') {
			for (const [k, v] of Object.entries(this.elements.controller.sliders)) {
				if (k === 'container') continue
				;(v as HTMLInputElement).disabled = false
				;(v as HTMLInputElement).min = '0'
				;(v as HTMLInputElement).max = '255'
				;(v as HTMLInputElement).step = '1'
			}
		}

		if (mode === 'hsl') {
			for (const [k, v] of Object.entries(this.elements.controller.sliders)) {
				if (k === 'container') continue
				;(v as HTMLInputElement).disabled = false
				;(v as HTMLInputElement).min = '0'
				;(v as HTMLInputElement).max = k === 'a' ? '360' : '100'
				;(v as HTMLInputElement).step = '1'
			}
		}

		// Disable the sliders.
		for (const [k, v] of Object.entries(this.elements.controller.sliders)) {
			if (k === 'container') continue
			;(v as HTMLInputElement).disabled = true
		}
	}

	updateState = (v: Color | Event) => {
		if (v instanceof Event) {
			if (v?.target && 'valueAsColor' in v.target) {
				this.state.value.hex = v.target.valueAsColor as HexColor
			}
		} else {
			this.state.set(v)
		}
	}

	isColor = (v: any): v is Color => {
		return v?.isColor
	}

	dispose() {
		super.dispose()

		for (const cb of this.#disposeCallbacks) {
			cb()
		}
	}
}

export function colorController(input: Input<Color>, options: ColorInputOptions) {
	const elements = {
		container: create('div', {
			classes: ['gui-input-color-container'],
			parent: input.elements.content,
		}),
		sliders: {},
	} as any as ColorControllerElements
	//· Color Input ·······························································¬

	elements.input = create('input', {
		type: 'color',
		classes: ['gui-input-color-input'],
		parent: elements.container,
		value: String(input.state.value),
	})
	input.listen(elements.input, 'input', input.updateState)
	//⌟

	//· Sliders ····································································¬

	elements.sliders = {} as any

	elements.sliders.container = create('div', {
		classes: ['gui-input-color-range-container'],
		parent: input.elements.content,
	})

	for (const key of ['a', 'b', 'c'] as const) {
		elements.sliders[key] = create('input', {
			type: 'range',
			classes: ['gui-input-color-range', `gui-input-color-range-${key}`],
			parent: elements.sliders.container,
			value: String(input.state.value.hex),
		})
		input.listen(elements.sliders[key], 'input', input.updateState)
	}
	//⌟

	return elements
}
