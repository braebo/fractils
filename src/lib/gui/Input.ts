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

export interface InputOptions {
	title: string
	value: number | string | boolean | HexColor | Function | Record<any, any> | any[]
	view: InputView
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
	title: string
	view: InputView
	container: HTMLElement
	element!: HTMLElement
	
	#log = new Logger('Input', { fg: 'cyan' })
	#listeners = new Set<() => void>()

	constructor(
		options: InputOptions,
		public folder: Folder,
	) {
		this.title = options.title
		this.view = options.view
		this.container = this.#createContainer()
		this.#log.fn('constructor').info(this)
	}

	#createContainer() {
		const element = create('div', {
			classes: ['gui-input'],
			parent: this.folder.elements.content,
		})

		create('label', {
			classes: ['gui-label'],
			parent: element,
			textContent: this.title,
		})

		return element
	}

	listen(event: string, cb: (e: Event) => void) {
		this.element.addEventListener(event, cb)
		this.#listeners.add(() => {
			this.container.removeEventListener(event, cb)
		})
	}

	dispose() {
		this.#log.fn('dispose').info(this)
		for (const listener of this.#listeners) {
			listener()
		}
	}
}

export class InputSlider extends Input {
	state: State<number>
	element: HTMLInputElement
	#log = new Logger('InputSlider', { fg: 'cyan' })

	constructor(options: NumberInputOptions, folder: Folder) {
		const opts = { ...NUMBER_INPUT_DEFAULTS, ...options }
		super(opts, folder)

		this.state = state(opts.value)

		this.element = create<HTMLInputElement>('input', {
			classes: ['gui-number-input'],
			parent: this.container,
			type: 'range',
			min: opts.min,
			max: opts.max,
			step: opts.step,
			value: String(this.state.value),
		})

		this.listen('input', this.updateState)

		this.state.subscribe(v => {
			this.element.value = String(v)
		})

		this.#log.fn('number').info(this.element)
	}

	updateState = (e: Event) => {
		this.state.set((e.target as HTMLInputElement).valueAsNumber)
	}

	dispose() {
		super.dispose()
	}
}
