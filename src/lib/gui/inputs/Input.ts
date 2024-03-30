import type { InputNumber, NumberInputOptions } from './InputNumber'
import type { ColorInputOptions, InputColor } from './InputColor'
import type { ColorFormat } from '../../color/types/colorFormat'
import type { State } from '../../utils/state'
import type { Color } from '../../color/color'
import type { InputSelect, SelectInputOptions } from './InputSelect'
import type { Folder } from '../Folder'

import { create } from '../../utils/create'
import { Logger } from '../../utils/logger'
import type { Option } from '../controllers/Select'
import { debrief } from '$lib/utils/debrief'

//· Types ··············································································¬

export type ValidInputValue = number | Color | ColorFormat | Option<any>
export type ValidInputOptions =
	| NumberInputOptions
	| ColorInputOptions
	| SelectInputOptions<Option<any>>
export type BindTargetObject = Record<string, any>

/** This is currently just used as a sort of "type tag" now that inference is working. */

export type InputType = 'Number' | 'Color' | 'Select'

export type ValueOrBinding<TValue = ValidInputValue, TBindTarget = BindTargetObject> =
	| { value: TValue; binding?: { target: TBindTarget; key: keyof TBindTarget } | undefined }
	| { value?: TValue | undefined; binding: { target: TBindTarget; key: keyof TBindTarget } }

export type InputOptions<TValue = ValidInputValue, TBindTarget = Record<string, any & TValue>> = {
	title: string
	onChange?: (value: TValue) => void
} & ValueOrBinding<TValue, TBindTarget>
//⌟

export interface ElementMap<T = unknown> {
	[key: string]: HTMLElement | HTMLInputElement | ElementMap | T
}

export type ValidInput = InputNumber | InputColor | InputSelect<Option<any>>

export abstract class Input<
	TValueType extends ValidInputValue = ValidInputValue,
	TOptions extends InputOptions = InputOptions,
	TElements extends ElementMap = ElementMap,
> {
	declare type: Readonly<string>
	declare state: State<TValueType>
	declare initialValue: ValidInputValue
	declare opts: ValidInputOptions

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

		this.listen(this.elements.drawerToggle, 'click', () => {})

		if (options.onChange) {
			this.onChange(options.onChange)
		}

		// this.#log.groupCollapsed().fn('constructor').info({ opts: options, this: this })
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

	// todo - can we just extend `controller` to minimize the enable/disable boilerplate in every input?
	// get disabled(): boolean {
	// 	return this.#disabled()
	// }
	// set disabled(v: boolean | (() => boolean)) {
	// 	this.#disabled = toFn(v)
	// 	this.#disabled() ? this.disable() : this.enable()
	// }

	// enable() {
	// 	this.#disabled = toFn(false)
	// }
	// disable() {
	// 	this.#disabled = toFn(true)
	// }

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
			// todo - Shouldn't need to assert here.
			cb(v as TValueType, this)
			// cb.bind(this).call(this, v as TValueType)
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
