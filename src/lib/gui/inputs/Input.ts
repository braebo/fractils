import type { InputNumber, NumberInputOptions } from './InputNumber'
import type { ColorInputOptions, InputColor } from './InputColor'
import type { ColorFormat } from '../../color/types/colorFormat'
import type { PrimitiveState, State } from '../../utils/state'
import type { Color } from '../../color/color'
import type { Folder } from '../Folder'

import { create } from '../../utils/create'
import { Logger } from '../../utils/logger'

//· Types ··············································································¬

// Only Number and Color are implemented, but the rest are here for future reference.

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
	value: number | Color | ColorFormat
	binding?: {
		target: T
		key: keyof T
	}
}
//⌟

export interface ElementMap<T = unknown> {
	[key: string]: HTMLElement | HTMLInputElement | ElementMap | T
}

//- WIP
type InputStatePrimitive = InputNumber['state'] | InputColor['state']
type ExtractPrimitive<T> = T extends PrimitiveState<infer U> ? U : never
export type InputState = ExtractPrimitive<InputStatePrimitive>
export type ValidInputs = InputNumber | InputColor

export abstract class Input<
	TValueType extends InputState = InputState,
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
			classes: ['fracgui-input-container'],
			parent: this.folder.elements.content,
		})

		this.elements.drawerToggle = create('div', {
			classes: ['fracgui-input-drawer-toggle'],
			parent: this.elements.container,
		})

		this.elements.title = create('div', {
			classes: ['fracgui-input-title'],
			parent: this.elements.container,
			textContent: this.title,
		})

		this.elements.content = create('div', {
			classes: ['fracgui-input-content'],
			parent: this.elements.container,
		})

		this.elements.drawer = create('div', {
			classes: ['fracgui-input-drawer'],
			parent: this.elements.content,
		})

		this.listen(this.elements.drawerToggle, 'click', () => {})

		this.#log.groupCollapsed().fn('constructor').info({ opts: options, this: this })
	}

	get value() {
		return this.state.value
	}

	/**
	 * Refreshes the value of any controllers to match the current input state.
	 */
	refresh = (..._args: any[]) => {
		this.callOnChange()
	}

	/**
	 * Updates the input state and calls the `refresh` method.
	 */
	update = (v: (currentValue: TValueType) => TValueType) => {
		const newValue = v(this.state.value as TValueType)
		// @ts-expect-error //! Lord help me.
		this.state.set(newValue)
		this.state.refresh()
		this.callOnChange(newValue)
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
	callOnChange(v = this.state.value) {
		for (const cb of this.#onChangeListeners) {
			// todo - Shouldn't need to assert here.
			cb(v as TValueType)
		}
	}

	listen = (
		element: HTMLElement | Window | Document,
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
