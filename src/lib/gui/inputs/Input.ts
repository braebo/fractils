import type { State } from '../../utils/state'
import type { Folder } from '../Folder'

import { numberController, numberControllerButtons, rangeController } from '../controllers/number'
import { create } from '../../utils/create'
import { Logger } from '../../utils/logger'
import { state } from '../../utils/state'

//· Types ··············································································¬

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
//⌟

export interface ElementMap {
	[key: string]: HTMLElement | HTMLInputElement | ElementMap
}

export abstract class Input<
	T = unknown,
	O extends InputOptions = InputOptions,
	C extends ElementMap = ElementMap,
> {
	declare state: State<T>
	declare initialValue: T
	declare opts: O

	view: InputView

	elements = {} as {
		container: HTMLElement
		title: HTMLElement
		content: HTMLElement
		drawer: HTMLElement
		drawerToggle: HTMLElement
		controller: C
	}

	#title = ''
	get title() {
		return this.#title
	}
	set title(v: string) {
		this.#title = v
		this.elements.title.textContent = v
	}

	/**
	 * A set of callbacks to be called when {@link Input.dispose} is called.
	 * @internal
	 */
	disposeCallbacks = new Set<() => void>()

	#log = new Logger('Input', { fg: 'cyan' })

	constructor(
		options: O,
		public folder: Folder,
	) {
		this.#title = options.title
		this.view = options.view

		this.elements.container = create('div', {
			classes: ['gui-input-container'],
			parent: this.folder.elements.content,
		})

		this.elements.drawerToggle = create('div', {
			classes: ['gui-input-drawer-toggle'],
			parent: this.elements.container,
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

		this.elements.drawer = create('div', {
			classes: ['gui-input-drawer'],
			parent: this.elements.content,
		})

		this.listen(this.elements.drawerToggle, 'click', () => {})

		this.#log.groupCollapsed().fn('constructor').info({ opts: options, this: this })
	}

	abstract updateState: (v: T | Event) => void

	#onChangeListeners = new Set<(v: T) => void>()
	onChange(cb: (v: T) => void) {
		this.#onChangeListeners.add(cb)
		return () => {
			this.#onChangeListeners.delete(cb)
		}
	}
	callOnChange() {
		for (const cb of this.#onChangeListeners) {
			cb(this.state.value as T)
		}
	}

	listen = (element: HTMLElement, event: string, cb: (e: Event) => void) => {
		element.addEventListener(event, cb)
		this.disposeCallbacks.add(() => {
			element.removeEventListener(event, cb)
		})
	}

	dispose() {
		this.#log.fn('dispose').info(this)
		for (const listener of this.disposeCallbacks) {
			listener()
		}
	}
}

//· InputSlider ···································································¬

export interface NumberInputOptions extends InputOptions {
	value: number
	min: number
	max: number
	step: number
}

const NUMBER_INPUT_DEFAULTS: NumberInputOptions = {
	view: 'Slider',
	title: 'Number',
	value: 0.5,
	min: 0,
	max: 1,
	step: 0.01,
} as const

export class InputSlider extends Input<number, NumberInputOptions, NumberControllerElements> {
	state: State<number>
	initialValue: number
	opts: NumberInputOptions

	#log = new Logger('InputSlider', { fg: 'cyan' })

	#onChangeListeners = new Set<(v: number) => void>()
	onChange(cb: (v: number) => void) {
		this.#onChangeListeners.add(cb)
		return () => {
			this.#onChangeListeners.delete(cb)
		}
	}

	constructor(options: Partial<NumberInputOptions>, folder: Folder) {
		const opts = { ...NUMBER_INPUT_DEFAULTS, ...options }
		super(opts, folder)

		this.opts = opts
		//* this is bop it type beat but is cool - brb fire alarm
		this.#log.fn('constructor').info({ opts, this: this }).groupEnd()

		if (opts.binding) {
			this.initialValue = opts.binding.target[opts.binding.key]
			this.state = state(this.initialValue)
			this.disposeCallbacks.add(
				this.state.subscribe((v) => {
					opts.binding!.target[opts.binding!.key] = v
				}),
			)
		} else {
			this.initialValue = opts.value
			this.state = state(opts.value)
		}

		this.elements.controller = numberControllers(this, opts)

		// todo this isn't being set because of a reason I can't work out, using declare is church bcuz ts has no red squiggles but there are runtime errors so rekt I guess idk lol
		// this.listen(this.elements.controller.range, 'input', this.updateState)
		this.listen(this.elements.controller.range, 'input', this.updateState)

		this.disposeCallbacks.add(
			this.state.subscribe((v) => {
				this.elements.controller.range.value = String(v)
				this.elements.controller.input.value = String(v)

				for (const cb of this.#onChangeListeners) {
					cb(v)
				}
			}),
		)
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

	dispose() {
		super.dispose()
	}
}

export interface NumberControllerElements extends ElementMap {
	container: HTMLElement
	buttons: {
		container: HTMLDivElement
		increment: HTMLDivElement
		decrement: HTMLDivElement
	}
	input: HTMLInputElement
	range: HTMLInputElement
}

export function numberControllers(input: InputSlider, opts: NumberInputOptions) {
	const container = create('div', {
		classes: ['gui-input-number-container'],
		parent: input.elements.content,
	})

	//· Number Input ·······························································¬

	const numberInputController = numberController(input, opts, container)
	//⌟

	//· Number Buttons ·····························································¬
	const numberButtonsController = numberControllerButtons(input, opts, container)
	//⌟

	//· Range Input ································································¬

	const numberRangeController = rangeController(input, opts, container)
	//⌟

	return {
		container,
		buttons: numberButtonsController,
		input: numberInputController,
		range: numberRangeController,
	} as const satisfies NumberControllerElements
}

//⌟
