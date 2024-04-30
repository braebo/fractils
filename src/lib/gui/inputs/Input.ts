import type { InputButtonGrid, ButtonGridInputOptions, ButtonGrid } from './InputButtonGrid'
import type { InputButton, ButtonInputOptions, ButtonClickFunction } from './InputButton'
import type { InputTextArea, TextAreaInputOptions } from './InputTextArea'
import type { InputSwitch, SwitchInputOptions } from './InputSwitch'
import type { InputSelect, SelectInputOptions } from './InputSelect'
import type { InputNumber, NumberInputOptions } from './InputNumber'
import type { ColorInputOptions, InputColor } from './InputColor'
import type { InputText, TextInputOptions } from './InputText'

import type { ColorFormat } from '../../color/types/colorFormat'
import type { Option } from '../controllers/Select'
import type { State } from '../../utils/state'
import type { Color } from '../../color/color'
import type { Folder } from '../Folder'

import { EventManager } from '$lib/utils/EventManager'
import { debrief } from '$lib/utils/debrief'
import { create } from '../../utils/create'
import { Logger } from '../../utils/logger'
import { toFn } from '../shared/toFn'

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
	'Switch',
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
	/**
	 * The title displayed to the left of the input.
	 */
	title: string
	/**
	 * Whether the inputs are disabled.  A function can be
	 * used to dynamically determine the disabled state.
	 * @default false
	 */
	disabled?: boolean
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
	| ButtonInputOptions
	| ButtonGridInputOptions
	| SwitchInputOptions

export type ValidInput =
	| InputText
	| InputTextArea
	| InputNumber
	| InputColor
	| InputSelect<Option<any>>
	| InputButton
	| InputButtonGrid
	| InputSwitch
//⌟

export abstract class Input<
	TValueType extends ValidInputValue = ValidInputValue,
	TOptions extends ValidInputOptions = InputOptions,
	TElements extends ElementMap = ElementMap,
> {
	declare type: Readonly<InputType>
	declare state: State<TValueType>
	declare initialValue: ValidInputValue
	// declare opts: ValidInputOptions
	declare opts: TOptions

	/**
	 * Whether the input was initialized with a bind target/key.
	 * @default false
	 */
	bound = false

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
	#disabled: () => boolean
	/**
	 * Prevents the input from registering commits to undo history until
	 * {@link unlock} is called.
	 */
	protected undoLock = false
	/**
	 * The commit object used to store the initial value of the input when
	 * {@link lock} is called.
	 */
	protected lockCommit = {} as Commit
	protected log: Logger
	protected evm = new EventManager()
	/**
	 * A set of callbacks to be called when {@link Input.dispose} is called.
	 * @internal
	 * @private
	 */
	protected disposeCallbacks = new Set<() => void>()

	constructor(
		options: TOptions,
		public folder: Folder,
	) {
		this.#title = options.title
		this.#disabled = toFn(options.disabled ?? false)
		this.log = new Logger('Input:' + this.#title, { fg: 'skyblue' })

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

		this.evm.listen(this.elements.drawerToggle, 'click', () => {})

		if ('onChange' in options) {
			this.onChange(options.onChange as (value: TValueType) => void)
		}

		// this.#log.groupCollapsed().fn('constructor').info({ opts: options, this: this })
	}

	get value() {
		return this.state.value
	}

	get undoManager() {
		return this.folder.root.undoManager
	}

	get title() {
		return this.#title
	}
	set title(v: string) {
		this.#title = v
		this.elements.title.textContent = v
	}

	/**
	 * Whether the input is disabled.  A function can be used to
	 * dynamically determine the disabled state.
	 */
	get disabled(): boolean {
		return this.#disabled()
	}
	set disabled(v: boolean | (() => boolean)) {
		this.#disabled = toFn(v)
		this.#disabled() ? this.disable() : this.enable()
	}

	abstract set(v: TValueType): void

	protected _afterSet() {
		this.dirty = this.state.value != this.initialValue
	}

	/**
	 * Prevents the input from registering undo history, storing the initial
	 * for the eventual commit in {@link unlock}.
	 */
	protected lock(from = this.state.value) {
		this.undoLock = true
		this.lockCommit.from = from
	}
	/**
	 * Unlocks commits and saves the current commit stored in lock.
	 */
	protected unlock(commit?: Partial<Commit>) {
		commit ??= {}
		commit.input ??= this
		commit.to ??= this.state.value as TValueType
		commit.from ??= this.lockCommit.from
		this.undoLock = false
		this.commit(commit)
	}

	commit(commit: Partial<Commit>) {
		commit.from = this.state.value as TValueType
		if (this.undoLock) return
		this.undoManager.commit<TValueType>({
			input: this as Input<TValueType>,
			...commit,
		} as Commit)
	}

	enable() {
		this.#disabled = toFn(false)
		return this
	}
	disable() {
		this.#disabled = toFn(true)
		return this
	}

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
	protected update(v: (currentValue: TValueType) => TValueType) {
		const newValue = v(this.state.value as TValueType)
		this.state.set(newValue as ValidInputValue)
		this.state.refresh()
		this.callOnChange(newValue)
	}

	protected listen = this.evm.listen

	protected onChangeListeners = new Set<(newValue: TValueType, input: Input) => unknown>()
	onChange(cb: (newValue: TValueType, input: Input) => unknown) {
		this.onChangeListeners.add(cb)
		return () => {
			this.onChangeListeners.delete(cb)
		}
	}
	protected callOnChange(v = this.state.value) {
		if (this.#firstUpdate) {
			this.#firstUpdate = false
			this.log
				.fn('callOnChange')
				.debug('Skipping initial update (subscribers will not be notified).')
			return
		}
		this.log.fn('callOnChange', debrief(v, { depth: 1, siblings: 3 })).debug()
		for (const cb of this.onChangeListeners) {
			cb(v as TValueType, this)
		}
	}

	dispose() {
		this.log.fn('dispose').info(this)
		for (const listener of this.disposeCallbacks) {
			listener()
		}

		const rm = (elOrObj: any) => {
			if (elOrObj instanceof HTMLElement) {
				elOrObj.remove()
			} else if (typeof elOrObj === 'object') {
				for (const k in elOrObj) {
					rm(elOrObj[k])
				}
			}
		}
		rm(this.elements)
	}
}
