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

export class InputColor extends Input<Color, ColorInputOptions> {
	state: State<Color>
	initialValue: Color
	opts: ColorInputOptions

	declare elements: {
		container: HTMLElement
		title: HTMLElement
		content: HTMLElement
		color: {
			container: HTMLInputElement
			input: HTMLInputElement
		}
		sliders: {
			container: HTMLDivElement
			a: HTMLInputElement
			b: HTMLInputElement
			c: HTMLInputElement
		}
	}

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

			this.#disposeCallbacks.add(
				this.state.subscribe((v) => {
					opts.binding!.target[opts.binding!.key] = v
				}),
			)
		} else {
			this.initialValue = new Color(opts.value)
			this.state = state(this.initialValue)
		}

		//· Color Input ·······························································¬

		this.elements.color = {} as any

		this.elements.color.container = create('div', {
			classes: ['gui-input-color-container'],
			parent: this.elements.content,
		})

		this.elements.color.input = create('input', {
			type: 'color',
			classes: ['gui-input-color-input'],
			parent: this.elements.color.container,
			value: String(this.state.value),
		})
		this.#listen(this.elements.color.input, 'input', this.updateState)
		//⌟

		//· Sliders ····································································¬

		this.elements.sliders = {} as any

		this.elements.sliders.container = create('div', {
			classes: ['gui-input-color-range-container'],
			parent: this.elements.content,
		})

		for (const key of ['a', 'b', 'c'] as const) {
			this.elements.sliders[key] = create('input', {
				type: 'range',
				classes: ['gui-input-color-range', `gui-input-color-range-${key}`],
				parent: this.elements.sliders.container,
				value: String(this.state.value.hex),
			})
			this.#listen(this.elements.sliders[key], 'input', this.updateState)
		}
		//⌟

		this.state.subscribe((v) => {
			this.elements.color.input.value = String(v)

			this.callOnChange()
		})
	}

	refreshSliders(mode = this.opts.mode) {
		if (mode === 'rgb') {
			for (const [k, v] of Object.entries(this.elements.sliders)) {
				if (k === 'container') continue
				;(v as HTMLInputElement).disabled = false
				;(v as HTMLInputElement).min = '0'
				;(v as HTMLInputElement).max = '255'
				;(v as HTMLInputElement).step = '1'
			}
		}

		if (mode === 'hsl') {
			for (const [k, v] of Object.entries(this.elements.sliders)) {
				if (k === 'container') continue
				;(v as HTMLInputElement).disabled = false
				;(v as HTMLInputElement).min = '0'
				;(v as HTMLInputElement).max = k === 'a' ? '360' : '100'
				;(v as HTMLInputElement).step = '1'
			}
		}

		// Disable the sliders.
		for (const [k, v] of Object.entries(this.elements.sliders)) {
			if (k === 'container') continue
			;(v as HTMLInputElement).disabled = true
		}
	}

	#listen = (element: HTMLElement, event: string, cb: (e: Event) => void) => {
		element.addEventListener(event, cb)
		this.#disposeCallbacks.add(() => {
			element.removeEventListener(event, cb)
		})
	}

	isColor = (v: any): v is Color => {
		return v?.isColor
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

	static svgChevron() {
		const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
		svg.setAttribute('width', '24')
		svg.setAttribute('height', '24')
		svg.setAttribute('viewBox', '-2 -2 28 28')
		svg.setAttribute('stroke', 'currentColor')
		svg.setAttribute('fill', 'none')
		svg.setAttribute('stroke-width', '2')
		svg.setAttribute('stroke-linecap', 'round')
		svg.setAttribute('stroke-linejoin', 'round')

		const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
		path.setAttribute('d', 'm18 15-6-6-6 6')
		svg.appendChild(path)

		return svg
	}

	dispose() {
		super.dispose()

		for (const cb of this.#disposeCallbacks) {
			cb()
		}
	}
}
