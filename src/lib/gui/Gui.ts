import './gui.scss'

import type { WindowManagerOptions } from '../utils/windowManager'
import type { Placement, PlacementOptions } from '../dom/place'
import type { PrimitiveState, State } from '../utils/state'
import type { ResizableOptions } from '../utils/resizable'
import type { DraggableOptions } from '../utils/draggable'
import type { Theme, ThemeMode } from '../themer/types'
import type { ThemerOptions } from '../themer/Themer'
import type { PropertiesHyphen } from 'csstype'
import type { FolderPreset } from './Folder'

import { WindowManager, WINDOWMANAGER_DEFAULTS } from '../utils/windowManager'
import { RESIZABLE_DEFAULTS } from '../utils/resizable'
import { DRAGGABLE_DEFAULTS } from '../utils/draggable'
import { ThemeEditor, Themer } from '../themer/Themer'
import settingsIcon from './svg/settings-icon.svg?raw'
import { UndoManager } from '../utils/undoManager'
import { resolveOpts } from './shared/resolveOpts'
import { PresetManager } from './PresetManager'
import { deepMerge } from '../utils/deepMerge'
import { nanoid } from '../utils/nanoid'
import { BROWSER } from '../utils/env'
import { isType } from '../utils/isType'
import { Logger } from '../utils/logger'
import { create } from '../utils/create'
import { VAR_PREFIX } from './GUI_VARS'
import { state } from '../utils/state'
import { GUI_VARS } from './GUI_VARS'
import { place } from '../dom/place'
import { Folder } from './Folder'

//· Types ···································································¬

type GuiTheme = 'default' | 'minimal' | (string & {})

export interface GuiElements {
	root: HTMLElement
}

export interface GuiOptions {
	__type?: 'GuiOptions'
	/**
	 * The title of the Gui.
	 * @defaultValue 'gooey'
	 */
	title?: string
	/**
	 * Defines which properties to persist in localStorage, and under which
	 * key, if any.  If `true`, the {@link GUI_STORAGE_DEFAULTS} will be used.
	 * If `false`, no state will be persisted.
	 * @defaultValue false
	 */
	storage?: boolean | Partial<GuiStorageOptions>
	/**
	 * The container to append the gui to.
	 * @defaultValue document.body
	 */
	container?: HTMLElement
	/**
	 * The title of the theme to use for the gui.  To add your own themes,
	 * use {@link themerOptions.themes}.
	 * @defaultValue 'default'
	 */
	theme?: GuiTheme
	/**
	 * Optional {@link Themer} instance for syncing the gui's theme
	 * with your app's theme.  If `true`, a new themer will be created
	 * for you. If `false` or `undefined`, no themer will be created.
	 * @defaultValue true
	 */
	themer: Themer | boolean
	/**
	 * Options for the {@link Themer} instance when `themer` is `true`.
	 */
	themerOptions: Partial<ThemerOptions>
	/**
	 * {@link WindowManager} controls behaviors like dragging, resizing, and
	 * z-index management.  This option can be:
	 * - Your own {@link WindowManager} instance.
	 * - `false` disables the window manager.
	 * - `true` uses default options.
	 * @defaultValue true
	 */
	windowManager?: boolean | WindowManager
	/**
	 * Options for the {@link WindowManager} instance when `windowManager` is
	 * `true`.  They will be merged with the {@link WINDOWMANAGER_DEFAULTS}.
	 * @defaultValue {@link GUI_WINDOWMANAGER_DEFAULTS}
	 */
	windowManagerOptions?: Partial<WindowManagerOptions>
	/**
	 * The gui's initial position on the screen.  If `undefined`, the gui will
	 * be placed in the top-right corner of the screen.
	 *
	 * This value can either be a {@link Placement} string, or an object with
	 * `x` and `y` properties representing the position in pixels.
	 * @defaultValue 'top-right'
	 */
	position?: Placement | { x: number; y: number }
	/**
	 * Additional options when using a {@link Placement} string for `position`
	 * instead of an explicit {x, y} object.
	 * @defaultValue { margin: 16, bounds: 'window' } // todo - Update the defaults.
	 */
	positionOptions?: Partial<PlacementOptions>
	/**
	 * The initial expanded state of the gui.
	 * @defaultValue `false`
	 */
	closed?: boolean
	/**
	 * Presets to make available in the gui.
	 * @defaultValue `[]`
	 */
	presets?: GuiPreset[]
	/**
	 * The default preset to load when the gui is created, or the initial gui state if undefined.
	 * @defaultValue `undefined`
	 */
	defaultPreset?: GuiPreset
	// /**
	//  * `parentFolder` should always be `undefined` for the root gui.
	//  * @private
	//  * @internal
	//  */
	// _parentFolder: undefined
	/**
	 * A unique id for the gui's root element.
	 * @defaultValue {@link nanoid}
	 */
	id?: string
}

