import './styles/gui.scss'

import type { WindowManagerOptions } from '../utils/windowManager'
import type { Placement, PlacementOptions } from '../dom/place'
import type { JavascriptStyleProperty } from '../css/types'
import type { ResizableOptions } from '../utils/resizable'
import type { DraggableOptions } from '../utils/draggable'
import type { Theme, ThemeMode } from '../themer/types'
import type { ThemerOptions } from '../themer/Themer'
import type { PrimitiveState } from '../utils/state'
import type { PropertiesHyphen } from 'csstype'
import type { FolderPreset } from './Folder'
import type { Commit } from './UndoManager'

import { WindowManager, WINDOWMANAGER_DEFAULTS } from '../utils/windowManager'
import { RESIZABLE_DEFAULTS } from '../utils/resizable'
import { DRAGGABLE_DEFAULTS } from '../utils/draggable'
import { ThemeEditor, Themer } from '../themer/Themer'
import settingsIcon from './svg/settings-icon.svg?raw'
import { deepMergeOpts } from './shared/deepMergeOpts'
import { resolveOpts } from './shared/resolveOpts'
import { PresetManager } from './PresetManager'
import { VAR_PREFIX } from './styles/GUI_VARS'
import { GUI_VARS } from './styles/GUI_VARS'
import { UndoManager } from './UndoManager'
import { nanoid } from '../utils/nanoid'
import { isType } from '../utils/isType'
import { Logger } from '../utils/logger'
import { create } from '../utils/create'
import { state } from '../utils/state'
import { BROWSER } from '../utils/env'
import { place } from '../dom/place'
import { isMac } from '../utils/ua'
import { Folder } from './Folder'
import { o } from '../utils/l'

