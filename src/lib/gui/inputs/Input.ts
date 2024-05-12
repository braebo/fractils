import type { InputButtonGrid, ButtonGridInputOptions } from './InputButtonGrid'
import type { InputTextArea, TextAreaInputOptions } from './InputTextArea'
import type { InputButton, ButtonInputOptions } from './InputButton'
import type { InputSwitch, SwitchInputOptions } from './InputSwitch'
import type { InputSelect, SelectInputOptions } from './InputSelect'
import type { InputNumber, NumberInputOptions } from './InputNumber'
import type { InputColor, ColorInputOptions } from './InputColor'
import type { InputText, TextInputOptions } from './InputText'

import type { ColorFormat } from '../../color/types/colorFormat'
import type { EventCallback } from '../../utils/EventManager'
import type { Commit } from '../../utils/undoManager'
import type { Option } from '../controllers/Select'
import type { State } from '../../utils/state'
import type { Color } from '../../color/color'
import type { Folder } from '../Folder'

import { EventManager } from '../../utils/EventManager'
import { isState, state } from '../../utils/state'
import { keys, values } from '../../utils/object'
import { create } from '../../utils/create'
import { Logger } from '../../utils/logger'
import { toFn } from '../shared/toFn'

//· Types ··············································································¬
export type InputType = (typeof INPUT_TYPES)[number]
export type InputOptionType = (typeof INPUT_OPTION_TYPES)[number]

export const INPUT_TYPE_MAP = Object.freeze({
	InputText: 'TextInputOptions',
	InputTextArea: 'TextAreaInputOptions',
	InputNumber: 'NumberInputOptions',
	InputColor: 'ColorInputOptions',
	InputSelect: 'SelectInputOptions',
	InputButton: 'ButtonInputOptions',
	InputButtonGrid: 'ButtonGridInputOptions',
	InputSwitch: 'SwitchInputOptions',
})

export const INPUT_TYPES = Object.freeze(keys(INPUT_TYPE_MAP))
export const INPUT_OPTION_TYPES = Object.freeze(values(INPUT_TYPE_MAP))

export type BindTarget = Record<any, any>
export type BindableObject<T extends BindTarget, K extends keyof T = keyof T> = {
	target: T
	key: K
	initial?: T[K]
}

/**
 * The initial value of an input can be either a raw value, or a "binding"
 */
export type ValueOrBinding<TValue = ValidInputValue, TBindTarget extends BindTarget = BindTarget> =
	// todo - this is silly
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
	  }
	| {
			value: TValue
			binding?: { target: TBindTarget; key: keyof TBindTarget; initial?: TValue }
	  }

export type InputOptions<
	TValue = ValidInputValue,
	TBindTarget extends BindTarget = Record<any, any & TValue>,
