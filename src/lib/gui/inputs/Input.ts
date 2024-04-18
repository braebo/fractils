import type { InputButtonGrid, ButtonGridInputOptions, ButtonGrid } from './InputButtonGrid'
import type { InputButton, InputButtonOptions, ButtonClickFunction } from './InputButton'
import type { InputSelect, SelectInputOptions } from './InputSelect'
import type { InputNumber, NumberInputOptions } from './InputNumber'
import type { ColorInputOptions, InputColor } from './InputColor'
import type { ColorFormat } from '../../color/types/colorFormat'

import type { InputTextArea, TextAreaInputOptions } from './InputTextArea'
import type { InputText, TextInputOptions } from './InputText'
import type { Option } from '../controllers/Select'
import type { State } from '../../utils/state'
import type { Color } from '../../color/color'
import type { Folder } from '../Folder'

import { EventManager } from '$lib/utils/EventManager'
import { debrief } from '$lib/utils/debrief'
import { create } from '../../utils/create'
import { Logger } from '../../utils/logger'

//· Types ··············································································¬

export type InputType = (typeof INPUT_TYPES)[number]
export const INPUT_TYPES = [
	'Text',
	'TextArea',
	'Number',
	'Color',
	'Select',
	'Button',
	'ButtonGrid',
] as const

export type BindTarget = Record<string, any>
export type BindableObject<T extends BindTarget, K extends keyof T = keyof T> = {
	target: T
	key: K
	initial?: T[K]
}

/**
 * The initial value of an input can be either a raw value, or a "binding"
 */
export type ValueOrBinding<TValue = ValidInputValue, TBindTarget extends BindTarget = BindTarget> =
	| {
			value: TValue
			binding?: BindableObject<TBindTarget>
	  }
	| {
			value?: TValue
			binding: { target: TBindTarget; key: keyof TBindTarget; initial?: TValue }
	  }
	| {
			value?: TValue
			binding?: { target: TBindTarget; key: keyof TBindTarget; initial?: TValue }
			onClick: ButtonClickFunction
	  }
	| {
			value?: TValue
			binding?: { target: TBindTarget; key: keyof TBindTarget; initial?: TValue }
			onClick?: ButtonClickFunction
			grid: ButtonGrid
	  }

export type InputOptions<
	TValue = ValidInputValue,
	TBindTarget extends BindTarget = Record<string, any & TValue>,
> = {
	title: string
	onChange?: (value: TValue) => void
} & ValueOrBinding<TValue, TBindTarget>

export interface ElementMap<T = unknown> {
	[key: string]: HTMLElement | HTMLInputElement | ElementMap | T
}

export type ValidInputValue = string | number | Color | ColorFormat | Option<any>
export type ValidInputOptions =
	| TextInputOptions
	| TextAreaInputOptions
	| NumberInputOptions
	| ColorInputOptions
	| SelectInputOptions<Option<any>>
	| InputButtonOptions
	| ButtonGridInputOptions

export type ValidInput =
	| InputText
	| InputTextArea
	| InputNumber
	| InputColor
	| InputSelect<Option<any>>
	| InputButton
	| InputButtonGrid
//⌟

export abstract class Input<
	TValueType extends ValidInputValue = ValidInputValue,
	TOptions extends InputOptions = InputOptions,
	TElements extends ElementMap = ElementMap,
> {
	declare type: Readonly<InputType>
	declare state: State<TValueType>
	declare initialValue: ValidInputValue
	declare opts: ValidInputOptions

	/**
	 * Whether the input was initialized with a bind target/key.
	 * @default false
	 */
	bound = false

	/**
	 * Whether all user input controllers are disabled.
	 * Use {@link enable} and {@link disable} to toggle.
	 * @default false
	 */
	disabled = false
	elements = {
		controllers: {},
	} as {
		container: HTMLElement
		title: HTMLElement
		content: HTMLElement
		drawer: HTMLElement
		drawerToggle: HTMLElement
		controllers: TElements
	}

	#title = ''
	#firstUpdate = true

	/**
	 * A set of callbacks to be called when {@link Input.dispose} is called.
	 * @internal
	 * @private
	 */
	disposeCallbacks = new Set<() => void>()

	#log: Logger
	#evm = new EventManager()

	constructor(
		options: TOptions,
		public folder: Folder,
	) {
		this.#title = options.title
		this.#log = new Logger('Input:' + this.#title, { fg: 'skyblue' })

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

		this.#evm.listen(this.elements.drawerToggle, 'click', () => {})

		if (options.onChange) {
			this.onChange(options.onChange)
		}

		// this.#log.groupCollapsed().fn('constructor').info({ opts: options, this: this })
	}

	get value() {
		return this.state.value
	}

	get title() {
		return this.#title
	}
	set title(v: string) {
		this.#title = v
		this.elements.title.textContent = v
	}

	// todo - idr how this went, but should these be implemented here like in the `Controller` class
	// todo - (as long as consumers don't forget to call super...)
	abstract enable(): this
	abstract disable(): this

	/**
	 * Refreshes the value of any controllers to match the current input state.
	 * @todo - this is wrong -- it should likely be abstract now.
	 */
	refresh(..._args: any[]) {
		this.callOnChange()
		return this
	}

	/**
	 * Updates the input state and calls the `state.refresh` method.
	 */
	update(v: (currentValue: TValueType) => TValueType) {
		const newValue = v(this.state.value as TValueType)
		this.state.set(newValue as ValidInputValue)
		this.state.refresh()
		this.callOnChange(newValue)
	}

	listen = this.#evm.listen

	#onChangeListeners = new Set<(newValue: TValueType, input: Input) => unknown>()
	onChange(cb: (newValue: TValueType, input: Input) => unknown) {
		this.#onChangeListeners.add(cb)
		return () => {
			this.#onChangeListeners.delete(cb)
		}
	}
	callOnChange(v = this.state.value) {
		if (this.#firstUpdate) {
			this.#firstUpdate = false
			this.#log
				.fn('callOnChange')
				.debug('Skipping initial update (subscribers will not be notified).')
			return
		}
		this.#log.fn('callOnChange', debrief(v, { depth: 1, siblings: 3 })).debug()
		for (const cb of this.#onChangeListeners) {
			cb(v as TValueType, this)
		}
	}

	dispose() {
		this.#log.fn('dispose').info(this)
		for (const listener of this.disposeCallbacks) {
			listener()
		}
	}
}
