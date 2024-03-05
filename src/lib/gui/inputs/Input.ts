import type { NumberInputOptions } from './InputNumber'
import type { State } from '../../utils/state'
import type { Folder } from '../Folder'

import { create } from '../../utils/create'
import { Logger } from '../../utils/logger'

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

export interface ElementMap<T = unknown> {
	[key: string]: HTMLElement | HTMLInputElement | ElementMap | T
}

export abstract class Input<
	TValueType extends unknown = any,
	TOptions extends InputOptions = InputOptions,
	TControllers extends ElementMap = ElementMap,
> {
	declare state: State<TValueType>
	declare initialValue: TValueType
	declare opts: TOptions

	view: InputView

	elements = {
		controllers: {},
	} as {
		container: HTMLElement
		title: HTMLElement
		content: HTMLElement
		drawer: HTMLElement
		drawerToggle: HTMLElement
		controllers: TControllers
	}

	#title = ''

	/**
	 * A set of callbacks to be called when {@link Input.dispose} is called.
	 * @internal
	 * @private
	 */
	disposeCallbacks = new Set<() => void>()

	#log = new Logger('Input', { fg: 'cyan' })

	constructor(
		options: TOptions,
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

	updateState = (v: TValueType | Event) => {
		this.callOnChange()
	}

	get title() {
		return this.#title
	}
	set title(v: string) {
		this.#title = v
		this.elements.title.textContent = v
	}

	#onChangeListeners = new Set<(v: TValueType) => void>()
	onChange(cb: (v: TValueType) => void) {
		this.#onChangeListeners.add(cb)
		return () => {
			this.#onChangeListeners.delete(cb)
		}
	}
	callOnChange() {
		for (const cb of this.#onChangeListeners) {
			cb(this.state.value as TValueType)
		}
	}

	listen = (
		element: HTMLElement | Window,
		event: string,
		cb: (e: any) => void,
		options?: AddEventListenerOptions,
	) => {
		element.addEventListener(event, cb, options)
		this.disposeCallbacks.add(() => {
			element.removeEventListener(event, cb, options)
		})
	}

	dispose() {
		this.#log.fn('dispose').info(this)
		for (const listener of this.disposeCallbacks) {
			listener()
		}
	}
}
