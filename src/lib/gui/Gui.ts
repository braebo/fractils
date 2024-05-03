import './gui.scss'

import type { WindowManagerOptions } from '../utils/windowManager'
import type { Placement, PlacementOptions } from '../dom/place'
import type { FolderElements, FolderOptions, FolderPreset } from './Folder'
import type { PrimitiveState, State } from '../utils/state'
import type { ResizableOptions } from '../utils/resizable'
import type { DraggableOptions } from '../utils/draggable'
import type { ThemerOptions } from '../themer/Themer'
import type { Tooltip } from '../actions/tooltip'
import type { ThemeMode } from '../themer/types'

import { WindowManager, WINDOWMANAGER_DEFAULTS } from '../utils/windowManager'
import { RESIZABLE_DEFAULTS } from '../utils/resizable'
import { code } from '../../routes/demo/gui/demoGui'
import { UndoManager } from '../utils/undoManager'
import { resolveOpts } from './shared/resolveOpts'
import { DRAG_DEFAULTS } from '../utils/draggable'
// import { ThemeEditor } from '../themer/Themer'
import { deepMerge } from '../utils/deepMerge'
import { Themer } from '../themer/Themer'
import { Logger } from '../utils/logger'
import { create } from '../utils/create'
import { VAR_PREFIX } from './GUI_VARS'
import { state } from '../utils/state'
import { GUI_VARS } from './GUI_VARS'
import { place } from '../dom/place'
import { Folder } from './Folder'
import { BROWSER } from 'esm-env'

type GuiTheme = 'default' | 'minimal' | (string & {})

export interface GuiElements extends FolderElements {
	toolbar: {
		container: HTMLElement
		settingsButton: HTMLButtonElement & { tooltip?: Tooltip }
	}
}

export interface GuiOptions extends Omit<FolderOptions, 'parentFolder'> {
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
	placementOptions?: Partial<PlacementOptions>
	/**
	 * The initial expanded state of the gui.
	 * @defaultValue false
	 */
	closed: boolean
	/**
	 * `parentFolder` should always be `undefined` for the root gui.
	 * @private
	 * @internal
	 */
	_parentFolder: undefined
}

export interface GuiStorageOptions {
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
}

export const GUI_STORAGE_DEFAULTS: GuiStorageOptions = {
	key: 'fracgui',
	closed: true,
	theme: true,
} as const

export const GUI_WINDOWMANAGER_DEFAULTS: WindowManagerOptions = {
	preserveZ: false,
	zFloor: 0,
	bounds: 'window',
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
	},
}

export const GUI_DEFAULTS: GuiOptions = {
	title: 'gui',
	controls: new Map(),
	children: [],
	themer: true,
	themerOptions: {
		localStorageKey: 'fracgui::themer',
	},
	windowManager: undefined,
	windowManagerOptions: GUI_WINDOWMANAGER_DEFAULTS,
	storage: false,
	closed: false,
	position: 'top-right',
	placementOptions: {
		margin: 16,
		bounds: 'window',
	},
	theme: 'default',
	hidden: false,
	_parentFolder: undefined,
	depth: 0,
} as const

/**
 * The root Gui instance.  This is the entry point for creating
 * a gui.  You can create multiple root guis, but each gui
 * can only have one root.
 */
export class Gui extends Folder {
	isRoot = true as const

	declare elements: GuiElements

	opts: GuiOptions
	closed: PrimitiveState<boolean>
	closedMap: State<Map<string, boolean>>
	presets: State<Map<string, FolderPreset>>
	activePreset = state({} as FolderPreset)
	#presetSnapshot: FolderPreset | undefined

	wrapper!: HTMLElement
	container!: HTMLElement
	settingsFolder: Folder
	static settingsFolderTitle = 'fracgui-settings-folder'

	themer?: Themer
	// themeEditor?: ThemeEditor // todo
	windowManager?: WindowManager
	undoManager = new UndoManager()

	private _theme: GuiOptions['theme']

	#log: Logger

