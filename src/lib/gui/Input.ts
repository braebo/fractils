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
export type InferInputType<VT, U = unknown> =
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

export interface NumberInputOptions {
	min?: number
	max?: number
	step?: number
}

const NUMBER_INPUT_DEFAULTS: NumberInputOptions = {
	min: 0,
	max: 1,
	step: 0.01,
} as const

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

export type InputOptions<VT, IT extends InputView = InferInputType<VT>> = {
	title: string
	value: VT
	type?: IT
} & InferInputOptions<IT, VT>

export class Input<
	VT = any,
	IT extends InputView = InferInputType<VT>,
	ET extends Element = InferElementType<IT>,
> {
	state: State<VT>
	title: string
	type: IT

	container: HTMLElement
	element!: ET

	#log = new Logger('Input', { fg: 'cyan' })

	constructor(
		options: InputOptions<IT>,
		public folder: Folder,
	) {
		this.state = state(options.value) as unknown as State<VT>

		this.title = options.title

		this.type = (options.type ?? typeof options.value) as unknown as IT
		this.type.charAt(0).toUpperCase() + this.type.slice(1) // capitalize

		this.container = this.#createContainer()

		this.#log.fn('constructor').info(this)

		this.#createInput()
	}

	#createInput() {
		switch (this.type) {
			case 'Slider':
				this.number()
				break
			// case 'Checkbox':
			// 	this.boolean()
			// 	break
			// case 'Text':
			// case 'TextArea':
			// 	this.string()
			// 	break
			// case 'Color':
			// 	this.color()
			// 	break
			// case 'Range':
			// 	this.range()
			// 	break
			// case 'Select':
			// 	this.select()
			// 	break
			// case 'Button':
			// 	this.button()
			// 	break
		}
	}

	number(options?: NumberInputOptions) {
		const { min, max, step } = { ...NUMBER_INPUT_DEFAULTS, ...options }

		// const input = document.createElement('input')
		// input.classList.add('gui-number-input')
		const input = create<HTMLInputElement>('input', {
			classes: ['gui-number-input'],
			parent: this.container,
			type: 'number',
			min: String(min),
			max: String(max),
			step: String(step),
			value: String(this.state.value),
		})

		this.element = input as unknown as ET
		this.#log.fn('number').info(this.element)

		return this
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
}
