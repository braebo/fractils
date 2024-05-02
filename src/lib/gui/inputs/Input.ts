import type { InputButton, ButtonInputOptions, ButtonClickFunction } from './InputButton'
import type { InputButtonGrid, ButtonGridInputOptions } from './InputButtonGrid'
import type { InputTextArea, TextAreaInputOptions } from './InputTextArea'
import type { InputSwitch, SwitchInputOptions } from './InputSwitch'
import type { InputSelect, SelectInputOptions } from './InputSelect'
import type { InputNumber, NumberInputOptions } from './InputNumber'
import type { ColorInputOptions, InputColor } from './InputColor'
import type { InputText, TextInputOptions } from './InputText'
import type { Commit } from '../../utils/undoManager'

import type { ColorFormat } from '../../color/types/colorFormat'
import type { Option } from '../controllers/Select'
import type { State } from '../../utils/state'
import type { Color } from '../../color/color'
import type { Folder } from '../Folder'

import { EventManager } from '../../utils/EventManager'
import { create } from '../../utils/create'
import { Logger } from '../../utils/logger'
import { keys } from '../../utils/object'
import { toFn } from '../shared/toFn'

//· Types ··············································································¬
export type InputType = (typeof INPUT_TYPES)[number]

export const INPUT_TYPE_MAP = Object.freeze({
	Text: 'Text',
	TextArea: 'TextArea',
	Number: 'Number',
	Color: 'Color',
	Select: 'Select',
	Button: 'Button',
	ButtonGrid: 'ButtonGrid',
	Switch: 'Switch',
})

export const INPUT_TYPES = Object.freeze(keys(INPUT_TYPE_MAP))

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
			// grid: ButtonGrid
	  }

export type InputOptions<
	TValue = ValidInputValue,
	TBindTarget extends BindTarget = Record<string, any & TValue>,
> = {
	/**
	 * The type of input.
	 */
	type?: InputType
	/**
	 * The title displayed to the left of the input.
	 */
	title: string
	/**
	 * If provided, will be used as the key for the input's value in a preset.
	 * @defaultValue `<folder_title>:<input_type>:<input_title>`
	 */
	presetId?: string
	/**
	 * Whether the inputs are disabled.  A function can be
	 * used to dynamically determine the disabled state.
	 * @default false
	 */
	disabled?: boolean
	/**
	 * Whether the input is hidden. A function can be
	 * used to dynamically determine the hidden state.
	 * @default false
	 */
	hidden?: boolean
	onChange?: (value: TValue) => void
} & ValueOrBinding<TValue, TBindTarget>

export type InputPreset<T extends ValidInputOptions> = Omit<InputOptions<T>, 'title'> & {
	type: InputType
	presetId: string
	value: ValidInputValue
	disabled: boolean
	hidden: boolean
}

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

export type InputEvents = 'change' | 'refresh' | string
//⌟

export abstract class Input<
	TValueType extends ValidInputValue = ValidInputValue,
	TOptions extends ValidInputOptions = InputOptions,
	TElements extends ElementMap = ElementMap,
	TEvents extends InputEvents = InputEvents,