	constructor(options?: Partial<GuiOptions>) {
		//· Setup ····························································¬

		const opts = deepMerge(GUI_DEFAULTS, options ?? {}) as GuiOptions
		// Resolve storage separately since GUI_DEFAULTS.storage is `false`.
		opts.storage = resolveOpts(opts.storage, GUI_STORAGE_DEFAULTS)
		opts.container ??= document.body
		opts.position =
			opts.position ??
			// https://github.com/microsoft/TypeScript/issues/54825#issuecomment-1612948506
			(((opts.windowManagerOptions as WindowManagerOptions)?.draggable as DraggableOptions)
				?.position as Placement)
		opts.windowManagerOptions

		super(opts as any as FolderOptions, opts.container)

		this.opts = opts
		this.root = this
		this.container = opts.container
		this.presets = state(new Map(), { key: 'fracgui::presets' })

		this.#log = new Logger('Gui:' + opts.title, { fg: 'palevioletred' })
		this.#log.fn('constructor').info({ options, opts, this: this })

		this.wrapper = create('div', {
			classes: ['fracgui-wrapper'],
			style: {
				display: 'contents',
			},
			children: [this.element],
		})

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

		if (typeof storageOpts === 'object') {
			storageOpts.key += `::${opts.title?.toLowerCase().replaceAll(/\s/g, '-')}::closed`
		}

		this.closed = state(this.opts.closed, {
			key:
				(storageOpts &&
					storageOpts.key +
						`::${opts.title?.toLowerCase().replaceAll(/\s/g, '-')}::closed`) ||
				'',
		})

		// todo - Finish this whole "deep expanded persistence" thing with `closedMap`
		this.closedMap = state(new Map(), {
			key:
				(storageOpts &&
					storageOpts.key +
						`::${opts.title?.toLowerCase().replaceAll(/\s/g, '-')}::closed-map`) ||
				'',
		})
		this.closedMap.setKey(this.title, this.closed.value)
		// todo - We will need to emit a close/open event from `Folder`, and listen for it here.
		this.closedMap.subscribe(map => {
			this.closed.set(map.get(this.title) ?? false)
		})
		//⌟

		this.settingsFolder = this.#createSettingsFolder()

		this.windowManager ??= this.#createWindowManager(options, storageOpts)

		//· Theme Editor ·····················································¬

		// todo - Uncomment this once it has a button.
		if (this.themer) {
			// this.themeEditor = new ThemeEditor(this, {
			// 	title: 'Theme Editor',
			// 	themer: false, // Prevents infinite recursion.
			// 	windowManager: this.windowManager, // Recycling!
			// 	storage: {
			// 		// This is smelly.
			// 		key: storageOpts ? storageOpts.key : '',
			// 	},
			// 	// hidden: true,
			// })
		}
		//⌟

		if (this.closed.value) this.close()

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

		// This is the only to get the correct future rect afaik.
		const rect = ghost.children[0].getBoundingClientRect()
		ghost.remove()

		if (this.opts.position && this.opts.placementOptions) {
			if (typeof this.opts.position === 'string') {
				const placementPosition = place(rect, this.opts.position, {
					bounds: this.opts.placementOptions.bounds ?? this.container,
					margin: this.opts.placementOptions.margin,
				})

				this.windowManager?.windows.at(-1)?.draggableInstance?.moveTo(placementPosition, 0)
			}
		}

		// Now that we're in position and inputs are loaded, we can animate-in.
		this.container.appendChild(this.wrapper)
		this.element.animate([{ opacity: 0 }, { opacity: 1 }], {
			fill: 'none',
			duration: 400,
		})
	}

	#createWindowManager(options?: Partial<GuiOptions>, storageOpts?: GuiStorageOptions | false) {
		if (this.windowManager) return this.windowManager

		const dragOpts = resolveOpts<DraggableOptions>(
			(this.opts.windowManagerOptions as WindowManagerOptions)['draggable'],
			DRAG_DEFAULTS,
		)
		if (dragOpts) {
			dragOpts.handle = this.elements.header
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

			windowManager.add(this.wrapper, {
				draggable: dragOpts,
				resizable: resizeOpts,
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

		this.#log
			.fn('constructor')
			.info({ options, opts: this.opts, dragOptions: dragOpts, resizeOpts })

		const windowManager = new WindowManager({
			...windowManagerOpts,
			draggable: dragOpts,
			resizable: resizeOpts,
		})

		windowManager.add(this.element, {
			draggable: dragOpts,
			resizable: resizeOpts,
		})

		return windowManager
	}

	set theme(theme: GuiTheme) {
		if (!this.themer) return
		this._theme = theme
		this.root.element.setAttribute('theme', theme)
		this.root.element.setAttribute('mode', this.themer.mode.value)
	}
	get theme() {
		return this._theme!
	}

	#createSettingsFolder() {
		const settingsFolder = this.addFolder({
			title: Gui.settingsFolderTitle,
			// closed: true,
			closed: false,
			header: false,
			hidden: false,
		})

		this.#createThemer(settingsFolder)
		this.#createPresetsFolder(settingsFolder)

		this.#applyAltStyle(settingsFolder)

		return settingsFolder
	}

	#createPresetsFolder(parentFolder: Folder) {
		const presetsFolder = parentFolder.addFolder({
			title: 'presets',
			// closed: true,
			closed: false,
		})
		// const presetsFolder = parentFolder
		const presetTitle = presetsFolder.addText({
			title: 'title',
			value: 'preset' + (this.presets.value.size ? ` (${this.presets.value.size})` : ''),
		})
		presetTitle.on('change', v => {
			console.log(v)
			// const curr = this.presets.value.get(v)
			// if (saveBtn) {
			// 	if (curr) {
			// 		console.log('preset exists', v)
			// 		saveBtn.element.innerText = 'overwrite'
			// 	} else {
			// 		saveBtn.element.innerText = 'save'
			// 	}
			// }
			// if (curr && this.activePresetId.value === curr.presetId) {
			// 	renameBtn?.element.classList.add('disabled')
			// }
		})

		const btnGrid = presetsFolder.addButtonGrid({
			title: 'manage',
			value: [
				[
					{
						label: 'save',
						onClick: () => {
							const preset = this.save(presetTitle.value)
							console.log(preset)
							code.set(`const preset = ${JSON.stringify(preset, null, 2)}`)
							this.presets.setKey(preset.presetTitle!, preset)
							console.log(this.presets.value)
						},
					},
					{
						label: 'rename',
						onClick: () => {
							this.#renamePreset(presetTitle.value)
						},
					},
					{
						label: 'delete',
						onClick: () => {},
					},
				],
			],
		})

		const saveBtn = btnGrid.buttons.get('save')
		const renameBtn = btnGrid.buttons.get('rename')
		const deleteBtn = btnGrid.buttons.get('delete')
		saveBtn
		renameBtn
		deleteBtn

		// Let the folders load before saving the default preset.
		Promise.resolve().then(() => {
			const defaultPreset = { label: 'default', value: this.save('default') }
			this.presets.setKey('default', defaultPreset.value)
			this.activePreset.set(defaultPreset.value)

			const presetSelectInput = presetsFolder.addSelect({
				title: 'presets',
				options: Array.from(this.presets.value.entries()).map(([k, v]) => ({
					label: k,
					value: v,
				})),
				binding: {
					target: this,
					key: 'activePreset',
					initial: defaultPreset,
				},
				onChange: v => {
					// @ts-expect-error	// todo
					this.load(v.value)
				},
			})

			presetSelectInput.on('open', () => {
				this.#presetSnapshot = this.save('snapshot')
			})
			presetSelectInput.on('cancel', () => {
				if (this.#presetSnapshot) {
					this.load(this.#presetSnapshot)
				}
			})
		})
	}

	#renamePreset(title: string) {
		this.presets.update(presets => {
			const preset = presets.get(this.activePreset.value.presetId)
			if (!preset) throw new Error('No preset found.')

			preset.presetTitle = title
			presets.set(this.activePreset.value.presetId, preset)

			return presets
		})
	}

