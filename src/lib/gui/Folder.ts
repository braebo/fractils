// The custom-regions extension is recommended for this file.

import type { Input, InputOptions, InputPreset, InputType, ValidInput } from './inputs/Input'
import type { ColorFormat } from '../color/types/colorFormat'
import type { Option } from './controllers/Select'
import type { Tooltip } from '../actions/tooltip'
import type { GuiPreset } from './Gui'

import { InputButtonGrid, type ButtonGridInputOptions } from './inputs/InputButtonGrid'
import { InputSwitch, type SwitchInputOptions } from './inputs/InputSwitch'
import { InputButton, type ButtonInputOptions } from './inputs/InputButton'
import { InputSelect, type SelectInputOptions } from './inputs/InputSelect'
import { InputNumber, type NumberInputOptions } from './inputs/InputNumber'
import { InputColor, type ColorInputOptions } from './inputs/InputColor'
import { InputText, type TextInputOptions } from './inputs/InputText'
import { isLabeledOption } from './controllers/Select'

import { animateConnector, createFolderConnector, createFolderSvg } from './svg/createFolderSVG'
import { composedPathContains } from '../internal/cancelClassFound'
import { isColor, isColorFormat } from '../color/color'
import { EventManager } from '../utils/EventManager'
import { TerminalSvg } from './svg/TerminalSvg'
import { Search } from './toolbar/Search'
import { create } from '../utils/create'
import { Logger } from '../utils/logger'
import { nanoid } from '../utils/nanoid'
import { state } from '../utils/state'
import { toFn } from '../utils/toFn'
import { DEV } from '../utils/env'
import { Gui } from './Gui'

//· Types ························································································¬

export type BindingFactory<
	TTarget extends Record<string, any>,
	TOptions extends InputOptions,
	TInput extends ValidInput,
	TTargetKey extends keyof TTarget,
> = (target: TTarget, key: TTargetKey, options: Partial<TOptions>) => TInput

export type InferOptions<T> = T extends number
	? NumberInputOptions
	: T extends boolean
		? SwitchInputOptions
		: T extends Array<infer T>
			? SelectInputOptions<T>
			: T extends Option<infer T>
				? SelectInputOptions<T>
				: T extends ColorFormat
					? ColorInputOptions
					: T extends string
						? TextInputOptions
						: InputOptions

export type InferInput<T> = T extends number
	? InputNumber
	: T extends boolean
		? InputSwitch
		: T extends Array<infer T>
			? InputSelect<T>
			: T extends Option<infer T>
				? InputSelect<T>
				: T extends ColorFormat
					? InputColor
					: T extends string
						? InputText
						: ValidInput

export interface FolderOptions {
	__type?: 'FolderOptions'

	/**
	 * The element to append the folder to (usually
	 * the parent folder's content element).
	 */
	container: HTMLElement

	/**
	 * The title of the folder.
	 * @defaultValue `''`
	 */
	title?: string

	/**
	 * A preset namespace to use for saving/loading.  By default, the {@link title|`title`}
	 * is used, in combiniation with the parent folder's title (and so on up the hierarchy).
	 * Therefore, if you want to use presets, you will only need to set this if you:
	 * - Use the same title for multiple inputs _in the same {@link Folder}_, or
	 * - Leave all titles empty
	 * Otherwise, this can be left as the default and presets will work as expected.
	 * @defaultValue {@link title|`title`}
	 */
	presetId?: string

	/**
	 * The child folders of this folder.
	 */
	children?: Folder[]

	/**
	 * Whether the folder should be collapsed by default.
	 * @defaultValue `false`
	 */
	closed?: boolean

	/**
	 * Whether the folder should be hidden by default.  If a function is
	 * provided, it will be called to determine the hidden state.  Use
	 * {@link refresh} to update the hidden state.
	 * @defaultValue `false`
	 */
	hidden?: boolean | (() => boolean)

	/**
	 * Any controls this folder should contain.
	 */
	controls?: Map<string, ValidInput>

	/**
	 * Whether this Folder should be saved as a {@link FolderPreset} when saving the
	 * {@link GuiPreset} for the {@link Gui} this Folder belongs to.  If `false`, this Input will
	 * be skipped.
	 * @defaultValue `true`
	 */
	saveable?: boolean

	/**
	 * When `true`, a search input will be added to the folder's toolbar, allowing users to search
	 * for inputs within the folder by title.  By default, only the root folder is searchable.
	 * @defaultValue `false`
	 */
	searchable?: boolean
}

/**
 * @internal
 */
export interface InternalFolderOptions {
	__type?: 'InternalFolderOptions'

	/**
	 * The parent folder of this folder (or a circular reference if this is the root folder).
	 */
	parentFolder?: Folder

	/**
	 * The GUI instance this folder belongs to.
	 */
	gui?: Gui

	/**
	 * Whether this folder is the root folder.  Always true when
	 * creating a `new Folder()`. Always false inside of the
	 * `gui.addFolder` and `folder.addFolder` methods.
	 * Be wary of infinite loops when setting manually.
	 * @defaultValue `true`
	 * @internal
	 */
	isRoot: boolean

	/**
	 * Temporarily bypasses the folder open/close animations upon creation.
	 * @internal
	 */
	_skipAnimations: boolean

	/**
	 * Hides the folder header.
	 * @defaultValue `false`
	 * @internal
	 */
	_headerless: boolean
}