> {
	abstract state: State<TValueType>
	abstract initialValue: ValidInputValue
	// declare events: TEvents

	readonly type: InputType
	opts: TOptions
	presetId: string
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
		resetBtn: HTMLElement
	}

	#title = ''
	#dirty = false
	// #firstUpdate = true
	#disabled: () => boolean
	#hidden: () => boolean
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
	protected evm = new EventManager<InputEvents | TEvents>(['change', 'refresh'])

	constructor(
		options: TOptions & { type: InputType },
		public folder: Folder,
	) {
		this.opts = options
		this.type = options.type
		this.presetId =
			options.presetId ?? `${folder.resolvePresetId()}_${options.type}:${options.title}`

		this.log = new Logger('Input:' + options.title, { fg: 'skyblue' })

		this.#title = options.title
		this.#disabled = toFn(options.disabled ?? false)
		this.#hidden = toFn(options.hidden ?? false)

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

		this.elements.resetBtn = create('div', {
			classes: ['fracgui-input-reset-btn'],
			parent: this.elements.content,
			tooltip: {
				text: 'Reset',
				placement: 'left',
				delay: 1000,
			},
			onclick: () => {
				this.set(this.initialValue as TValueType)
			},
		})

		this.elements.drawer = create('div', {
			classes: ['fracgui-input-drawer'],
			parent: this.elements.content,
		})

		// this.evm.registerEvents()

		this.evm.listen(this.elements.drawerToggle, 'click', () => {
			console.warn('todo')
		})

		if ('onChange' in options) {
			this.evm.on('change', options.onChange as (value: TValueType) => void)
		}

		// this.#log.groupCollapsed().fn('constructor').info({ opts: options, this: this })
	}

	get value() {
		return this.state.value as TValueType
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

	get hidden(): boolean {
		return this.elements.container.classList.contains('hidden')
	}
	set hidden(v: boolean | (() => boolean)) {
		this.#hidden = toFn(v)
		this.elements.container.classList.toggle('hidden', this.#hidden())
	}

	get dirty() {
		return this.#dirty
	}
	set dirty(v: boolean) {
		this.#dirty = v
		this.elements.resetBtn.classList.toggle('dirty', v)
	}

	abstract set(v: TValueType): void

	/**
	 * Called from subclasses at the end of their `set` method to emit the `change` event.
	 */
	_emit(event: TEvents, v = this.state.value as TValueType) {
		this.dirty = this.state.value != this.initialValue
		this.evm.emit(event, { value: v, input: this })
		if (event === 'change') this.folder.evm.emit('change', { value: v, input: this })
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
		commit.from = this.state.value
		if (this.undoLock) return
		this.undoManager.commit<TValueType>({
			input: this,
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

	// /**
	//  * Refreshes the value of any controllers to match the current input state.
	//  *! todo - This is wrong!! It should likely be abstract now...
	//  */
	refresh(v = this.state.value as TValueType) {
		this.evm.emit('refresh', { value: v, input: this })

		return this
	}

	// todo - Make `state` private (#) and enforce using `Input.value` and `Input.update` to make sure out `callOnChange` is called by subclasses?
	// todo - Or maybe just call `onChange` in `_afterSet`?

	// /**
	//  * Updates the input state and calls the `state.refresh` method.
	//  */
	// protected update(v: (currentValue: TValueType) => TValueType) {
	// 	const newValue = v(this.state.value as TValueType)
	// 	this.state.set(newValue as ValidInputValue)
	// 	this.state.refresh()
	// 	// this.callOnChange(newValue)
	// 	this.evm.emit('change', v, this)
	// }

	listen = this.evm.listen
	on = this.evm.on

	// protected onChangeListeners = new Set<(newValue: TValueType, input: Input) => unknown>()
	// protected callOnChange(v = this.state.value) {
	// 	if (this.#firstUpdate) {
	// 		this.#firstUpdate = false
	// 		this.log
	// 			.fn('callOnChange')
	// 			.debug('Skipping initial update (subscribers will not be notified).')
	// 		return
	// 	}
	// }

	save() {
		const preset: InputPreset<any> = {
			type: this.type,
			value: this.state.value,
			disabled: this.disabled,
			presetId: this.presetId,
			hidden: this.hidden,
		}

		this.log.fn('save').debug(preset)

		return preset
	}

	load(json: InputPreset<TOptions> | string) {
		const data = typeof json === 'string' ? (JSON.parse(json) as InputPreset<TOptions>) : json
		this.presetId = data.presetId
		this.disabled = data.disabled
		this.hidden = data.hidden
		this.set(data.value as TValueType)
	}

	dispose() {
		this.log.fn('dispose').debug(this)
		this.evm.dispose()

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