export interface GuiStorageOptions {
	__type?: 'GuiStorageOptions'
	/**
	 * Prefix to use for localStorage keys.
	 * @defaultValue "fractils::gui"
	 */
	key: string
	/**
	 * Whether to persist the folder's expanded state.
	 * @defaultValue true
	 */
	closed?: boolean
	/**
	 * Whether to persist the theme.
	 * @defaultValue true
	 */
	theme?: boolean
	/**
	 * Whether to persist the gui's position.
	 * @defaultValue false
	 * /// todo - implement this!
	 */
	position?: boolean
	/**
	 * Whether to persist the gui's size.
	 * @defaultValue false
	 * /// todo - implement this!
	 */
	size?: boolean
	/**
	 * Whether to persist the gui's presets.
	 * @defaultValue true
	 */
	presets?: boolean
}

export interface GuiPreset {
	__type: 'GuiPreset'
	__version: number
	id: string
	title: string
	data: FolderPreset
}
//⌟

export const GUI_STORAGE_DEFAULTS: GuiStorageOptions = {
	__type: 'GuiStorageOptions',
	key: 'fracgui',
	closed: true,
	theme: true,
	presets: true,
	position: false,
	size: false,
} as const

export const GUI_WINDOWMANAGER_DEFAULTS = {
	__type: 'WindowManagerOptions',
	preserveZ: false,
	zFloor: 0,
	bounds: undefined,
	obstacles: undefined,
	resizable: {
		localStorageKey: 'fracgui::resizable',
		grabberSize: 9,
		color: 'var(--bg-d)',
		sides: ['right'],
		corners: [],
	},
	draggable: {
		localStorageKey: 'fracgui::draggable',
		bounds: undefined,
	},
} as const satisfies WindowManagerOptions

export const GUI_DEFAULTS: GuiOptions = {
	__type: 'GuiOptions',
	title: 'gui',
	// controls: new Map(),
	// children: [],
	themer: true,
	themerOptions: {
		localStorageKey: 'fracgui::themer',
	},
	windowManager: undefined,
	windowManagerOptions: {
		...GUI_WINDOWMANAGER_DEFAULTS,
		resizable: {
			...GUI_WINDOWMANAGER_DEFAULTS.resizable,
			sides: ['right'],
			corners: [],
		},
	},
	storage: false,
	// storageOptions: GUI_STORAGE_DEFAULTS,
	closed: false,
	position: 'top-right',
	positionOptions: {
		margin: 16,
		bounds: 'body',
	},
	theme: 'default',
	// hidden: false,
	// _parentFolder: undefined,
	// depth: 0,
} as const

/**
 * The root Gui instance.  This is the entry point for creating
 * a gui.  You can create multiple root guis, but each gui
 * can only have one root.
 */
export class Gui {
	__type = 'Gui' as const

	id = nanoid()
	folder: Folder

	declare elements: GuiElements