> = {
	/**
	 * The title displayed to the left of the input.
	 */
	title?: string
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
	__type: InputOptionType
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

export type InputEvents<T extends ValidInputValue = ValidInputValue> = {
	/**
	 * Called when the input's value changes, providing the new value.
	 */
	readonly change: T
	/**
	 * Called when a input's controllers are refreshed, providing the current value of the input.
	 */
	readonly refresh: T
}
//⌟

export type MapInputToOptions<T extends InputType = InputType> = (typeof INPUT_TYPE_MAP)[T]
export type MapOptionsToInput<T extends InputOptionType = InputOptionType> = {
	[K in keyof typeof INPUT_TYPE_MAP]: (typeof INPUT_TYPE_MAP)[K] extends T ? K : never
}[keyof typeof INPUT_TYPE_MAP]

export abstract class Input<
	TValueType extends ValidInputValue = ValidInputValue,
	TOptions extends ValidInputOptions = InputOptions,
	TElements extends ElementMap = ElementMap,
	TEvents extends InputEvents = InputEvents<TValueType>,
	TType extends InputType = InputType,
	T__TYPE = (typeof INPUT_TYPE_MAP)[TType],
> {
	abstract readonly __type: TType
	abstract state: State<TValueType>
	abstract readonly initialValue: ValidInputValue

	opts: TOptions & { __type: T__TYPE }
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

	// #firstUpdate = true
	private _disabled: () => boolean
	private _hidden: () => boolean
	/**
	 * Prevents the input from registering commits to undo history until
	 * {@link unlock} is called.
	 */
	private undoLock = false
	/**
	 * The commit object used to store the initial value of the input when
	 * {@link lock} is called.
	 */
	private lockCommit = {} as Commit
	protected evm = new EventManager<TEvents>(['change', 'refresh'])

	private _title = ''
	private _dirty = false
	private _log: Logger

	constructor(
		options: TOptions & { __type: T__TYPE },
		public folder: Folder,
	) {
		this.opts = options
		// this.__type = options.__type
		this.presetId =
			options.presetId ?? `${folder.resolvePresetId()}_${options.__type}:${options.title}`

		this._log = new Logger(`Input ${options.title}`, { fg: 'skyblue' })

		this._title = options.title ?? ''
		this._disabled = toFn(options.disabled ?? false)
		this._hidden = toFn(options.hidden ?? false)

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
				this._log.fn('reset').info('resetting to initial value', this.initialValue)
				this.set(this.initialValue as TValueType)
			},
		})

		this.elements.drawer = create('div', {
			classes: ['fracgui-input-drawer'],
			parent: this.elements.content,
		})

		this.evm.listen(this.elements.drawerToggle, 'click', () => {
			console.warn('todo')
		})

		if ('onChange' in options) {
			this.evm.on('change', options.onChange as EventCallback<TEvents['change']>)
		}
	}

	get value() {
		return this.state.value as TValueType
	}

	get undoManager() {
		return this.folder.gui?.undoManager
	}

	get title() {
		return this._title
	}
	set title(v: string) {
		this._title = v
		this.elements.title.textContent = v
	}

	/**
	 * Whether the input is disabled.  A function can be used to
	 * dynamically determine the disabled state.
	 */
	get disabled(): boolean {
		return this._disabled()
	}
	set disabled(v: boolean | (() => boolean)) {
		this._disabled = toFn(v)
		this._disabled() ? this.disable() : this.enable()
	}

	get hidden(): boolean {
		return this.elements.container.classList.contains('hidden')
	}
	set hidden(v: boolean | (() => boolean)) {
		this._hidden = toFn(v)
		this.elements.container.classList.toggle('hidden', this._hidden())
	}

	get dirty() {
		return this._dirty
	}
	set dirty(v: boolean) {
		this._dirty = v
		this.elements.resetBtn.classList.toggle('dirty', v)
	}
	protected dirtyCheck() {
		return this.state.value !== this.initialValue
	}

	abstract set(v: TValueType): void

	protected resolveState<T = TValueType>(opts: TOptions): State<T> {
		if (opts.binding) {
			const s = state<T>(opts.binding.target[opts.binding.key])

			this.evm.add(
				s.subscribe(v => {
					opts.binding!.target[opts.binding!.key] = v
				}),
			)

			return s
		} else {
			// this.initialValue = opts.value!
			return state<T>(opts.value!)
		}
	}

	protected resolveInitialValue(opts: TOptions) {
		const value = opts.binding ? opts.binding.target[opts.binding.key] : opts.value!
		return isState(value) ? value.value : value
	}

	/**
	 * Called from subclasses at the end of their `set` method to emit the `change` event.
	 */
	_emit(event: keyof TEvents, v = this.state.value as TValueType) {
		this.dirty = this.dirtyCheck()
		// @ts-expect-error
		this.evm.emit(event, v)
		// @ts-expect-error
		if (event === 'change') this.folder.evm.emit('change', this)
	}

	/**
	 * Prevents the input from registering undo history, storing the initial
	 * for the eventual commit in {@link unlock}.
	 */
	protected lock = (from = this.state.value) => {
		this.undoLock = true
		this.lockCommit.from = from
		this._log.fn('lock').info('lockCommit:', this.lockCommit)
	}
	/**
	 * Unlocks commits and saves the current commit stored in lock.
	 */
	protected unlock = (commit?: Partial<Commit>) => {
		this._log.fn('unlock').debug('commit', { commit, lockCommit: this.lockCommit })
		commit ??= {}
		commit.input ??= this as unknown as Input<TValueType>
		commit.to ??= this.state.value as TValueType
		commit.from ??= this.lockCommit.from
		this.undoLock = false
		this.commit(commit)
	}

	/**
	 * Commits a change to the input's value to the undo manager.
	 */
	commit(commit: Partial<Commit>) {
		commit.from ??= this.state.value
		if (this.undoLock) {
			this._log.fn('commit').debug('prevented commit while locked')
			return
		}
		this._log.fn('commit').debug('commited', commit)
		this.undoManager?.commit<TValueType>({
			input: this,
			...commit,
		} as Commit)
	}

	/**
	 * Enables the input and any associated controllers.
	 */
	enable() {
		this._disabled = toFn(false)
		return this
	}
	/**
	 * Disables the input and any associated controllers. A disabled input's state can't be
	 * changed or interacted with.
	 */
	disable() {
		this._disabled = toFn(true)
		return this
	}

	/**
	 * Refreshes the value of any controllers to match the current input state.
	 */
	refresh(v = this.state.value as TValueType) {
		this.evm.emit('refresh', v as TValueType)

		return this
	}

	listen = this.evm.listen.bind(this.evm)
	on = this.evm.on.bind(this.evm)

	save(overrides: Partial<InputPreset<TOptions>> = {}) {
		const preset: InputPreset<any> = {
			__type: INPUT_TYPE_MAP[this.__type],
			value: this.state.value,
			disabled: this.disabled,
			presetId: this.presetId,
			hidden: this.hidden,
		}

		this._log.fn('save').debug(preset)

		return Object.assign(preset, overrides)
	}

	load(json: InputPreset<TOptions> | string) {
		const data = typeof json === 'string' ? (JSON.parse(json) as InputPreset<TOptions>) : json
		this.presetId = data.presetId
		this.disabled = data.disabled
		this.hidden = data.hidden
		this.set(data.value as TValueType)
	}

	dispose() {
		this._log.fn('dispose').debug(this)
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
