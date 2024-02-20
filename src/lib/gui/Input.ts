import type { State } from '../utils/state'
import type { Folder } from './Folder'

import { create } from '../utils/create'
import { Logger } from '../utils/logger'
import { state } from '../utils/state'

// prettier-ignore
export type InputValueType =
	| 'number'
	| 'boolean'
	| 'color'
	| 'string'
	| 'object'
	| 'array'
	| 'function'

// prettier-ignore
export type InputView =
	| 'Slider'
	| 'Checkbox'
	| 'Color'
	| 'Text'
	| 'TextArea'
	| 'Range'
	| 'Select'
	| 'Button'

// prettier-ignore
export type InferInputOptions<IT extends InputView, VT> = 
    IT extends 'Slider' ? VT extends number ? NumberInputOptions : 'Value must be a number for Number inputs.' :
    IT extends 'Checkbox' ? VT extends boolean ? BooleanInputOptions : 'Value must be a boolean for Boolean inputs.' :
    IT extends 'Text' ? VT extends string ? StringInputOptions : 'Value must be a string for String inputs.' :
    IT extends 'TextArea' ? VT extends string ? StringInputOptions : 'Value must be a string for String inputs.' :
	IT extends 'Color' ? VT extends string ? ColorInputOptions : 'Value must be a string for Color inputs.' :
	IT extends 'Range' ? VT extends number ? RangeInputOptions : 'Value must be a number for Range inputs.' :
	IT extends 'Select' ? VT extends string ? SelectInputOptions<string> : 'Value must be a string for Select inputs.' :
	IT extends 'Button' ? VT extends Function ? ButtonInputOptions : 'Value must be a function for Button inputs.' :
    never;

// prettier-ignore
export type InferInputView<VT, U = unknown> =
    VT extends number ? 'Slider' :
    VT extends boolean ? 'Checkbox' :
	VT extends HexColor ? 'Color' :
    VT extends string ? 'Text' :
    VT extends string ? 'TextArea' :
	VT extends {min: number, max: number} ? 'Range' :
	VT extends U[] ? 'Select' :
	VT extends Function ? 'Button' :
    never;

// prettier-ignore
export type InferElementType<IT extends InputView> =
	IT extends 'Slider' ? HTMLInputElement :
	IT extends 'Checkbox' ? HTMLInputElement :
	IT extends 'Text' ? HTMLInputElement :
	IT extends 'TextArea' ? HTMLInputElement :
	IT extends 'Color' ? HTMLInputElement :
	IT extends 'Range' ? HTMLInputElement :
	IT extends 'Select' ? HTMLSelectElement :
	IT extends 'Button' ? HTMLButtonElement :
	never

// prettier-ignore
export type InputMap<T extends InputView> =
	T extends 'Slider' ?
	{
		view: T,
		element: HTMLInputElement,
		type: 'number',
		min?: number,
		max?: number,
		step?: number,
	} :
	T extends 'Checkbox' ?
	{
		view: T,
		element: HTMLInputElement,
		type: 'boolean',
	} :
	T extends 'Text' ?
	{
		view: T,
		element: HTMLInputElement,
		type: 'string',
		maxLength?: number,
	} :
	T extends 'TextArea' ?
	{
		view: T,
		element: HTMLInputElement,
		type: 'string',
		maxLength?: number,
	} :
	T extends 'Color' ?
	{
		view: T,
		element: HTMLInputElement,
		type: 'string',
	} :
	T extends 'Range' ?
	{
		view: T,
		element: HTMLInputElement,
		type: 'number',
		min?: number,
		max?: number,
		step?: number,
	} :
	T extends 'Select' ?
	{
		view: T,
		element: HTMLSelectElement,
		type: 'string',
		options: string[],
	} :
	T extends 'Button' ?
	{
		view: T,
		element: HTMLButtonElement,
		type: 'function',
		onClick: (value: boolean) => void,
	} :
	never

export interface BooleanInputOptions {}

export interface StringInputOptions {
	maxLength?: number
	view?: 'text' | 'textarea'
}

// todo ({ r: number, g: number, b: number }) / three.js color / etc
export type HexColor = `#${string}`

export interface ColorInputOptions {}

export interface RangeInputOptions {
	min?: number
	max?: number
	step?: number
}

export interface SelectInputOptions<T> {
	options: T[]
}

export interface ButtonInputOptions {
	onClick: (value: boolean) => void
}

export interface FolderInputOptions {
	children: Folder[]
}

export interface InputOptions<T extends Record<string, any> = Record<string, any>> {
	title: string
	view: InputView
	value: number | string | boolean | HexColor | Function | Record<any, any> | any[]
	binding?: {
		target: T
		key: keyof T
	}
}

export interface NumberInputOptions extends InputOptions {
	value: number
	min?: number
	max?: number
	step?: number
}

const NUMBER_INPUT_DEFAULTS: NumberInputOptions = {
	view: 'Slider',
	title: 'Number',
	value: 0.5,
	min: 0,
	max: 1,
	step: 0.01,
} as const

export class Input {
	view: InputView

	elements = {} as {
		container: HTMLElement
		title: HTMLElement
		content: HTMLElement
	}

	#title = ''
	get title() {
		return this.#title
	}
	set title(v: string) {
		this.#title = v
		this.elements.title.textContent = v
	}

	#log = new Logger('Input', { fg: 'cyan' })
	#listeners = new Set<() => void>()