	opts: GuiOptions
	closed: PrimitiveState<boolean>
	closedMap: State<Map<string, boolean>>
	presetManager!: PresetManager

	wrapper!: HTMLElement
	container!: HTMLElement
	settingsFolder: Folder
	static settingsFolderTitle = 'fracgui-settings-folder'

	themer?: Themer
	themeEditor?: ThemeEditor
	windowManager?: WindowManager
	undoManager = new UndoManager()
	private _theme: GuiOptions['theme']
	private _log: Logger

	// Forwarding the Folder API...
	on: Folder['on']
	addFolder: Folder['addFolder']
	add: Folder['add']
	addButtonGrid: Folder['addButtonGrid']
	addSelect: Folder['addSelect']
	addButton: Folder['addButton']
	addText: Folder['addText']
	addNumber: Folder['addNumber']
	addSwitch: Folder['addSwitch']
	addColor: Folder['addColor']

	constructor(options?: Partial<GuiOptions>) {
		//· Setup ····························································¬

		const opts = deepMerge([GUI_DEFAULTS, options ?? {}], { concatArrays: false }) as GuiOptions

		opts.container ??= document.body

		// Resolve storage separately since GUI_DEFAULTS.storage is `false`.
		if (typeof opts.storage === 'object') {
			opts.storage = Object.assign({}, GUI_STORAGE_DEFAULTS, opts.storage)
		}

		opts.position =
			opts.position ??
			// https://github.com/microsoft/TypeScript/issues/54825#issuecomment-1612948506
			(((opts.windowManagerOptions as WindowManagerOptions)?.draggable as DraggableOptions)
				?.position as Placement)

		this.opts = opts

		this.container = opts.container
		this.theme = opts.theme ?? 'default'

		this.wrapper = create('div', {
			classes: ['fracgui-wrapper'],
			style: {
				display: 'contents',
			},
			parent: this.container,
		})

		this.folder = new Folder({
			...opts,
			__type: 'FolderOptions',
			container: this.wrapper,
			// @ts-expect-error @internal
			gui: this,
		})

		this.on = this.folder.on
		this.addFolder = this.folder.addFolder
		this.add = this.folder.add
		this.addButtonGrid = this.folder.addButtonGrid
		this.addSelect = this.folder.addSelect
		this.addButton = this.folder.addButton
		this.addText = this.folder.addText
		this.addNumber = this.folder.addNumber
		this.addSwitch = this.folder.addSwitch
		this.addColor = this.folder.addColor

		this._log = new Logger(`Gui ${opts.title}`, { fg: 'palevioletred' })
		this._log.fn('constructor').info({ options, opts })

		const undo = (e: KeyboardEvent) => {
			// todo - make sure the active element is within the gui first
			if (!e.metaKey || e.key !== 'z') return
			e.preventDefault()
			e.shiftKey ? this.undoManager.redo() : this.undoManager.undo()
		}

		removeEventListener('keydown', undo)
		addEventListener('keydown', undo)
		//⌟

		//· State ····························································¬

		const storageOpts = resolveOpts(opts.storage, GUI_STORAGE_DEFAULTS)

		const closedKey =
			storageOpts && storageOpts.closed
				? (storageOpts.key += `::${opts.title?.toLowerCase().replaceAll(/\s/g, '-')}::closed`)
				: ''

		const closedMapKey =
			storageOpts && storageOpts.closed
				? (storageOpts.key += `::${opts.title?.toLowerCase().replaceAll(/\s/g, '-')}::closed-map`)
				: ''

		this.closed = state(!!this.opts.closed, {
			key: closedKey,
			// (storageOpts &&
			// 	storageOpts.key +
			// 		`::${opts.title?.toLowerCase().replaceAll(/\s/g, '-')}::closed`) ||
			// '',
		})

		// todo - Finish this whole "deep expanded persistence" thing with `closedMap`
		this.closedMap = state(new Map(), {
			key: closedMapKey,
			// key:
			// 	(storageOpts &&
			// 		storageOpts.key +
			// 			`::${opts.title?.toLowerCase().replaceAll(/\s/g, '-')}::closed-map`) ||
			// 	'',
		})

		// this.closedMap.setKey(this.title, this.closed.value)
		// todo - We will need to emit a close/open event from `Folder`, and listen for it here.
		// this.closedMap.subscribe(map => {
		// 	this.closed.set(!!map.get(this.title))
		// })
		//⌟

		this.folder.elements.toolbar.settingsButton = this.#createSettingsButton(
			this.folder.elements.toolbar.container,
		)
		this.settingsFolder = this.#createSettingsFolder()

