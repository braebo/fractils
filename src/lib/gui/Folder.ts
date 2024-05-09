// The custom-regions extension is recommended for this file.

import type { InputOptions, InputPreset, InputType, ValidInput } from './inputs/Input'
import type { Option } from './controllers/Select'
import type { Tooltip } from '../actions/tooltip'

import { InputButtonGrid, type ButtonGridInputOptions } from './inputs/InputButtonGrid'
import { InputSwitch, type SwitchInputOptions } from './inputs/InputSwitch'
import { InputButton, type ButtonInputOptions } from './inputs/InputButton'
import { InputSelect, type SelectInputOptions } from './inputs/InputSelect'
import { InputNumber, type NumberInputOptions } from './inputs/InputNumber'
import { InputColor, type ColorInputOptions } from './inputs/InputColor'
import { InputText, type TextInputOptions } from './inputs/InputText'

import { animateConnector, createFolderConnector, createFolderSvg } from './svg/folderSvgs'
import { composedPathContains } from '../internal/cancelClassFound'
import { isColor, isColorFormat } from '../color/color'
import { EventManager } from '../utils/EventManager'
import { TerminalSvg } from './svg/TerminalSvg'
import { Search } from './toolbar/Search'
import { create } from '../utils/create'
import { Logger } from '../utils/logger'
import { nanoid } from '../utils/nanoid'
import { state } from '../utils/state'
import { toFn } from './shared/toFn'
import { DEV } from 'esm-env'
import { Gui } from './Gui'

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

export interface FolderOptions {
	__type?: 'FolderOptions'

	/**
	 * The element to append the folder to (usually
	 * the parent folder's content element).
	 */
	container: HTMLElement

	/**
	 * The title of the folder.
	 * @default ''
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
}

const FOLDER_DEFAULTS = Object.freeze({
	presetId: '',
	title: '',
	children: [],
	closed: false,
	hidden: false,
	controls: new Map(),
}) satisfies Omit<FolderOptions, 'container'>

/**
 * @internal
 */
export interface InternalFolderOptions {
	__type?: 'InternalFolderOptions'

	// title: string

	/**
	 * The parent folder of this folder (or a circular reference if this is the root folder).
	 */
	parentFolder?: Folder

	/**
	 * The GUI instance this folder belongs to.
	 */
	gui?: Gui

	// /**
	//  * The depth of the folder in the hierarchy.
	//  * @default 0
	//  */
	// depth?: number

	/**
	 * Whether this folder is the root folder.  Always true when
	 * creating a `new Folder()`. Always false inside of the
	 * `gui.addFolder` and `folder.addFolder` methods.
	 * Be wary of infinite loops when setting manually.
	 * @default true
	 * @internal
	 */
	isRoot: boolean

	/**
	 * Bypasses the folder open/close animations.
	 */
	instant: boolean

	/**
	 * Hides the folder header.
	 * @default false
	 */
	headerless: boolean
}

export const INTERNAL_FOLDER_DEFAULTS = {
	__type: 'InternalFolderOptions',
	// parentFolder: undefined,
	isRoot: true,
	instant: true,
	// gui: undefined,
	headerless: false,
} as const satisfies InternalFolderOptions

// export const INTERNAL_FOLDER_DEFAULTS = {
// 	depth: 0,
// 	isRoot: true,
// 	instant: true,
// 	parentFolder: undefined,
// 	container: undefined,
// 	presetId: '',
// 	title: '',
// 	children: [],
// 	closed: false,
// 	hidden: false,
// 	gui: undefined,
// 	controls: new Map(),
// } as const satisfies Omit<InternalFolderOptions, FolderOptions>

export interface FolderPreset {
	__type: 'FolderPreset'
	presetTitle?: string
	presetId: string
	closed: boolean
	hidden: boolean
	children: FolderPreset[]
	controllers: InputPreset<any>[]
}

/**
 * @internal
 */
export class Folder {
	//· Props ····················································································¬
	__type = 'Folder' as const
	// isFolder = true as const
	isRoot = true
	id = nanoid()

	gui?: Gui

	static #i = 0
	index = Folder.#i++
	// depth: number
	depth = -1

	root: Folder
	search: Search

	#title: string
	presetId: string
	children = [] as Folder[]
	inputs = new Map<string, ValidInput>()
	parentFolder: Folder
	settingsFolder!: Folder

	closed = state(false)
	#hidden: () => boolean

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

	#subs: Array<() => void> = []
	#log: Logger
	/**
	 * Used to disable clicking the header to open/close the folder.
	 */
	#disabledTimer?: ReturnType<typeof setTimeout>
	/**
	 * The time in ms to wait after mousedown before
	 * disabling toggle for a potential drag.
	 */
	#clickTime = 200
	/**
	 * Whether clicking the header to open/close the folder is disabled.
	 */
	#disabled = false