/**
 * A folder preset stores the state of a folder and all of its inputs, as well as the state of all
 * child folders and their inputs.
 */
export interface FolderPreset {
	__type: 'FolderPreset'
	id: string
	title: string
	closed: boolean
	hidden: boolean
	children: FolderPreset[]
	inputs: InputPreset<any>[]
}

export interface FolderElements {
	header: HTMLElement
	title: HTMLElement
	contentWrapper: HTMLElement
	content: HTMLElement
	toolbar: {
		container: HTMLElement
		settingsButton?: HTMLButtonElement & { tooltip?: Tooltip }
	}
}

export interface FolderEvents {
	/**
	 * When any input in the folder changes, this event emits the input that changed.
	 */
	change: ValidInput

	/**
	 * When the folder is opened or closed, this event emits the new
	 * {@link Folder.closed | `closed`} state.
	 */
	toggle: Folder['closed']['value']

	/**
	 * Fires when {@link Folder.refresh} is called.
	 */
	refresh: void

	/**
	 * Fired after the folder and all of it's children/graphics have been mounted.
	 */
	mount: void
}
//⌟

//· Contants ·····················································································¬

const FOLDER_DEFAULTS = Object.freeze({
	presetId: '',
	title: '',
	children: [],
	closed: false,
	hidden: false,
	controls: new Map(),
	saveable: true,
}) satisfies Omit<FolderOptions, 'container'>

/**
 * Internal folder creation api defaults.
 */
const INTERNAL_FOLDER_DEFAULTS = {
	__type: 'InternalFolderOptions',
	parentFolder: undefined,
	isRoot: true,
	_skipAnimations: true,
	gui: undefined,
	_headerless: false,
} as const satisfies InternalFolderOptions
//⌟

/**
 * Folder is a container for organizing and grouping {@link Input|Inputs} and child Folders.
 *
 * This class should not be instantiated directly.  Instead, use the {@link Gui.addFolder} method.
 *
 * @example
 * ```typescript
 * const gui = new Gui()
 * const folder = gui.addFolder({ title: 'My Folder' })
 * folder.addNumber({ title: 'foo', value: 5 })
 * ```
 */
export class Folder {
	//· Props ····················································································¬
	__type = 'Folder' as const
	isRoot = true
	id = nanoid()
	gui?: Gui

	/**
	 * A preset namespace to use for saving/loading.  By default, the {@link title|`title`}
	 * is used, in combiniation with the parent folder's title (and so on up the hierarchy).
	 * Therefore, if you want to use presets, you will only need to set this if you:
	 * - Use the same title for multiple inputs _in the same {@link Folder}_, or
	 * - Leave all titles empty
	 * Otherwise, this can be left as the default and presets will work as expected.
	 * @defaultValue {@link title|`title`}
	 */
	presetId: string

	/**
	 * Whether this Folder should be saved as a {@link FolderPreset} when saving the
	 * {@link GuiPreset} for the {@link Gui} this Folder belongs to.  If `false`, this Input will
	 * be skipped.
	 * @defaultValue `true`
	 */
	saveable: boolean

	/**
	 * The child folders of this folder.
	 */
	children = [] as Folder[]

	/**
	 * All inputs added to this folder.
	 */
	inputs = new Map<string, ValidInput>()

	/**
	 * The root folder.  All folders have a reference to the same root folder.
	 */
	root: Folder
	parentFolder: Folder
	settingsFolder!: Folder
	// closed: State<boolean>
	closed = state(false)

	element: HTMLElement
	elements = {} as FolderElements
	graphics?: {
		icon: HTMLDivElement
		connector?: {
			container: HTMLDivElement
			svg: SVGElement
			path: SVGPathElement
		}
	}

	evm = new EventManager<FolderEvents>(['change', 'refresh', 'toggle', 'mount'])
	on = this.evm.on.bind(this.evm)

	private _title: string
	private _hidden = () => false
	private _log: Logger
	/** Used to disable clicking the header to open/close the folder. */
	private _disabledTimer?: ReturnType<typeof setTimeout>
	/** The time in ms to wait after mousedown before disabling toggle for a potential drag. */
	private _clickTime = 200
	/** Whether clicking the header to open/close the folder is disabled. */
	private _clicksDisabled = false
	private _depth = -1
	//⌟
	constructor(options: FolderOptions) {
		if (!('container' in options)) {
			throw new Error('Folder must have a container.')
		}

		const opts = Object.assign(
			{},
			FOLDER_DEFAULTS,
			INTERNAL_FOLDER_DEFAULTS,
			{
				gui: this.gui,
				isRoot: true,
			} as const,
			options,
		) as FolderOptions & InternalFolderOptions

		// this.closed = state(opts.closed ?? false)
		// if (opts.title === 'base') {
		// 	console.log(opts.closed)
		// 	console.log(this.closed.value)
		// 	setTimeout(() => {
		// 		console.log(this.closed.value)
		// 	}, 1000)
		// }

		this._log = new Logger(`Folder ${opts.title}`, { fg: 'DarkSalmon' })
		this._log.fn('constructor').debug({ opts, this: this })

		this.isRoot = opts.isRoot

		if (this.isRoot) {
			this._depth = 0
			this.parentFolder = this
			this.root = this
		} else {
			if (!opts.parentFolder) {
				throw new Error('Non-root folders must have a parent folder.')
			}
			this.parentFolder = opts.parentFolder
			this._depth = this.parentFolder._depth + 1
			this.root = this.parentFolder.root
		}

		this.gui = opts.gui
		this._title = opts.title ?? ''

		this.element = this._createElement(opts.container)
		this.elements = this._createElements(this.element)

		this.presetId = this.resolvePresetId(opts)
		this.saveable = !!opts.saveable

		if (this.isRoot || opts.searchable) {
			new Search(this)
		}

		if (opts._skipAnimations) {
			// We need to bypass animations so I can get the rect.
			this.element.classList.add('instant')
			setTimeout(() => {
				this.element.classList.remove('instant')
			}, 0)
		}

		this.hidden = opts.hidden ? toFn(opts.hidden) : () => false

		// Open/close the folder when the closed state changes.
		this.evm.add(
			this.closed.subscribe(v => {
				v ? this.close() : this.open()
				this.evm.emit('toggle', v)
			}),
		)

		this._createGraphics(opts._headerless).then(() => {
			if (opts.closed) {
				this.closed.set(opts.closed)
			}
			this.evm.emit('mount')
		})
	}