	#createThemer(folder: Folder) {
		// const folder = parentFolder
		// const folder = parentFolder.addFolder({ title: 'theme',
		// 	//! closed: false,
		// 	closed: false,
		// })
		const { themer, themerOptions, storage } = this.opts

		if (!BROWSER) {
			throw new Error('Themer requires a browser environment.')
		}

		if (themer) {
			if (themerOptions) {
				themerOptions.persistent = (storage as GuiStorageOptions)?.theme ?? true

				// Load up the default generated theme vars.
				themerOptions.vars = deepMerge(GUI_VARS, themerOptions.vars)
			}

			if (themer === true) {
				themerOptions.wrapper = this.wrapper
				this.themer = new Themer(this.root.element, themerOptions)
			} else {
				this.themer = themer
			}

			this.evm.add(
				this.themer.mode.subscribe(() => {
					if (this.settingsFolder) {
						this.#applyAltStyle(this.settingsFolder)
					}
				}),
			)

			if (folder) {
				folder.add({
					title: 'theme',
					// todo - labelKey: 'title',
					options: this.themer.themes.value.map(t => ({
						label: t.title,
						value: t,
					})),
					binding: {
						target: this.themer,
						key: 'theme',
						initial: {
							label: this.themer.theme.value.title,
							value: this.themer.theme,
						},
					},
				})

				folder.addButtonGrid({
					title: 'mode',
					value: [
						['light', 'dark', 'system'].map(m => ({
							label: m,
							onClick: () => this.themer?.mode.set(m as ThemeMode),
							isActive: () => this.themer?.mode.value === m,
						})),
					],
				})
			}
		}
	}

	#applyAltStyle(folder: Folder) {
		this.setProp(
			folder.elements.content,
			`box-shadow`,
			`0px 0px 10px 0px hsl(10deg, 0%, var(--${VAR_PREFIX}-shadow-lightness), inset`,
		)

		this.setProps(folder.element, [
			// ['controller_background', `var(--${VAR_PREFIX}-bg-c)`],
			// ['controller-dim_background', `var(--${VAR_PREFIX}-bg-a)`],
			// ['folder-header_background', `var(--${VAR_PREFIX}-bg-b)`],
		])

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

	setProp(el: HTMLElement, key: string, value: string) {
		el.style.setProperty(`--${VAR_PREFIX}-${key}`, value)
		Promise.resolve().then(() => {
			if (!el.style.getPropertyValue(`--${VAR_PREFIX}-${key}`)) {
				console.warn(`No property found for --${VAR_PREFIX}-${key}`)
			}
		})
	}
	setProps(el: HTMLElement, props: [string, string][]) {
		for (const [key, value] of props) {
			this.setProp(el, key, value)
		}
	}

	dispose = () => {
		super.dispose()

		window.addEventListener
		this.themer?.dispose()
		// this.themeEditor?.dispose()
		this.windowManager?.dispose?.()
	}
}
