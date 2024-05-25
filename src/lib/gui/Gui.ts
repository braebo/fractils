import './styles/gui.scss'

import type { WindowManagerOptions } from '../utils/windowManager'
import type { JavascriptStyleProperty } from '../css/types'
import type { ResizableOptions } from '../utils/resizable'
import type { DraggableOptions } from '../utils/draggable'
import type { Theme, ThemeMode } from '../themer/types'
import type { ThemerOptions } from '../themer/Themer'
import type { PrimitiveState } from '../utils/state'
import type { PropertiesHyphen } from 'csstype'
import type { Placement } from '../dom/place'
import type { FolderPreset } from './Folder'
import type { Commit } from './UndoManager'

import theme_default from './styles/themes/default'
import theme_scout from './styles/themes/scout'
import theme_flat from './styles/themes/flat'

import { WindowManager, WINDOWMANAGER_DEFAULTS } from '../utils/windowManager'
import settingsIcon from './svg/settings-icon.svg?raw'
import { deepMergeOpts } from './shared/deepMergeOpts'
import { ThemeEditor } from './styles/ThemeEditor'
import { resolveOpts } from './shared/resolveOpts'
import { PresetManager } from './PresetManager'
import { VAR_PREFIX } from './styles/GUI_VARS'
import { GUI_VARS } from './styles/GUI_VARS'
import { UndoManager } from './UndoManager'
import { Themer } from '../themer/Themer'
import { select } from '../utils/select'
import { nanoid } from '../utils/nanoid'
import { isType } from '../utils/isType'
import { Logger } from '../utils/logger'
import { create } from '../utils/create'
import { state } from '../utils/state'
import { place } from '../dom/place'
import { isMac } from '../utils/ua'
import { Folder } from './Folder'
import { o } from '../utils/l'

//· Types ························································································¬

type GuiTheme = 'default' | 'flat' | 'scour' | (string & {})

export interface GuiElements {
	root: HTMLElement
}

export interface GuiOptions {
	__type: 'GuiOptions'

	/**
	 * The title of the Gui.
	 * @defaultValue 'gooey'
	 */
	title: string

	/**
	 * Defines which properties to persist in localStorage, and under which
	 * key, if any.  If `true`, the {@link GUI_STORAGE_DEFAULTS} will be used.
	 * If `false`, no state will be persisted.
	 * @defaultValue false
	 */
	storage: boolean | Partial<GuiStorageOptions>

	/**
	 * The container to append the gui to.
	 * @defaultValue 'body'
	 */
	// container: HTMLElement
	container: string | HTMLElement | 'document' | 'body'

	/**
	 * Whether the gui is draggable.
	 * @defaultValue `true`
	 */
	draggable: boolean

	/**
	 * Whether the gui is resizable.
	 * @defaultValue `true`
	 */
	resizable: boolean

	/**
	 * The title of the theme to use for the gui.  To add your own themes,
	 * use {@link themerOptions.themes}.
	 * @defaultValue 'default'
	 */
	theme: GuiTheme

	/**
	 * The themes available to the gui.
	 */
	themes: Theme[]

	/**
	 * The initial {@link Themer.mode|theme mode}.
	 */
	themeMode: 'light' | 'dark' | 'system'

	/**
	 * The gui's initial position on the screen.  If `undefined`, the gui will
	 * be placed in the top-right corner of the screen.
	 *
	 * This value can either be a {@link Placement} string, or an object with
	 * `x` and `y` properties representing the position in pixels.
	 * @defaultValue 'top-right'
	 */
	position: Placement | { x: number; y: number }

	/**
	 * The margin in pixels to apply to the placement.  Can be a number
	 * to apply the same margin to both x and y, or an object with x
	 * and y properties to apply different margins to each axis.
	 * @default 16
	 */
	margin: number | { x: number; y: number }

	/**
	 * The initial expanded state of the gui.
	 * @defaultValue `false`
	 */
	closed: boolean

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

	/**
	 * @internal
	 */
	_windowManager?: WindowManager

	/**
	 * @internal
	 */
	_themer?: Themer
}

export interface GuiStorageOptions {
	__type: 'GuiStorageOptions'

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
	resizable: {
		grabberSize: 9,
		color: 'var(--bg-d)',
		sides: ['right', 'left'],
		corners: [],
	},
	draggable: {
		bounds: undefined,
		classes: {
			default: 'fracgui-draggable',
			dragging: 'fracgui-dragging',
			cancel: 'fracgui-cancel',
			dragged: 'fracgui-dragged',
		},
	},
} as const satisfies WindowManagerOptions