	//· Getters/Setters ··········································································¬

	/**
	 * The folder's title.  Changing this will update the UI.
	 */
	get title() {
		return this._title
	}
	set title(v: string) {
		if (v === this._title) return
		this._title = v
		this.elements.title.animate(
			{
				opacity: 0,
				transform: 'translateY(-0.33rem)',
			},
			{
				duration: 75,
				easing: 'ease-out',
				fill: 'forwards',
			},
		).onfinish = () => {
			this.elements.title.textContent = v
			this.elements.title.animate(
				[
					{
						opacity: 0,
						transform: 'translateY(.33rem)',
					},
					{
						opacity: 1,
						transform: 'translateY(0rem)',
					},
				],
				{
					delay: 0,
					duration: 75,
					easing: 'ease-in',
					fill: 'forwards',
				},
			)
		}
	}

	/**
	 * Whether the folder is visible.
	 */
	get hidden() {
		return this._hidden()
	}
	set hidden(v: boolean | (() => boolean)) {
		this._hidden = toFn(v)
		this._hidden() ? this.hide() : this.show()
	}

	/**
	 * A flat array of all child folders of this folder (and their children, etc).
	 */
	get allChildren(): Folder[] {
		return this.children.flatMap<Folder>(child => [child, ...child.allChildren])
	}

	/**
	 * A flat array of all inputs in all child folders of this folder (and their children, etc).
	 * See Input Generators region.
	 */
	get allInputs(): Map<string, ValidInput> {
		const allControls = new Map<string, ValidInput>()
		for (const child of [this, ...this.allChildren]) {
			for (const [key, value] of child.inputs.entries()) {
				allControls.set(key, value)
			}
		}
		return allControls
	}

	isRootFolder(): this is Folder & { isRoot: true } {
		return this.isRoot
	}
	//⌟

	//· Folders ··················································································¬

	addFolder(title?: string, options?: Partial<FolderOptions>): Folder {
		options ??= {}
		options.title ??= title
		this._log.fn('addFolder').debug({ options, this: this })
		const defaults = Object.assign({}, INTERNAL_FOLDER_DEFAULTS, {
			parentFolder: this,
			depth: this._depth + 1,
			gui: this.gui,
		})

		const overrides = {
			__type: 'InternalFolderOptions',
			container: this.elements.content,
			isRoot: false,
		}

		const opts = Object.assign({}, defaults, options, overrides) as FolderOptions &
			InternalFolderOptions

		const folder = new Folder(opts)
		folder.on('change', v => this.evm.emit('change', v))

		this.children.push(folder)
		this._createSvgs()

		if (opts._headerless) {
			folder.elements.header.style.display = 'none'
		}

		return folder
	}

	private _handleClick(event: PointerEvent) {
		if (event.button !== 0) return

		this._log.fn('#handleClick').debug({ event, this: this })

		this.element.removeEventListener('pointerup', this.toggle)
		this.element.addEventListener('pointerup', this.toggle, { once: true })

		// Abort if a toolbar button was clicked.
		if (composedPathContains(event, 'fracgui-cancel')) return this._disableClicks()

		// We need to watch for the mouseup event within a certain timeframe
		// to make sure we don't accidentally trigger a click after dragging.
		clearTimeout(this._disabledTimer)
		// First we delay the drag check to allow for messy clicks.
		this._disabledTimer = setTimeout(() => {
			this.elements.header.removeEventListener('pointermove', this._disableClicks)
			this.elements.header.addEventListener('pointermove', this._disableClicks, {
				once: true,
			})

			// Then we set a timer to disable the drag check.
			this._disabledTimer = setTimeout(() => {
				this.elements.header.removeEventListener('pointermove', this._disableClicks)
				this.element.removeEventListener('pointerup', this.toggle)
				this._clicksDisabled = false
			}, this._clickTime)
		}, 150)

		if (this._clicksDisabled) return
	}
	private _disableClicks = () => {
		if (!this._clicksDisabled) {
			this._clicksDisabled = true
			this._log.fn('disable').debug('Clicks DISABLED')
		}
		this._clicksDisabled = true
		clearTimeout(this._disabledTimer)
	}
	private _resetClicks() {
		this._log.fn('cancel').debug('Clicks ENABLED')
		removeEventListener('pointerup', this.toggle)
		this._clicksDisabled = false
	}

	//·· Open/Close ······································································¬