	evm = new EventManager(['change', 'toggle'])
	on = this.evm.on
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

		this.#log = new Logger(`Folder : ${opts.title}`, { fg: 'DarkSalmon' })
		this.#log.fn('constructor').debug({ opts, this: this })

		this.isRoot = opts.isRoot

		if (this.isRoot) {
			this.depth = 0
			this.parentFolder = this
			this.root = this
		} else {
			if (!opts.parentFolder) {
				throw new Error('Non-root folders must have a parent folder.')
			}
			this.parentFolder = opts.parentFolder
			this.depth = this.parentFolder.depth + 1
			this.root = this.parentFolder.root
		}

		this.gui = opts.gui
		this.#title = opts.title ?? ''

		// todo - I _really_ want to know why this blows everything up, and why FOLDER_DEFAULTS.children is mutated to contain the parent
		// todo - as a child even though its frozen, and _nowhere_ is `children` even passed into the constructor options...??!?!?!
		//! this.children = opts.children

		this.element = this.#createElement(opts.container)
		this.elements = this.#createElements(this.element)

		this.presetId = this.resolvePresetId(opts)

		this.search = new Search(this)

		if (opts.instant) {
			// We need to bypass animations so I can get the rect.
			this.element.classList.add('instant')
			setTimeout(() => {
				this.element.classList.remove('instant')
			}, 0)
		}

		this.#hidden = opts.hidden ? toFn(opts.hidden) : toFn(false)

		// Open/close the folder when the closed state changes.
		this.#subs.push(
			this.closed.subscribe(v => {
				v ? this.close() : this.open()
				this.evm.emit('toggle', v)
				// this.root.closedMap?.setKey(this.presetId, v)
			}),
		)