export const GUI_DEFAULTS = {
	__type: 'GuiOptions',
	title: 'gui',
	storage: false,
	closed: false,
	position: 'top-right',
	margin: 16,
	container: 'body',
	theme: 'default',
	themeMode: 'dark',
	themes: [theme_default, theme_flat, theme_scout],
	resizable: true,
	draggable: true,
} as const satisfies GuiOptions
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
	opts: GuiOptions & { storage: GuiStorageOptions | false }

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

	themer: Themer
	themeEditor?: ThemeEditor
	windowManager?: WindowManager

	/**
	 * `false` if this {@link Gui}'s {@link WindowManager} belongs to an existing, external
	 * instance _(i.e. a separate {@link Gui} instance or custom {@link WindowManager})_.  The
	 * {@link WindowManager} will be disposed when this {@link Gui} is disposed.
	 */
	private _isWindowManagerOwner = false

	private _theme!: GuiOptions['theme']
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
		//· Setup ················································································¬

		const opts = deepMergeOpts([GUI_DEFAULTS, options ?? {}], {
			concatArrays: false,
		}) as GuiOptions

		opts.container ??= document.body

		let reposition = false
		/** Resolve storage separately since {@link GUI_DEFAULTS.storage} is `false`.  */
		if (typeof opts.storage === 'object') {
			opts.storage = Object.assign({}, GUI_STORAGE_DEFAULTS, opts.storage)
		}

		const storageOpts = resolveOpts(opts.storage, GUI_STORAGE_DEFAULTS)
		if (storageOpts) {
			opts.storage = {
				...storageOpts,
				key: `${storageOpts.key}::${opts.title?.toLowerCase().replaceAll(/\s/g, '-')}`,
			}
			// When storage is on, repositioning after animating-in is disabled unless this is the
			// very first page load.
			if (!(`${opts.storage.key}::wm::0::position` in localStorage)) {
				reposition = true
			}
		}

		this.opts = opts as GuiOptions & { storage: GuiStorageOptions | false }

		this._log = new Logger(`Gui ${this.opts.title}`, { fg: 'palevioletred' })
		this._log.fn('constructor').info({ options, opts })

		this.container = select(this.opts.container)[0]

		this.wrapper = create('div', {
			classes: ['fracgui-wrapper'],
			style: {
				display: 'contents',
			},
			parent: this.container,
		})

		this.folder = new Folder({
			...this.opts,
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

		this.closed = state(!!this.opts.closed, {
			key: this.opts.storage ? `${this.opts.storage.key}::closed` : undefined,
		})

		this.folder.elements.toolbar.settingsButton = this._createSettingsButton(
			this.folder.elements.toolbar.container,
		)

		this.settingsFolder = this.folder.addFolder({
			title: Gui.settingsFolderTitle,
			// closed: true, //! TEMP
			closed: false, //! TEMP
			hidden: false,
			// @ts-expect-error @internal
			_headerless: true,
		})

		this.themer = this.opts._themer ?? this._createThemer(this.settingsFolder)
		this.theme = this.opts.theme
		this.presetManager = this._createPresetManager(this.settingsFolder)

		// todo - convert this crap to an 'alt' class
		this.applyAltStyle(this.settingsFolder)

		this.windowManager ??= this._createWindowManager(this.opts, this.opts.storage)

		this._reveal(reposition)

		return this
	}

	private async _reveal(reposition: boolean) {
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
		if (typeof this.opts.position === 'string') {
			const placementPosition = place(rect, this.opts.position, {
				bounds: this.opts.container,
				margin: this.opts.margin,
			})

			// Use the rect to correct the window manager's positioning when storage is off.
			if (reposition || (this.opts.storage && this.opts.storage.position === false)) {
				const win = this.windowManager?.windows.get(this.folder.element.id)
				if (win?.draggableInstance) {
					win.draggableInstance.position = placementPosition
				}
			} else {
				/** // todo
				 * Should we just enforce the window manager and use it for positioning?
				 * I imagine this folder element shouldn't be positioned if it has no window manager...
				 * but when I disabled all logic here, the folder position was top and centered,
				 * which I'm not sure is correct (might be though..).  Anyways, if the position option
				 * was provided but the window manager is disabled, we should probably set the position here.
				 */
				console.error('//todo - set position here or enforce window manager')
			}
		}

		// Now that we're in position and inputs are loaded, we can animate-in.
		this.container.appendChild(this.wrapper)
		this.folder.element.animate([{ opacity: 0 }, { opacity: 1 }], {
			fill: 'none',
			duration: 400,
		})
	}

	_createPresetManager(settingsFolder: Folder) {
		const { presets, defaultPreset, storage } = this.opts
		let storageKey: string | undefined
		if (isType(storage, 'GuiStorageOptions') && storage.presets) {
			storageKey = storage.key + '::presets'
		}

		return new PresetManager(this, settingsFolder, {
			presets,
			defaultPreset,
			storageKey,
		})
	}

	private _createWindowManager(
		options: Partial<GuiOptions>,
		storageOpts: typeof this.opts.storage,
	) {
		if (this.windowManager) return this.windowManager // ??

		let dragOpts = undefined as Partial<DraggableOptions> | undefined
		if (this.opts.draggable) {
			dragOpts = Object.assign({}, GUI_WINDOWMANAGER_DEFAULTS.draggable)
			dragOpts.handle = this.folder.elements.header
			dragOpts.position = this.opts.position
			dragOpts.localStorageKey = storageOpts && storageOpts.key ? storageOpts.key : undefined
			dragOpts.bounds = this.container
			if (storageOpts && storageOpts.position === false) {
				dragOpts.localStorageKey = undefined
			}
		}

		let resizeOpts = undefined as Partial<ResizableOptions> | undefined
		if (this.opts.resizable) {
			resizeOpts = Object.assign({}, GUI_WINDOWMANAGER_DEFAULTS.resizable)
			resizeOpts.bounds = this.container
			resizeOpts.localStorageKey =
				storageOpts && storageOpts.key ? storageOpts.key : undefined
			if (storageOpts && storageOpts.size === false) {
				resizeOpts.localStorageKey = undefined
			}
		}

		// Use the provided window manager if it's an instance.
		if (options?._windowManager instanceof WindowManager) {
			const windowManager = options._windowManager

			windowManager.add(this.folder.element, {
				id: this.id,
				resizable: resizeOpts,
				draggable: dragOpts,
			})

			return windowManager
		}

		const windowManagerOpts = resolveOpts<WindowManagerOptions>(
			{
				...GUI_WINDOWMANAGER_DEFAULTS,
				draggable: dragOpts,
				resizable: resizeOpts,
			},
			WINDOWMANAGER_DEFAULTS,
		)

		this._log
			.fn('_createWindowManager')
			.debug({ windowManagerOpts, options, opts: this.opts, dragOpts, resizeOpts })

		const windowManager = new WindowManager({
			...windowManagerOpts,
			draggable: dragOpts,
			resizable: resizeOpts,
		})
		this._isWindowManagerOwner = true

		windowManager.add(this.folder.element, {
			id: this.id,
			// The rest of the options will inherit from the WindowManager instance.
		})

		return windowManager
	}

	set theme(theme: GuiTheme) {
		this._theme = theme
		this.folder.element.setAttribute('theme', theme)
		this.folder.element.setAttribute('mode', this.themer.mode.value)
	}
	get theme() {
		return this._theme!
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
		const themer = this.opts._themer
		const themerOptions: Partial<ThemerOptions> = {
			localStorageKey: this.opts.storage ? this.opts.storage.key + '::themer' : undefined,
			mode: this.opts.themeMode,
			autoInit: !this.themer,
			persistent: !!(this.opts.storage && this.opts.storage.theme),
			themes: this.opts.themes,
			theme: this.opts.themes.find(t => t.title === this.opts.theme),
			vars: GUI_VARS,
		}
		themerOptions.vars = deepMergeOpts([GUI_VARS, themerOptions.vars])

		if (themer) {
			finalThemer = themer
		} else {
			themerOptions.wrapper = this.wrapper
			finalThemer = new Themer(this.folder.element, themerOptions)
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
			// }
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

	// todo - convert this crap to an 'alt' class
	applyAltStyle(folder: Folder) {
		this._setVar(
			folder.elements.content,
			`box-shadow`,
			`0px 0px 10px 0px hsl(10deg, 0%, var(--${VAR_PREFIX}-shadow-lightness), inset`,
		)

		folder.elements.content.style.setProperty('background', `--${VAR_PREFIX}-folder_background`)

		this._setProps(folder.element, [
			['background', `color-mix(in sRGB, var(--${VAR_PREFIX}-bg-b) 100%, transparent)`],
		])

		switch (this.themer?.activeMode) {
			case 'dark': {
				this._setVars(folder.elements.contentWrapper, [
					//- ['input-container_background', `var(--${VAR_PREFIX}-bg-b)`],
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
				])

				break
			}
			case 'light': {
				this._setVars(folder.elements.contentWrapper, [
					[
						'folder-header_background',
						`color-mix(in sRGB, var(--${VAR_PREFIX}-bg-a) 60%, transparent)`,
					],
					['controller_background', `var(--${VAR_PREFIX}-light-a)`],
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