	toggle = () => {
		this._log.fn('toggle').debug()
		clearTimeout(this._disabledTimer)
		if (this._clicksDisabled) {
			this._resetClicks()
			return
		}

		// If the folder is being dragged, don't toggle.
		if (this.element.classList.contains('fracgui-dragged')) {
			this.element.classList.remove('fracgui-dragged')
			return
		}

		const state = !this.closed.value

		this.closed.set(state)

		this.evm.emit('toggle', state)
	}

	open(updateState = false) {
		this._log.fn('open').debug()
		this.element.classList.remove('closed')
		if (updateState) this.closed.set(false)
		this._clicksDisabled = false

		this.#toggleAnimClass()
		animateConnector(this, 'open')
	}

	close(updateState = false) {
		this._log.fn('close').debug()

		this.element.classList.add('closed')
		if (updateState) this.closed.set(true)
		this._clicksDisabled = false

		this.#toggleAnimClass()
		animateConnector(this, 'close')
	}

	toggleHidden() {
		this._log.fn('toggleHidden').debug()
		this.element.classList.toggle('hidden')
	}

	hide() {
		this._log.fn('hide').error()
		this.element.classList.add('hidden')
	}

	show() {
		this._log.fn('show').debug()
		this.element.classList.remove('hidden')
	}

	#toggleTimeout!: ReturnType<typeof setTimeout>
	#toggleAnimClass = () => {
		this.element.classList.add('animating')