		this.createGraphics(opts.headerless).then(() => {
			if (opts.closed) {
				this.closed.set(opts.closed)
			}
		})
	}

	//· Getters/Setters ··········································································¬

	/**
	 * The folder's title.  Reactive to assignments.
	 */
	get title() {
		return this.#title
	}
	set title(v: string) {
		if (v === this.#title) return
		this.#title = v
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
		return this.#hidden()
	}
	set hidden(v: boolean | (() => boolean)) {
		this.#hidden = toFn(v)
	}

	/**
	 * A flat array of all child folders of this folder (and their children, etc).
	 */
	get allChildren(): Folder[] {
		return this.children.flatMap<Folder>(child => [child, ...child.allChildren])
	}

	/**
	 * A flat array of all controls of all child folders of this folder (and their children, etc).
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

	addFolder = (options?: Partial<FolderOptions>) => {
		this.#log.fn('addFolder').debug({ options, this: this })
		const defaults = Object.assign(Folder.getDefaults(), {
			parentFolder: this,
			depth: this.depth + 1,
			gui: this.gui,
		})

		const overrides = {
			__type: 'InternalFolderOptions',
			container: this.elements.content,
			isRoot: false,
		}

		const opts = Object.assign(defaults, options, overrides)

		const folder = new Folder(opts)

		//! how the f*** is each child getting the parent in their `children` array?!!?
		this.children.push(folder)
		if (folder === this) {
			throw new Error('wtf')
		}
		this.#createSvgs()

		if (defaults.headerless) {
			folder.elements.header.style.display = 'none'
		}

		return folder
	}

	#handleClick(event: PointerEvent) {
		if (event.button !== 0) return

		this.#log.fn('#handleClick').debug({ event, this: this })

		this.element.removeEventListener('pointerup', this.toggle.bind(this))
		this.element.addEventListener('pointerup', this.toggle.bind(this), { once: true })

		// todo - with the addition of the dataset `dragged` attribute from draggable, this might not be necessary.
		// todo - Figure out why `stopPropagation` doesn't work so we don't need this.
		if (composedPathContains(event, 'fractils-cancel')) return this.#disableClicks()

		// We need to watch for the mouseup event within a certain timeframe
		// to make sure we don't accidentally trigger a click after dragging.
		clearTimeout(this.#disabledTimer)
		// First we delay the drag check to allow for messy clicks.
		this.#disabledTimer = setTimeout(() => {
			this.elements.header.removeEventListener('pointermove', this.#disableClicks.bind(this))
			this.elements.header.addEventListener('pointermove', this.#disableClicks.bind(this), {
				once: true,
			})

			// Then we set a timer to disable the drag check.
			this.#disabledTimer = setTimeout(() => {
				this.elements.header.removeEventListener(
					'pointermove',
					this.#disableClicks.bind(this),
				)
				this.element.removeEventListener('pointerup', this.toggle.bind(this))
				this.#disabled = false
			}, this.#clickTime)
		}, 150)

		if (this.#disabled) return
	}
	#disableClicks() {
		if (!this.#disabled) {
			this.#disabled = true
			this.#log.fn('disable').debug('Clicks DISABLED')
		}
		this.#disabled = true
		clearTimeout(this.#disabledTimer)
	}
	#resetClicks() {
		this.#log.fn('cancel').debug('Clicks ENABLED')
		removeEventListener('pointerup', this.toggle)
		this.#disabled = false
	}

	//·· Open/Close ···························································¬

	toggle() {
		this.#log.fn('toggle').debug()
		clearTimeout(this.#disabledTimer)
		if (this.#disabled) {
			this.#resetClicks()
			return
		}

		// If the folder is being dragged, don't toggle. // todo - Is this doing anything?
		if (this.element.classList.contains('fractils-dragged')) {
			this.element.classList.remove('fractils-dragged')
			return
		}

		const state = !this.closed.value

		this.closed.set(state)

		this.evm.emit('toggle', state)
	}

	open(updateState = false) {
		this.#log.fn('open').debug()
		this.element.classList.remove('closed')
		if (updateState) this.closed.set(false)
		this.#disabled = false

		this.#toggleAnimClass()
		animateConnector(this, 'open')
	}

	close(updateState = false) {
		this.#log.fn('close').debug()

		this.element.classList.add('closed')
		if (updateState) this.closed.set(true)
		this.#disabled = false

		this.#toggleAnimClass()
		animateConnector(this, 'close')
	}

	toggleHidden() {
		this.#log.fn('toggleHidden').debug()
		this.element.classList.toggle('hidden')
	}

	hide() {
		this.#log.fn('hide').debug()
		this.element.classList.add('hidden')
	}

	show() {
		this.#log.fn('show').debug()
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

	//·· Save/Load ···························································¬

	resolvePresetId = (opts?: FolderOptions) => {
		this.#log.fn('resolvePresetId').debug({ opts, this: this })
		const getPaths = (folder: Folder): string[] => {
			if (folder.isRootFolder.bind(folder) || !(folder.parentFolder === this))
				return [folder.title]

			return [...getPaths(folder.parentFolder), folder.title]
		}
		const paths = getPaths(this)

		let presetId = opts?.presetId || paths.join(':')

		if (!presetId) {
			let i = 0
			for (const child of this.allChildren) {
				if (child.presetId == presetId) i++
			}
			if (i > 0) presetId += i
		}

		return presetId
	}

	save(presetTitle?: string) {
		this.#log.fn('save').debug({ presetTitle, this: this })
		const data: FolderPreset = {
			__type: 'FolderPreset',
			presetId: this.presetId,
			closed: this.closed.value,
			hidden: toFn(this.#hidden)(),
			children: this.children
				.filter(c => c.title !== Gui.settingsFolderTitle)
				.map(child => child.save()),
			controllers: Array.from(this.inputs.values()).map(input => input.save()),
		}

		if (this.isRootFolder()) {
			if (!presetTitle) {
				throw new Error('Root folder must have a preset title.')
			}
			data.presetTitle = presetTitle
		}

		return data
	}

	load(preset: FolderPreset) {
		this.#log.fn('load').debug({ preset, this: this })

		this.closed.set(preset.closed)
		this.hidden = preset.hidden

		for (const child of this.children) {
			const data = preset.children?.find(f => f.presetId === child.presetId)
			if (data) child.load(data)
		}

		for (const input of this.inputs.values()) {
			const data = preset.controllers.find(c => c.presetId === input.presetId)
			if (data) input.load(data)
		}
	}
	//⌟
	//⌟

	//· Input Generators ·····················································¬

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
		const twoArgs = typeof titleOrOptions === 'string' && typeof maybeOptions === 'object'
		const title = twoArgs ? (titleOrOptions as string) : maybeOptions?.title ?? ''
		const options = twoArgs ? maybeOptions! : (titleOrOptions as InputOptions)
		if (!twoArgs && options) options.title ??= title

		const input = this.#createInput(options)
		this.inputs.set(input.presetId, input)
		this.#refreshIcon()
		return input
	}

	// todo - This should take any object and build the inputs from it.
	// addMany(obj: Record<string, any>) {}

	addNumber(options: Partial<NumberInputOptions>) {
		const input = new InputNumber(options, this)
		this.inputs.set(input.title, input)
		this.#refreshIcon()
		return input
	}

	addText(options: Partial<TextInputOptions>) {
		const input = new InputText(options, this)
		this.inputs.set(input.title, input)
		this.#refreshIcon()
		return input
	}

	addColor(options: Partial<ColorInputOptions>) {
		const input = new InputColor(options, this)
		this.inputs.set(input.title, input)
		this.#refreshIcon()
		return input
	}

	addButton(options: Partial<ButtonInputOptions>) {
		const input = new InputButton(options, this)
		this.inputs.set(input.title, input)
		this.#refreshIcon()
		return input
	}

	addButtonGrid(options: Partial<ButtonGridInputOptions>) {
		const input = new InputButtonGrid(options, this)
		this.inputs.set(input.title, input)
		this.#refreshIcon()
		return input
	}

	addSelect<T>(options: Partial<SelectInputOptions<T>>) {
		const input = new InputSelect(options, this)
		this.inputs.set(input.title, input)
		this.#refreshIcon()
		return input
	}

	addSwitch(options: Partial<SwitchInputOptions>) {
		const input = new InputSwitch(options, this)
		this.inputs.set(input.title, input)
		this.#refreshIcon()
		return input
	}

	#createInput(options: InputOptions) {
		this.#log.fn('#createInput').debug(this)
		const type = this.resolveType(options)

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

		throw new Error('Invalid input view: ' + options)
	}

	resolveType(options: any): InputType {
		this.#log.fn('resolveType').debug({ options, this: this })
		const value = options.value ?? options.binding!.target[options.binding!.key]

		if ('onClick' in options) {
			return 'InputButton'
		}

		if ('options' in options) {
			return 'InputSelect'
		}

		switch (typeof value) {
			case 'boolean':
				// todo - We need some way to differentiate between a switch and a checkbox once the checkbox is added.
				// if ((options as SwitchInputOptions).labels) return 'InputSwitch'
				return 'InputSwitch'
			case 'number':
				return 'InputNumber'
			case 'string':
				if (isColorFormat(value)) return 'InputColor'
				// todo - Could detect CSS units like `rem` and `-5px 0 0 3px` for an advanced `CSSTextInput`.
				// todo - Or even better, a "TextComponents" input that can have any number of "components" (like a color picker, number, select, etc) inside a string.
				return 'InputText'
			case 'function':
				return 'InputButton'
			case 'object':
				if (Array.isArray(value)) {
					return 'InputSelect'
				}
				if (isColor(value)) {
					return 'InputColor'
				}
				throw new Error('Invalid input view: ' + JSON.stringify(value))
			default:
				throw new Error('Invalid input view: ' + value)
		}
	}
	//⌟

	//· Elements ·····························································¬

	#createElement(el?: HTMLElement) {
		this.#log.fn('#createElement').debug({ el, this: this })
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

	#createElements(element: HTMLElement): FolderElements {
		this.#log.fn('#createElements').debug({ element, this: this })
		const header = create('div', {
			parent: element,
			classes: ['fracgui-header'],
		})
		header.addEventListener('pointerdown', this.#handleClick.bind(this))

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

	//· SVG's ································································¬

	async createGraphics(headerless = false) {
		this.#log.fn('createGraphics').debug({ this: this })
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

	#createSvgs() {
		this.#log.fn('#createSvgs').debug({ this: this })
	}

	get hue() {
		const localIndex = this.parentFolder.children.indexOf(this)
		//-note: Color will be off if we ever add built-in folders other than "Settings Folder".
		const i = this.parentFolder.isRootFolder() ? localIndex - 1 : localIndex
		// Don't count the root folder.
		const depth = this.depth - 1

		return i * 20 + depth * 80
	}

	#refreshIcon() {
		this.#log.fn('#refreshIcon').debug(this)

		if (this.graphics) {
			this.graphics.icon.replaceWith(createFolderSvg(this)) // ...
		}
	}
	//⌟

	static getDefaults(): InternalFolderOptions {
		const opts: Omit<InternalFolderOptions, keyof FolderOptions> = {
			parentFolder: undefined,
			isRoot: true,
			instant: true,
			gui: undefined,
			headerless: false,
		}

		return Object.assign({}, FOLDER_DEFAULTS, opts)
	}

	dispose() {
		this.#subs.forEach(unsub => unsub())

		this.elements.header.removeEventListener('click', this.toggle)
		this.elements.header.addEventListener('pointerdown', this.#handleClick)

		this.element.remove()

		try {
			this.parentFolder.children.splice(this.parentFolder.children.indexOf(this), 1)
		} catch (err) {
			this.#log.fn('dispose').error('Error removing folder from parent', { err })
		}
	}
}