		this.windowManager ??= this.#createWindowManager(options, storageOpts)

		//· Theme Editor ·····················································¬

		// if (isType(opts.storage, 'GuiStorageOptions')) {
		// 	this.opts = {
		// 		...opts,
		// 		storage: {
		// 			...opts.storage,
		// 			...storageOpts,
		// 		},
		// 	}
		// }

		// // todo - Uncomment this once it has a button.
		// if (opts.themer) {
		// 	this.themeEditor = new ThemeEditor(this)
		// }
		//⌟

		// if (this.closed.value) this.close()

		//· Reveal Animation ·················································¬

		this.#reveal()
		//⌟

		return this
	}

	async #reveal() {
		// Wait until the gui is fully constructed before positioning it
		// to make sure we can calculate the correct size and position.
		await Promise.resolve()

		// Append a non-animating, full-size clone to get the proper rect.
		const ghost = this.wrapper.cloneNode(true) as HTMLElement
		ghost.style.visibility = 'hidden'
		this.container.prepend(ghost)

		// This is the only way to get the correct future rect afaik.
		const rect = ghost.children[0].getBoundingClientRect()
		ghost.remove()

		if (this.opts.position && this.opts.positionOptions) {
			if (typeof this.opts.position === 'string') {
				const placementPosition = place(rect, this.opts.position, {
					bounds: this.opts.positionOptions.bounds ?? this.container,
					margin: this.opts.positionOptions.margin,
				})

				this.windowManager?.windows.at(-1)?.draggableInstance?.moveTo(placementPosition, 0)
			}
		}

		// Now that we're in position and inputs are loaded, we can animate-in.
		this.container.appendChild(this.wrapper)
		this.folder.element.animate([{ opacity: 0 }, { opacity: 1 }], {
			fill: 'none',
			duration: 400,
		})
	}

	#createWindowManager(options?: Partial<GuiOptions>, storageOpts?: GuiStorageOptions | false) {
		if (this.windowManager) return this.windowManager

		const dragOpts = resolveOpts<DraggableOptions>(
			(this.opts.windowManagerOptions as WindowManagerOptions)['draggable'],
			DRAGGABLE_DEFAULTS,
		)
		if (dragOpts) {
			dragOpts.handle = this.folder.elements.header
			dragOpts.bounds = this.container
		}

		const resizeOpts = resolveOpts<ResizableOptions>(
			(this.opts.windowManagerOptions as WindowManagerOptions)['resizable'],
			RESIZABLE_DEFAULTS,
		)
		if (resizeOpts) {
			resizeOpts.bounds = this.container
		}

		// Use the provided window manager if it's an instance.
		if (options?.windowManager instanceof WindowManager) {
			const windowManager = options.windowManager

			windowManager.add(this.folder.element, {
				id: this.folder.id,
				...this.opts.windowManagerOptions,
				// draggable: dragOpts,
				// resizable: resizeOpts,
			})

			return windowManager
		}

		const windowManagerOpts = resolveOpts<WindowManagerOptions>(
			this.opts.windowManagerOptions as WindowManagerOptions,
			WINDOWMANAGER_DEFAULTS,
		)

		//? Forward any storage options to the draggable and resizable options.
		if (storageOpts && storageOpts.key && windowManagerOpts) {
			if (typeof windowManagerOpts.draggable === 'object') {
				windowManagerOpts.draggable.localStorageKey = `${storageOpts.key}::${windowManagerOpts.draggable.localStorageKey}`
			}
			if (typeof windowManagerOpts.resizable === 'object') {
				windowManagerOpts.resizable.localStorageKey = `${storageOpts.key}::${windowManagerOpts.resizable.localStorageKey}`
			}
		}

		this._log
			.fn('constructor')
			.debug({ options, opts: this.opts, dragOptions: dragOpts, resizeOpts })

		const windowManager = new WindowManager({
			...windowManagerOpts,
			draggable: dragOpts,
			resizable: resizeOpts,
		})

		windowManager.add(this.folder.element, {
			draggable: dragOpts,
			resizable: resizeOpts,
		})

		return windowManager
	}

	set theme(theme: GuiTheme) {
		if (!this.themer) return
		this._theme = theme
		this.folder.element.setAttribute('theme', theme)
		this.folder.element.setAttribute('mode', this.themer.mode.value)
	}
	get theme() {
		return this._theme!
	}

	#createSettingsFolder() {
		const settingsFolder = this.folder.addFolder({
			title: Gui.settingsFolderTitle,
			closed: false,
			hidden: false,
			// @ts-expect-error @internal
			headerless: true,
		})

		if (this.opts.themer) {
			const themer = this.#createThemer(settingsFolder)
			if (themer) this.themer = themer
			// this.themeEditor = new ThemeEditor(this)
		}

		const { presets, defaultPreset, storage } = this.opts
		let storageKey: string | undefined
		if (isType(storage, 'GuiStorageOptions')) {
			if (storage?.presets) {
				storageKey = 'fracgui::presets'
			}
		}

		this.presetManager = new PresetManager(this, settingsFolder, {
			presets,
			defaultPreset,
			storageKey,
		})

		this.applyAltStyle(settingsFolder)

		return settingsFolder
	}

	/**
	 * Saves the current gui state as a preset.
	 */
	toJSON(
		/**
		 * The title of the preset.
		 */
		title: string,
		/**
		 * A unique id for the preset.
		 * @defaultValue {@link nanoid|nanoid(10)}
		 */
		id = nanoid(10),
	) {
		const preset: GuiPreset = {
			__type: 'GuiPreset',
			__version: 0,
			id,
			title,
			data: this.folder.toJSON(),
		} as const

		// this.presetManager.save(preset)
		return preset
	}

	/**
	 * Loads a given preset into the gui, updating all inputs.
	 */
	load(preset: GuiPreset) {
		this._log.fn('load').debug({ preset })

		this.folder.load(preset.data)
		// this.presetManager.set(preset)
		// this.presetManager.afterLoad(preset)
	}

	#createThemer(folder: Folder) {
		this._log.fn('createThemer').debug({ folder })
		let finalThemer = undefined as Themer | undefined
		const { themer, themerOptions, storage } = this.opts

		if (!BROWSER) throw new Error('Themer requires a browser environment.')

		if (themer) {
			if (themerOptions) {
				themerOptions.persistent = isType(storage, 'GuiStorageOptions')
					? storage.theme
					: true

				// Load up the default generated theme vars.
				themerOptions.vars = deepMerge([GUI_VARS, themerOptions.vars])
			}

			if (themer === true) {
				themerOptions.wrapper = this.wrapper
				// this.themer = new Themer(this.folder.root.element, themerOptions)
				finalThemer = new Themer(this.folder.element, themerOptions)
			} else {
				// this.themer = themer
				finalThemer = themer
			}

			this.folder.evm.add(
				finalThemer.mode.subscribe(() => {
					if (this.settingsFolder) {
						this.applyAltStyle(this.settingsFolder)
					}
				}),
			)

			if (folder) {
				folder.addSelect<Theme>({
					title: 'theme',
					labelKey: 'title',
					options: finalThemer.themes.value,
					binding: {
						target: finalThemer,
						key: 'theme',
					},
				})

				folder.addButtonGrid({
					title: 'mode',
					value: [
						['light', 'dark', 'system'].map(m => ({
							text: m,
							onClick: () => this.themer?.mode.set(m as ThemeMode),
							active: () => this.themer?.mode.value === m,
						})),
					],
				})
			}
		}

		return finalThemer
	}

	isGui(): this is Gui {
		return this.__type === 'Gui'
	}

	#createSettingsButton(parent: HTMLElement) {
		// if (!this.isGui()) {
		// 	throw new Error('Settings button can only be created on the root folder.')
		// }

		// const svg = new DOMParser().parseFromString(settingsIcon, 'image/svg+xml').documentElement

		const button = create<'button', any, HTMLButtonElement>('button', {
			parent,
			classes: ['fracgui-toolbar-item', 'fracgui-settings-button'],
			// children: [svg],
			innerHTML: settingsIcon,
			tooltip: {
				text: () => {
					return this.settingsFolder?.closed.value ? 'Open Settings' : 'Close Settings'
				},
				placement: 'left',
				delay: 750,
				delayOut: 0,
				hideOnClick: true,
			},
		})

		button.addEventListener('click', () => {
			this.settingsFolder.toggle()

			this.folder.elements.toolbar.settingsButton?.classList.toggle(
				'open',
				!this.settingsFolder.closed.value,
			)
		})

		return button
	}

	applyAltStyle(folder: Folder) {
		this.setProp(
			folder.elements.content,
			`box-shadow`,
			`0px 0px 10px 0px hsl(10deg, 0%, var(--${VAR_PREFIX}-shadow-lightness), inset`,
		)

		switch (this.themer?.activeMode) {
			case 'light': {
				this.setProps(folder.element, [
					['input-container_background', `rbga(var(--${VAR_PREFIX}-bg-b-rgb), 0.75)`],
					['input-container_color', `var(--${VAR_PREFIX}-fg-b)`],
					['folder-header_background', `rgba(var(--${VAR_PREFIX}-bg-a-rgb), 0.6)`],
					['controller_background', `rgba(var(--${VAR_PREFIX}-bg-a-rgb), 0.75)`],
				])
				break
			}
			case 'dark': {
				this.setProps(folder.element, [
					['input-container_background', `var(--${VAR_PREFIX}-bg-b)`],
					['input-container_color', `var(--${VAR_PREFIX}-fg-b)`],
					['folder-header_background', `rgba(var(--${VAR_PREFIX}-bg-a-rgb), 0.75)`],
					['controller-dim_background', `rgba(var(--${VAR_PREFIX}-bg-a-rgb), 0.5)`],
					['controller_background', `rgba(var(--${VAR_PREFIX}-bg-c-rgb), 0.5)`],
					['controller_outline', `rgba(var(--${VAR_PREFIX}-bg-a-rgb), 0.5)`],
				])

				break
			}
		}
	}

	setProp(el: HTMLElement, key: keyof PropertiesHyphen | (string & {}), value: string) {
		el.style.setProperty(`--${VAR_PREFIX}-${key}`, value)
		Promise.resolve().then(() => {
			if (!el.style.getPropertyValue(`--${VAR_PREFIX}-${key}`)) {
				console.warn(`No property found for --${VAR_PREFIX}-${key}`)
			}
		})
	}
	setProps(el: HTMLElement, props: [keyof PropertiesHyphen | (string & {}), string][]) {
		for (const [key, value] of props) {
			this.setProp(el, key, value)
		}
	}

	dispose = () => {
		this.themer?.dispose()
		// this.themeEditor?.dispose()
		this.windowManager?.dispose?.()
		this.settingsFolder.dispose()
		this.folder.dispose()
		this.container.remove()
	}
}