		clearTimeout(this.#toggleTimeout)
		this.#toggleTimeout = setTimeout(() => {
			this.element.classList.remove('animating')
		}, 600) // todo - This needs to sync with the animation duration in the css... smelly.
	}
	//⌟

	//·· Save/Load ···············································································¬

	resolvePresetId = (opts?: FolderOptions) => {
		this._log.fn('resolvePresetId').debug({ opts, this: this })
		const getPaths = (folder: Folder): string[] => {
			if (folder.isRootFolder.bind(folder) || !(folder.parentFolder === this))
				return [folder.title]

			return [...getPaths(folder.parentFolder), folder.title]
		}
		const paths = getPaths(this)

		let presetId = opts?.presetId || paths.join('__')

		if (!presetId) {
			let i = 0
			for (const child of this.allChildren) {
				if (child.presetId == presetId) i++
			}
			if (i > 0) presetId += i
		}

		return presetId
	}

	save(): FolderPreset {
		this._log.fn('save').debug({ this: this })

		if (this.saveable !== true) {
			throw new Error('Attempted to save unsaveable Folder: ' + this.title)
		}

		const preset: FolderPreset = {
			__type: 'FolderPreset',
			id: this.presetId,
			title: this.title,
			closed: this.closed.value,
			hidden: toFn(this._hidden)(),
			children: this.children
				.filter(c => c.title !== Gui.settingsFolderTitle && c.saveable)
				.map(child => child.save()),
			inputs: Array.from(this.inputs.values())
				.filter(i => i.opts.saveable)
				.map(input => input.save()),
		}

		return preset
	}

	/**
	 * Updates all inputs with values from the {@link FolderPreset}.  If the preset has children,
	 * those presets will also be passed to the corresponding child folders'
	 * {@link Folder.load|`load`} method.
	 */
	load(preset: FolderPreset) {
		this._log.fn('load').debug({ preset, this: this })

		this.closed.set(preset.closed)
		this.hidden = preset.hidden

		for (const child of this.children) {
			const data = preset.children?.find(f => f.id === child.presetId)
			if (data) child.load(data)
		}

		for (const input of this.inputs.values()) {
			const data = preset.inputs.find(c => c.presetId === input.id)
			if (data) input.load(data)
		}
	}
	//⌟
	//⌟

	//· Input Generators ·········································································¬

	/**
	 * Updates the ui for all inputs belonging to this folder to reflect their current values.
	 */
	refresh() {
		this._log.fn('refresh').debug(this)

		for (const input of this.inputs.values()) {
			input.refresh()
		}
	}

	/**
	 * Updates the ui for all inputs in this folder and all child folders recursively.
	 */
	refreshAll() {
		for (const input of this.allInputs.values()) {
			input.refresh()
		}

		this.evm.emit('refresh')
	}

	addMany(obj: Record<string, any>, options?: { folder?: Folder }) {
		const folder = options?.folder ?? this

		for (const [key, value] of Object.entries(obj)) {
			if (typeof value === 'object') {
				if (isColor(value)) {
					this.addColor({ title: key, value })
					continue
				}

				const subFolder = folder.addFolder(key)
				subFolder.addMany(value, { folder: subFolder })
			} else {
				const opts = {
					title: key,
					value,
					binding: {
						target: obj,
						key,
					},
				}
				if (typeof value === 'number') {
					if (value > 0) {
						;(opts as NumberInputOptions).max = value * 2
						;(opts as NumberInputOptions).step = value / 10
						;(opts as NumberInputOptions).min = 0
					} else if (value == 0) {
						;(opts as NumberInputOptions).min = -1
						;(opts as NumberInputOptions).step = 0.01
						;(opts as NumberInputOptions).max = 1
					} else {
						;(opts as NumberInputOptions).min = value * 2
						;(opts as NumberInputOptions).step = value / 10
						;(opts as NumberInputOptions).max = 0
					}
				}
				this.add(opts)
			}
		}
	}

	add(title: string, options: SwitchInputOptions): InputSwitch
	add(options: SwitchInputOptions, never?: never): InputSwitch
	add(title: string, options: NumberInputOptions): InputNumber
	add(options: NumberInputOptions, never?: never): InputNumber
	add(title: string, options: TextInputOptions): InputText
	add(options: TextInputOptions, never?: never): InputText
	add(title: string, options: ColorInputOptions): InputColor
	add(options: ColorInputOptions, never?: never): InputColor
	add(title: string, options: ButtonInputOptions): InputButton
	add(options: ButtonInputOptions, never?: never): InputButton
	add(title: string, options: ButtonGridInputOptions): InputButtonGrid
	add(options: ButtonGridInputOptions, never?: never): InputButtonGrid
	add<T>(title: string, options: SelectInputOptions<T>): InputSelect<T>
	add<T>(options: SelectInputOptions<T>, never?: never): InputSelect<T>
	add(options: InputOptions, never?: never): ValidInput
	add(titleOrOptions: string | InputOptions, maybeOptions?: InputOptions): ValidInput {
		const opts = this._resolveOptions(titleOrOptions, maybeOptions)
		const input = this._createInput(opts)
		this.inputs.set(input.id, input)
		this._refreshIcon()
		return input
	}

	/**
	 * Binds an input to a target object and key.  The input will automatically update the target
	 * object's key when the input value changes.
	 * @param target - The object to bind the input to.
	 * @param key - The key of the target object to bind the input to.
	 * @param options - The {@link InputOptions}, the type of which is inferred based on the type
	 * of the value at the {@link target} object's {@link key}.
	 * @example
	 * ```ts
	 * const gui = new Gui()
	 * const params = { foo: 5, bar: 'baz' }
	 * const folder = gui.addFolder('params')
	 *
	 * const numberInput = folder.bind(params, 'foo', { min: 0, max: 10, step: 1 })
	 * //    ^? `InputNumber`
	 *
	 * const textInput = folder.bind(params, 'bar', { maxLength: 50 })
	 * //    ^? `InputText`
	 */
	bind<
		TTarget extends Record<string, any>,
		TKey extends keyof TTarget,
		TValue extends TTarget[TKey],
		TOptions extends InferOptions<TValue>,
		TInput extends InferInput<TValue>,
	>(target: TTarget, key: TKey, options?: Partial<TOptions>): TInput {
		const value = target[key] as TValue
		const opts = options ?? ({} as TOptions)
		opts.title ??= key as string
		opts.binding = { target, key, initial: value }

		const input = this._createInput(opts)
		this.inputs.set(input.id, input)
		this._refreshIcon()

		return input as unknown as TInput
	}

	/**
	 * Explicitly adds an {@link InputNumber} to the folder.
	 */
	addNumber(title: string, options: NumberInputOptions): InputNumber
	addNumber(options: NumberInputOptions, never?: never): InputNumber
	addNumber(
		titleOrOptions: string | NumberInputOptions,
		maybeOptions?: NumberInputOptions,
	): InputNumber {
		const opts = this._resolveOptions(titleOrOptions, maybeOptions)
		const input = new InputNumber(opts, this)
		this.inputs.set(input.id, input)
		this._refreshIcon()
		return input
	}
	/**
	 * Explicitly binds an {@link InputNumber} to the provided key on the given target object.
	 */
	bindNumber<T extends Record<string, any>, K extends keyof T>(
		target: T,
		key: K,
		options?: Partial<NumberInputOptions>,
	): InputNumber
	bindNumber(title: string, options: Partial<NumberInputOptions>): InputNumber
	bindNumber<
		T extends Record<any, any>,
		K extends keyof T,
		KK extends T[K] extends number ? K : never,
	>(
		titleOrTarget: string | T,
		keyOrOptions?: KK | Partial<NumberInputOptions>,
		options?: Partial<NumberInputOptions>,
	): InputNumber {
		const opts = this._resolveBinding<NumberInputOptions>(titleOrTarget, keyOrOptions, options)
		const input = new InputNumber(opts, this)
		this.inputs.set(input.title, input)
		this._refreshIcon()
		return input
	}

	/**
	 * Explicitly adds an {@link InputText} to the folder.
	 */
	addText(title: string, options: TextInputOptions): InputText
	addText(options: TextInputOptions, never?: never): InputText
	addText(titleOrOptions: string | TextInputOptions, maybeOptions?: TextInputOptions): InputText {
		const opts = this._resolveOptions(titleOrOptions, maybeOptions)
		const input = new InputText(opts, this)
		this.inputs.set(input.id, input)
		this._refreshIcon()
		return input
	}
	/**
	 * Explicitly binds an {@link InputText} to the provided key on the given target object.
	 */
	bindText<T extends Record<string, any>, K extends keyof T>(
		target: T,
		key: K,
		options?: Partial<TextInputOptions>,
	): InputText
	bindText(title: string, options: Partial<TextInputOptions>): InputText
	bindText<
		T extends Record<any, any>,
		K extends keyof T,
		KK extends T[K] extends string ? K : never,
	>(
		titleOrTarget: string | T,
		keyOrOptions?: KK | Partial<TextInputOptions>,
		options?: Partial<TextInputOptions>,
	): InputText {
		const opts = this._resolveBinding<TextInputOptions>(titleOrTarget, keyOrOptions, options)
		const input = new InputText(opts, this)
		this.inputs.set(input.title, input)
		this._refreshIcon()
		return input
	}

	/**
	 * Explicitly adds an {@link InputColor} to the folder.
	 */
	addColor(title: string, options: ColorInputOptions): InputColor
	addColor(options: ColorInputOptions, never?: never): InputColor
	addColor(
		titleOrOptions: string | ColorInputOptions,
		maybeOptions?: ColorInputOptions,
	): InputColor {
		const opts = this._resolveOptions(titleOrOptions, maybeOptions)
		const input = new InputColor(opts, this)
		this.inputs.set(input.id, input)
		this._refreshIcon()
		return input
	}
	/**
	 * Explicitly binds an {@link InputColor} to the provided key on the given target object.
	 */
	bindColor<T extends Record<string, any>, K extends keyof T>(
		target: T,
		key: K,
		options?: Partial<ColorInputOptions>,
	): InputColor
	bindColor(title: string, options: Partial<ColorInputOptions>): InputColor
	bindColor<
		T extends Record<any, any>,
		K extends keyof T,
		KK extends T[K] extends ColorFormat ? K : never,
	>(
		titleOrTarget: string | T,
		keyOrOptions?: KK | Partial<ColorInputOptions>,
		options?: Partial<ColorInputOptions>,
	): InputColor {
		const opts = this._resolveBinding<ColorInputOptions>(titleOrTarget, keyOrOptions, options)
		const input = new InputColor(opts, this)
		this.inputs.set(input.title, input)
		this._refreshIcon()
		return input
	}

	/**
	 * Explicitly adds an {@link InputButton} to the folder.
	 */
	addButton(title: string, options: ButtonInputOptions): InputButton
	addButton(options: ButtonInputOptions, never?: never): InputButton
	addButton(
		titleOrOptions: string | ButtonInputOptions,
		maybeOptions?: ButtonInputOptions,
	): InputButton {
		const opts = this._resolveOptions(titleOrOptions, maybeOptions)
		const input = new InputButton(opts, this)
		this.inputs.set(input.id, input)
		this._refreshIcon()
		return input
	}
	/**
	 * Explicitly binds an {@link InputButton} to the provided key on the given target object.
	 */
	bindButton<T extends Record<string, any>, K extends keyof T>(
		target: T,
		key: K,
		options?: Partial<ButtonInputOptions>,
	): InputButton
	bindButton(title: string, options: Partial<ButtonInputOptions>): InputButton
	bindButton<
		T extends Record<any, any>,
		K extends keyof T,
		KK extends T[K] extends Function ? K : never,
	>(
		titleOrTarget: string | T,
		keyOrOptions?: KK | Partial<ButtonInputOptions>,
		options?: Partial<ButtonInputOptions>,
	): InputButton {
		const opts = this._resolveBinding<ButtonInputOptions>(titleOrTarget, keyOrOptions, options)
		const input = new InputButton(opts, this)
		this.inputs.set(input.title, input)
		this._refreshIcon()
		return input
	}

	/**
	 * Explicitly adds an {@link InputButtonGrid} to the folder.
	 */
	addButtonGrid(title: string, options: ButtonGridInputOptions): InputButtonGrid
	addButtonGrid(options: ButtonGridInputOptions, never?: never): InputButtonGrid
	addButtonGrid(
		titleOrOptions: string | ButtonGridInputOptions,
		maybeOptions?: ButtonGridInputOptions,
	): InputButtonGrid {
		const opts = this._resolveOptions(titleOrOptions, maybeOptions)
		const input = new InputButtonGrid(opts, this)
		this.inputs.set(input.id, input)
		this._refreshIcon()
		return input
	}
	/**
	 * Explicitly binds an {@link InputButtonGrid} to the provided key on the given target object.
	 */
	bindButtonGrid<T extends Record<string, any>, K extends keyof T>(
		target: T,
		key: K,
		options?: Partial<ButtonGridInputOptions>,
	): InputButtonGrid
	bindButtonGrid(title: string, options: Partial<ButtonGridInputOptions>): InputButtonGrid
	bindButtonGrid<
		T extends Record<any, any>,
		K extends keyof T,
		KK extends T[K] extends Function ? K : never,
	>(
		titleOrTarget: string | T,
		keyOrOptions?: KK | Partial<ButtonGridInputOptions>,
		options?: Partial<ButtonGridInputOptions>,
	): InputButtonGrid {
		const opts = this._resolveBinding<ButtonGridInputOptions>(
			titleOrTarget,
			keyOrOptions,
			options,
		)
		const input = new InputButtonGrid(opts, this)
		this.inputs.set(input.title, input)
		this._refreshIcon()
		return input
	}

	/**
	 * Explicitly adds an {@link InputSelect} to the folder.
	 */
	addSelect<T>(title: string, options: SelectInputOptions<T>): InputSelect<T>
	addSelect<T>(options: SelectInputOptions<T>, never?: never): InputSelect<T>
	addSelect<T>(
		titleOrOptions: string | SelectInputOptions<T>,
		maybeOptions?: SelectInputOptions<T>,
	): InputSelect<T> {
		const opts = this._resolveOptions(titleOrOptions, maybeOptions)
		const input = new InputSelect(opts, this)
		this.inputs.set(input.id, input)
		this._refreshIcon()
		return input
	}
	/**
	 * Explicitly binds an {@link InputSelect} to the provided key on the given target object.
	 */
	bindSelect<T extends Record<any, any> = Record<any, any>, K extends keyof T = keyof T>(
		target: T,
		key: K,
		options?: Partial<SelectInputOptions<T>>,
	): InputSelect<T>
	bindSelect<T>(title: string, options: Partial<SelectInputOptions<T>>): InputSelect<T>
	bindSelect<
		T extends Record<any, any> = Record<any, any>,
		TOptions extends SelectInputOptions<T> = SelectInputOptions<T>,
	>(
		titleOrTarget: string | T,
		keyOrOptions?: TOptions | never,
		options?: TOptions,
	): InputSelect<T> {
		const opts = this._resolveBinding<SelectInputOptions<T>>(
			titleOrTarget,
			keyOrOptions,
			options,
		)
		const input = new InputSelect(opts, this)
		this.inputs.set(input.title, input)
		this._refreshIcon()
		return input
	}

	/**
	 * Explicitly adds an {@link InputSwitch} to the folder.
	 */
	addSwitch(title: string, options: SwitchInputOptions): InputSwitch
	addSwitch(options: SwitchInputOptions, never?: never): InputSwitch
	addSwitch(
		titleOrOptions: string | SwitchInputOptions,
		maybeOptions?: SwitchInputOptions,
	): InputSwitch {
		const opts = this._resolveOptions(titleOrOptions, maybeOptions)
		const input = new InputSwitch(opts, this)
		this.inputs.set(input.id, input)
		this._refreshIcon()
		return input
	}
	/**
	 * Explicitly binds an {@link InputSwitch} to the provided key on the given target object.
	 */
	bindSwitch<T, K extends keyof T>(
		target: T,
		key: K,
		options?: Partial<SwitchInputOptions>,
	): InputSwitch
	bindSwitch(title: string, options: Partial<SwitchInputOptions>): InputSwitch
	bindSwitch<
		T extends Record<any, any>,
		K extends keyof T,
		KK extends T[K] extends boolean ? K : never,
	>(
		titleOrTarget: string | T,
		keyOrOptions?: KK | Partial<SwitchInputOptions>,
		options?: Partial<SwitchInputOptions>,
	): InputSwitch {
		const opts = this._resolveBinding<SwitchInputOptions>(titleOrTarget, keyOrOptions, options)
		const input = new InputSwitch(opts, this)
		this.inputs.set(input.title, input)
		this._refreshIcon()
		return input
	}

	/**
	 * Does validation / error handling.
	 * If no title was provided, this method will also assign the binding key to the title.
	 * @returns The processed options.
	 */
	private _validateOptions<T extends InputOptions>(options: T, validate?: boolean): T {
		if (options.binding?.key && !options.title) {
			options.title = options.binding.key
		}

		// Some (hopefully) helpful error handling.
		if (validate) {
			const b = options.binding
			let value = options.value

			if (!value) {
				value = b?.target[b?.key]
			}

			if (!value) {
				if (b) {
					let err = false

					if (typeof b.target === 'undefined') {
						err = true
						console.error(
							`\x1b[96mgooey\x1b[39m ~ \x1b[91mError\x1b[39m Binding "target" is undefined:`,
							b,
						)
					}

					if (typeof b.key === 'undefined') {
						err = true
						console.error(
							`\x1b[96mgooey\x1b[39m ~ \x1b[91mError\x1b[39m Binding "key" is undefined:`,
							b,
						)
					}

					if (typeof b.target[b.key] === 'undefined') {
						err = true
						console.error(
							`\x1b[96mgooey\x1b[39m ~ \x1b[91mError\x1b[39m The provided binding key \x1b[33m"${b.key}"\x1b[39m does not exist on provided \x1b[33mtarget\x1b[39m:`,
							b,
						)
					}

					if (err) {
						throw new Error(
							'gooey ~ Failed to bind input to the provided target object.',
							{
								cause: options,
							},
						)
					}
				} else {
					throw new Error('gooey ~ No value or binding provided.', { cause: options })
				}
			}
		}

		return options
	}

	private _createInput<TOptions extends InputOptions>(options: TOptions) {
		this._log.fn('#createInput').debug(this)
		const type = this._resolveType(options)
		options = this._validateOptions(options)

		switch (type) {
			case 'InputText':
				return new InputText(options as TextInputOptions, this)
			case 'InputNumber':
				return new InputNumber(options as NumberInputOptions, this)
			case 'InputColor':
				return new InputColor(options as ColorInputOptions, this)
			case 'InputSelect':
				return new InputSelect(options as SelectInputOptions<Option<any>>, this)
			case 'InputButton':
				return new InputButton(options as ButtonInputOptions, this)
			case 'InputSwitch':
				return new InputSwitch(options as SwitchInputOptions, this)
		}

		throw new Error('Invalid input type: ' + type + ' for options: ' + options)
	}

	private _resolveOptions<T extends InputOptions>(
		titleOrOptions: string | T,
		maybeOptions?: T,
	): T {
		const twoArgs = typeof titleOrOptions === 'string' && typeof maybeOptions === 'object'
		const title = twoArgs ? (titleOrOptions as string) : maybeOptions?.title ?? ''
		const options = twoArgs ? maybeOptions! : (titleOrOptions as T)
		options.title ??= title
		return options
	}

	private _resolveBinding<
		TOptions extends InputOptions,
		T extends Record<any, any> = Record<any, any>,
		K extends keyof T = keyof T,
		KK extends T[K] extends number ? K : never = T[K] extends number ? K : never,
	>(
		titleOrTarget: string | T,
		keyOrOptions?: KK | Partial<TOptions>,
		options?: Partial<TOptions>,
	) {
		let opts: Partial<TOptions>
		let shouldHaveValue = false
		if (typeof titleOrTarget === 'string') {
			opts = (keyOrOptions as Partial<TOptions>) ?? {}
			opts.title = titleOrTarget
		} else {
			shouldHaveValue = true
			const target = titleOrTarget
			const key = keyOrOptions as KK
			opts = options ?? {}
			opts.binding = { target, key, initial: target[key] }
		}

		return this._validateOptions(opts, shouldHaveValue)
	}

	private _resolveType(options: any): InputType {
		this._log.fn('resolveType').debug({ options, this: this })
		let value = options.value ?? options.binding?.target[options.binding!.key]

		if ('onClick' in options) {
			return 'InputButton'
		}

		if (('options' in options && Array.isArray(options.options)) || isLabeledOption(value)) {
			value ??= options.options[0]
			options.value ??= value
			return 'InputSelect'
		}

		switch (typeof value) {
			case 'boolean': {
				// todo:
				// We need some way to differentiate between a switch and a checkbox once the checkbox is added.
				// ^ Why do we need a checkbox?
				return 'InputSwitch'
			}
			case 'number': {
				return 'InputNumber'
			}
			case 'string': {
				if (isColorFormat(value)) return 'InputColor'
				// todo:
				// Could detect CSS units like `rem` and `-5px 0 0 3px` for an advanced `CSSTextInput` or something.
				// Or like a "TextComponents" input that can have any number of "components" (like a color picker, number, select, etc) inside a string.
				return 'InputText'
			}
			case 'function': {
				return 'InputButton'
			}
			case 'object': {
				if (Array.isArray(value)) {
					return 'InputSelect'
				}
				if (isColor(value)) {
					return 'InputColor'
				}
				if (isLabeledOption(value)) {
					return 'InputSelect'
				}
				throw new Error('Invalid input view: ' + JSON.stringify(value))
			}
			default: {
				throw new Error('Invalid input view: ' + value)
			}
		}
	}
	//⌟

	//· Elements ·················································································¬

	private _createElement(el?: HTMLElement) {
		this._log.fn('#createElement').debug({ el, this: this })
		if (this.isRoot) {
			return create('div', {
				id: `fracgui-root_${this.id}`,
				classes: ['fracgui-root', 'fracgui-folder', 'closed'],
				dataset: { theme: this.gui!.theme ?? 'default' },
				parent: el,
			})
		}

		return create('div', {
			parent: this.parentFolder.elements.content,
			classes: ['fracgui-folder', 'closed'],
		})
	}

	private _createElements(element: HTMLElement): FolderElements {
		this._log.fn('#createElements').debug({ element, this: this })
		const header = create('div', {
			parent: element,
			classes: ['fracgui-header'],
		})
		header.addEventListener('pointerdown', this._handleClick.bind(this))

		const title = create('div', {
			parent: header,
			classes: ['fracgui-title'],
			textContent: this.title,
		})

		const toolbar = create('div', {
			parent: header,
			classes: ['fracgui-toolbar'],
		})

		const contentWrapper = create('div', {
			classes: ['fracgui-content-wrapper'],
			parent: element,
		})
		const content = create('div', {
			classes: ['fracgui-content'],
			parent: contentWrapper,
		})

		return {
			header,
			toolbar: {
				container: toolbar,
				// settingsButton,
			},
			title,
			contentWrapper,
			content,
		}
	}
	//⌟

	//· SVG's ····················································································¬

	private async _createGraphics(headerless = false) {
		this._log.fn('createGraphics').debug({ this: this })
		await Promise.resolve()

		if (!this.isRootFolder()) {
			this.graphics = { icon: createFolderSvg(this) }
			this.elements.header.prepend(this.graphics.icon)

			if (!headerless) {
				this.graphics.connector = createFolderConnector(this)
				this.element.prepend(this.graphics.connector.container)
			}
		}

		if (DEV) new TerminalSvg(this)
	}

	private _createSvgs() {
		this._log.fn('#createSvgs').debug({ this: this })
	}

	get hue() {
		const localIndex = this.parentFolder.children.indexOf(this)
		// note: Color will be off if we ever add built-in folders other than "Settings Folder".
		const i = this.parentFolder.isRootFolder() ? localIndex - 1 : localIndex
		// Don't count the root folder.
		const depth = this._depth - 1

		return i * 20 + depth * 80
	}

	private _refreshIcon() {
		this._log.fn('#refreshIcon').debug(this)

		if (this.graphics) {
			this.graphics.icon.replaceWith(createFolderSvg(this)) // Don't love this...
		}
	}
	//⌟

	disposed = false
	dispose() {
		if (this.disposed && DEV) {
			this._log.fn('dispose').error('Already disposed.', this)
			return
		}
		this.elements.header.removeEventListener('click', this.toggle)
		this.elements.header.addEventListener('pointerdown', this._handleClick)

		this.element.remove()

		for (const input of this.inputs.values()) {
			input.dispose()
		}

		for (const child of this.children) {
			child.dispose()
		}

		try {
			this.parentFolder.children.splice(this.parentFolder.children.indexOf(this), 1)
		} catch (err) {
			this._log.fn('dispose').error('Error removing folder from parent', { err })
		}

		this.disposed = true
	}
}