	constructor(
		options: InputOptions,
		public folder: Folder,
	) {
		this.#title = options.title
		this.view = options.view

		this.elements.container = create('div', {
			classes: ['gui-input-container'],
			parent: this.folder.elements.content,
		})

		this.elements.title = create('div', {
			classes: ['gui-input-title'],
			parent: this.elements.container,
			textContent: this.title,
		})

		this.elements.content = create('div', {
			classes: ['gui-input-content'],
			parent: this.elements.container,
		})

		this.#log.groupCollapsed().fn('constructor').info({ opts: options, this: this })
	}

	// listen(event: string, cb: (e: Event) => void, element: HTMLElement) {
	// 	element.addEventListener(event, cb)
	// 	this.#listeners.add(() => {
	// 		element.removeEventListener(event, cb)
	// 	})
	// }

	dispose() {
		this.#log.fn('dispose').info(this)
		for (const listener of this.#listeners) {
			listener()
		}
	}
}

export class InputSlider extends Input {
	state: State<number>
	initialValue: number

	declare elements: {
		container: HTMLElement
		title: HTMLElement
		content: HTMLElement
		range: HTMLInputElement
		number: {
			container: HTMLInputElement
			input: HTMLInputElement
			buttons: {
				container: HTMLDivElement
				increment: HTMLDivElement
				decrement: HTMLDivElement
			}
		}
	}

	#log = new Logger('InputSlider', { fg: 'cyan' })
	#listeners = new Set<() => void>()

	constructor(options: NumberInputOptions, folder: Folder) {
		const opts = { ...NUMBER_INPUT_DEFAULTS, ...options }
		super(opts, folder)

		this.#log.fn('constructor').info({ opts, this: this }).groupEnd()

		if (opts.binding) {
			this.initialValue = opts.binding.target[opts.binding.key]
			this.state = state(this.initialValue)
			this.#listeners.add(
				this.state.subscribe((v) => {
					opts.binding!.target[opts.binding!.key] = v
				}),
			)
		} else {
			this.initialValue = opts.value
			this.state = state(opts.value)
		}

		this.elements.number = {
			container: create('div', {
				classes: ['gui-input-number-container'],
				parent: this.elements.content,
			}),
			// @ts-expect-error
			buttons: {},
		}

		//· Number Input ·······························································¬

		this.elements.number.input = create('input', {
			type: 'number',
			classes: ['gui-input-number-input'],
			parent: this.elements.number.container,
			value: String(this.state.value),
			step: opts.step,
		})
		this.elements.number.input.addEventListener('input', this.updateState)
		this.#listeners.add(() =>
			this.elements.number.input.removeEventListener('input', this.updateState),
		)
		//⌟

		//· Number Buttons ·····························································¬

		this.elements.number.buttons.container = create('div', {
			classes: ['gui-input-number-buttons-container'],
			parent: this.elements.number.container,
		})

		//· Increment ··································································¬

		this.elements.number.buttons.increment = create('div', {
			classes: ['gui-input-number-button', 'gui-input-number-buttons-increment'],
			parent: this.elements.number.buttons.container,
		})
		this.elements.number.buttons.increment.appendChild(InputSlider.svgChevron())
		const increment = () => {
			this.state.set(this.state.value + (opts?.step ?? 1))
		}
		this.elements.number.buttons.increment.addEventListener('click', increment)
		this.#listeners.add(() =>
			this.elements.number.buttons.increment.removeEventListener('click', increment),
		)
		//⌟

		//· Decrement ··································································¬

		this.elements.number.buttons.decrement = create('div', {
			classes: ['gui-input-number-button', 'gui-input-number-buttons-decrement'],
			parent: this.elements.number.buttons.container,
		})

		const decrement = () => {
			this.state.set(this.state.value - (opts?.step ?? 1))
		}
		this.elements.number.buttons.decrement.addEventListener('click', decrement)
		this.#listeners.add(() =>
			this.elements.number.buttons.decrement.removeEventListener('click', decrement),
		)

		const upsideDownChevron = InputSlider.svgChevron()
		upsideDownChevron.setAttribute('style', 'transform: rotate(180deg)')
		this.elements.number.buttons.decrement.appendChild(upsideDownChevron)
		//⌟
		//⌟

		//· Range Input ································································¬

		this.elements.range = create<HTMLInputElement>('input', {
			type: 'range',
			classes: ['gui-input-range'],
			parent: this.elements.content,
			min: opts.min,
			max: opts.max,
			step: opts.step,
			value: String(this.state.value),
		})

		this.elements.range.addEventListener('input', this.updateState)
		this.#listeners.add(() =>
			this.elements.range.removeEventListener('input', this.updateState),
		)
		//⌟

		this.state.subscribe((v) => {
			this.elements.range.value = String(v)
			this.elements.number.input.value = String(v)
		})
	}

	updateState = (v: number | Event) => {
		if (typeof v !== 'number') {
			if (v?.target && 'valueAsNumber' in v.target) {
				this.state.set(v.target.valueAsNumber as number)
			}
		} else {
			this.state.set(v)
		}
	}

	static svgChevron() {
		const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
		svg.setAttribute('width', '24')
		svg.setAttribute('height', '24')
		svg.setAttribute('viewBox', '0 0 24 24')
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

		for (const cb of this.#listeners) {
			cb()
		}
	}
}