//· Types ························································································¬

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
	 * @defaultValue { margin: 16, bounds: 'body' }
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
	 * @defaultValue `"fractils::gui"`
	 */
	key: string

	/**
	 * Whether to persist the folder's expanded state.
	 * @defaultValue `true`
	 */
	closed?: boolean

	/**
	 * Whether to persist the theme.
	 * @defaultValue `true`
	 */
	theme?: boolean

	/**
	 * Whether to persist the gui's position.
	 * @defaultValue `false`
	 */
	position?: boolean

	/**
	 * Whether to persist the gui's size.
	 * @defaultValue `false`
	 */
	size?: boolean

	/**
	 * Whether to persist the gui's presets.
	 * @defaultValue `true`
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

//· Constants ····················································································¬

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
	localStorage: { key: 'fracgui' },
	resizable: {
		grabberSize: 9,
		color: 'var(--bg-d)',
		sides: ['right'],
		corners: [],
	},
	draggable: {
		bounds: undefined,
	},
} as const satisfies WindowManagerOptions

export const GUI_DEFAULTS: GuiOptions = {
	__type: 'GuiOptions',
	title: 'gui',
	themer: true,
	themerOptions: {
		localStorageKey: 'fracgui::themer',
		mode: 'dark',
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
	closed: false,
	position: 'top-right',
	positionOptions: {
		margin: 16,
		bounds: 'body',
	},
	theme: 'default',
} as const
//⌟

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

	/**
	 * The initial options passed to the gui.
	 */
	opts: GuiOptions

	/**
	 * Whether the gui root folder is currently collapsed.
	 */
	closed: PrimitiveState<boolean>

	/**
	 * The {@link PresetManager} instance for the gui.
	 */
	presetManager!: PresetManager

	/**
	 * Whether any of the inputs have been changed from their default values in the active preset.
	 */
	dirty = false

	wrapper!: HTMLElement
	container!: HTMLElement
	settingsFolder: Folder
	static settingsFolderTitle = 'fracgui-settings-folder'

	/**
	 * The {@link UndoManager} instance for the gui, handling undo/redo functionality.
	 * @internal
	 */
	_undoManager = new UndoManager()

	themer?: Themer
	themeEditor?: ThemeEditor
	windowManager?: WindowManager
	/**
	 * `false` if this {@link Gui}'s {@link WindowManager} belongs to an existing, external
	 * instance _(i.e. a separate {@link Gui} instance or custom {@link WindowManager})_.  The
	 * {@link WindowManager} will be disposed when this {@link Gui} is disposed.
	 */
	private _isWindowManagerOwner = false

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

		const opts = deepMergeOpts([GUI_DEFAULTS, options ?? {}], {
			concatArrays: false,
		}) as GuiOptions

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

		// Not stoked about this.
		this.on = this.folder.on.bind(this.folder)
		this.addFolder = this.folder.addFolder.bind(this.folder)
		this.add = this.folder.add.bind(this.folder)
		this.addButtonGrid = this.folder.addButtonGrid.bind(this.folder)
		this.addSelect = this.folder.addSelect.bind(this.folder)
		this.addButton = this.folder.addButton.bind(this.folder)
		this.addText = this.folder.addText.bind(this.folder)
		this.addNumber = this.folder.addNumber.bind(this.folder)
		this.addSwitch = this.folder.addSwitch.bind(this.folder)
		this.addColor = this.folder.addColor.bind(this.folder)

		this._log = new Logger(`Gui ${opts.title}`, { fg: 'palevioletred' })
		this._log.fn('constructor').info({ options, opts })

		const handleUndoRedo = (e: KeyboardEvent) => {
			if (isMac()) {
				if (e.metaKey && e.key === 'z') {
					e.preventDefault()
					e.shiftKey ? this._undoManager.redo() : this._undoManager.undo()
				}
			} else if (e.ctrlKey) {
				if (e.key === 'z') {
					e.preventDefault()
					this._undoManager.undo()
				}

				if (e.key === 'y') {
					e.preventDefault()
					this._undoManager.redo()
				}
			}
		}

		removeEventListener('keydown', handleUndoRedo)
		addEventListener('keydown', handleUndoRedo)
		//⌟

		//· State ····························································¬

		const storageOpts = resolveOpts(opts.storage, GUI_STORAGE_DEFAULTS)

		const closedKey =
			storageOpts && storageOpts.closed
				? (storageOpts.key += `::${opts.title?.toLowerCase().replaceAll(/\s/g, '-')}::closed`)
				: ''

		this.closed = state(!!this.opts.closed, {
			key: closedKey,
		})
		//⌟

		this.folder.elements.toolbar.settingsButton = this._createSettingsButton(
			this.folder.elements.toolbar.container,
		)
		this.settingsFolder = this._createSettingsFolder()

		this.windowManager ??= this._createWindowManager(options, storageOpts)

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

		this._reveal()

		return this
	}

	private async _reveal() {
		// Wait until the gui is fully constructed before positioning it
		// to make sure we can calculate the correct size and position.
		await Promise.resolve()

		// In case dispose() was called before this resolved...
		if (!this.container) return

		// Append a non-animating, full-size clone to get the proper rect.
		const ghost = this.wrapper.cloneNode(true) as HTMLElement
		ghost.style.visibility = 'hidden'
		this.container.prepend(ghost)

		// This is the only way to get the correct future rect afaik 😅
		const rect = ghost.children[0].getBoundingClientRect()
		ghost.remove()
		if (this.opts.positionOptions && typeof this.opts.position === 'string') {
			const placementPosition = place(rect, this.opts.position, {
				bounds: this.opts.positionOptions.bounds ?? this.container,
				margin: this.opts.positionOptions.margin,
			})

			if (this.windowManager) {
				;[...this.windowManager.windows]
					.at(-1)?.[1]
					?.draggableInstance?.moveTo(placementPosition, 0)
			} else {
				// todo - i imagine this folder element shouldn't be positioned if it has no window manager... but when I disabled all logic here, the folder position was top and centered, which I'm not sure is correct (might be though..).  Anyways, if the position option was provided but the window manager is disabled, we should probably set the position here.  Or, should we just enforce the window manager and use it for positioning?
				console.error('//TODO')
			}
		}

		// Now that we're in position and inputs are loaded, we can animate-in.
		this.container.appendChild(this.wrapper)
		this.folder.element.animate([{ opacity: 0 }, { opacity: 1 }], {
			fill: 'none',
			duration: 400,
		})
	}

	private _createWindowManager(
		options?: Partial<GuiOptions>,
		storageOpts?: GuiStorageOptions | false,
	) {
		if (this.windowManager) return this.windowManager // ??

		const dragOpts = resolveOpts<DraggableOptions>(
			(this.opts.windowManagerOptions as WindowManagerOptions)['draggable'],
			DRAGGABLE_DEFAULTS,
		)
		if (dragOpts) {
			dragOpts.handle = this.folder.elements.header
			dragOpts.bounds = this.container
			if (options?.position) {
				dragOpts.position = options.position
			}
			// If storage is disabled, we need to override the DRAGGABLE_DEFAULTS.localStorageKey.
			if (options?.storage === false) {
				dragOpts.localStorageKey = undefined
			}
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
				resizable: resizeOpts,
				draggable: dragOpts,
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
		this._isWindowManagerOwner = true

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

	private _createSettingsFolder() {
		const settingsFolder = this.folder.addFolder({
			title: Gui.settingsFolderTitle,
			// closed: true, //! TEMP
			closed: false, //! TEMP
			hidden: false,
			// @ts-expect-error @internal
			headerless: true,
		})

		if (this.opts.themer) {
			const themer = this._createThemer(settingsFolder)
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
	save(
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
			data: this.folder.save(),
		} as const

		// this.presetManager.save(preset)
		return preset
	}

	/**
	 * Loads a given preset into the gui, updating all inputs.
	 */
	load(preset: GuiPreset) {
		this._log.fn('load').debug({ preset })

		// todo - this isn't working, it's being unset immediately somewhere...
		this.dirty = false

		this.lockCommits(preset)
		this.folder.load(preset.data)
		Promise.resolve().then(() => this.unlockCommits())
	}

	_undoLock = false
	lockCommit: { from: GuiPreset | undefined } = { from: undefined }

	/**
	 * Commits a change to the input's value to the undo manager.
	 */
	commit(commit: Partial<Commit>) {
		if (this._undoLock) {
			this._log.fn('commit').info('LOCKED: prevented commit while locked')
			return
		}
		this._log.fn('commit').info('commited', commit)
		this._undoManager?.commit(commit as Commit)
	}

	/**
	 * Prevents the input from registering undo history, storing the initial
	 * for the eventual commit in {@link unlockCommits}.
	 */
	private lockCommits = (from: GuiPreset) => {
		// this._undoLock = true
		this._undoManager.lockedExternally = true
		this.lockCommit.from = from
		this._log.fn(o('lock')).info('commit', { from, lockCommit: this.lockCommit })
	}

	/**
	 * Unlocks commits and saves the current commit stored in lock.
	 */
	private unlockCommits = (commit?: Partial<Commit>) => {
		commit ??= {}
		commit.target ??= this as any
		commit.from ??= this.lockCommit.from

		// this._undoLock = false
		this._undoManager.lockedExternally = false
		this.commit(commit)

		this._log.fn(o('unlock')).info('commit', { commit, lockCommit: this.lockCommit })
	}

	private _createThemer(folder: Folder) {
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
				themerOptions.vars = deepMergeOpts([GUI_VARS, themerOptions.vars])
			}

			if (themer === true) {
				themerOptions.wrapper = this.wrapper
				finalThemer = new Themer(this.folder.element, themerOptions)
			} else {
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
					activeOnClick: true,
					value: [
						['light', 'dark', 'system'].map(m => ({
							text: m,
							onClick: () => finalThemer?.mode.set(m as ThemeMode),
							active: () => finalThemer?.mode.value === m,
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

	private _createSettingsButton(parent: HTMLElement) {
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
		this._setVar(
			folder.elements.content,
			`box-shadow`,
			`0px 0px 10px 0px hsl(10deg, 0%, var(--${VAR_PREFIX}-shadow-lightness), inset`,
		)

		// folder.elements.content.style.setProperty('--fracgui-folder_background', `color-mix(in sRGB, var(--${VAR_PREFIX}-bg-b) 75%, transparent)`, 'important')
		// folder.elements.contentWrapper.style.background = `color-mix(in sRGB, var(--${VAR_PREFIX}-bg-b) 75%, transparent)`
		folder.elements.content.style.setProperty(
			'background',
			// `--${VAR_PREFIX}-input-container_background`,
			`--${VAR_PREFIX}-folder_background`,
		)

		this._setProps(folder.element, [
			['background', `color-mix(in sRGB, var(--${VAR_PREFIX}-bg-b) 100%, transparent)`]
		])

		// todo - Are any of these doing anything post-refactor?
		switch (this.themer?.activeMode) {
			case 'light': {
				this._setVars(folder.element, [
					// ['input-container_background', `color-mix(in sRGB, var(--${VAR_PREFIX}-bg-b) 75%, transparent)`],
					[
						'folder_background',
						`color-mix(in sRGB, var(--${VAR_PREFIX}-bg-b) 75%, transparent)`,
					],
					['input-container_color', `var(--${VAR_PREFIX}-fg-b)`],
					[
						'folder-header_background',
						`color-mix(in sRGB, var(--${VAR_PREFIX}-bg-a) 60%, transparent)`,
					],
					[
						'controller_background',
						`color-mix(in sRGB, var(--${VAR_PREFIX}-bg-a) 75%, transparent)`,
					],
				])
				break
			}
			case 'dark': {
				// this._setProps(folder.element, [
				this._setVars(folder.elements.contentWrapper, [
					// ['input-container_background', `var(--${VAR_PREFIX}-bg-b)`],
					[
						'folder_background',
						`color-mix(in sRGB, var(--${VAR_PREFIX}-bg-b) 75%, transparent)`,
					],
					['input-container_color', `var(--${VAR_PREFIX}-fg-b)`],
					[
						'folder-header_background',
						`color-mix(in sRGB, var(--${VAR_PREFIX}-bg-a) 75%, transparent)`,
					],
					[
						'controller-dim_background',
						`color-mix(in sRGB, var(--${VAR_PREFIX}-bg-a) 50%, transparent)`,
					],
					[
						'controller_background',
						`color-mix(in sRGB, var(--${VAR_PREFIX}-bg-c) 50%, transparent)`,
					],
					[
						'controller_outline',
						`color-mix(in sRGB, var(--${VAR_PREFIX}-bg-a) 50%, transparent)`,
					],
				])

				break
			}
		}
	}

	private _setProps(el: HTMLElement, props: [JavascriptStyleProperty | (string & {}), string][]) {
		for (const [k, v] of props) {
			el.style.setProperty(k, v)
		}
	}

	private _setVar(el: HTMLElement, key: keyof PropertiesHyphen | (string & {}), value: string) {
		el.style.setProperty(`--${VAR_PREFIX}-${key}`, value)
		Promise.resolve().then(() => {
			if (!el.style.getPropertyValue(`--${VAR_PREFIX}-${key}`)) {
				console.warn(`No property found for --${VAR_PREFIX}-${key}`)
			}
		})
	}
	private _setVars(el: HTMLElement, props: [keyof PropertiesHyphen | (string & {}), string][]) {
		for (const [key, value] of props) {
			this._setVar(el, key, value)
		}
	}

	dispose = () => {
		this._log.fn('dispose').info(this)
		this.themer?.dispose()
		// this.themeEditor?.dispose()
		if (this._isWindowManagerOwner) {
			this.windowManager?.dispose()
			this.container?.remove()
		}
		this.settingsFolder?.dispose()
		this.folder?.dispose()
	}
}
