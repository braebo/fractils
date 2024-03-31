import './gui.scss'

import type { WindowManagerOptions } from '../utils/windowManager'
import type { FolderElements, FolderOptions } from './Folder'
import type { Placement, PlacementOptions } from './place'
import type { ResizableOptions } from '../utils/resizable'
import type { DraggableOptions } from '../utils/draggable'
import type { ThemerOptions } from '../themer/Themer'
import type { PrimitiveState } from '../utils/state'
import type { Tooltip } from '../actions/tooltip'

import { WindowManager, WINDOWMANAGER_DEFAULTS } from '../utils/windowManager'
import { RESIZABLE_DEFAULTS } from '../utils/resizable'
import defaultTheme from '../themer/themes/default'
import { DRAG_DEFAULTS } from '../utils/draggable'
import { resolveOpts } from './shared/resolveOpts'
import { deepMerge } from '../utils/deepMerge'
import theme1 from '../themer/themes/theme-1'
import { entries } from '../utils/object'
import { Themer } from '../themer/Themer'
import { Logger } from '../utils/logger'
import { create } from '../utils/create'
import { state } from '../utils/state'
import { Folder } from './Folder'
import { place } from './place'

type GuiTheme = 'default' | 'minimal' | (string & {})

export interface GuiElements extends FolderElements {
	toolbar: {
		container: HTMLElement
		settingsButton: HTMLButtonElement & { tooltip?: Tooltip }
	}
}

export interface GuiOptions extends Omit<FolderOptions, 'parentFolder'> {
	/**
	 * Persist the gui's state to localStorage.  Specify what
	 * properties to persist, and under what key.  If `true`,
	 * the {@link GUI_STORAGE_DEFAULTS} will be used.
	 * @default false
	 */
	storage?: boolean | Partial<GuiStorageOptions>
	/**
	 * The container to append the gui to.
	 * @default document.body
	 */
	container?: HTMLElement
	/**
	 * Optional {@link Themer} instance for syncing the gui's theme
	 * with your app's theme.  If `true`, a new themer will be created
	 * for you. If `false` or `undefined`, no themer will be created.
	 * @default true
	 */
	themer: Themer | boolean
	/**
	 * Options for the {@link Themer} instance when `themer` is `true`.
	 */
	themerOptions: Partial<ThemerOptions>
	/**
	 * The title of the theme to use for the gui.  To add your own themes,
	 * use {@link themerOptions.themes}.
	 */
	theme?: GuiTheme
	/**
	 * {@link WindowManager} controls behaviors like dragging,
	 * resizing, and z-index management.  Defaults to {@link WINDOWMANAGER_DEFAULTS}.
	 * - `false` disables the window manager.
	 * - `true` uses default options.
	 */
	windowManager: boolean | WindowManager | Partial<WindowManagerOptions>
	placement?: boolean | GuiPlacementOptions
	closed: boolean
	/**
	 * `parentFolder` should always be `undefined` for the root gui.
	 */
	parentFolder: undefined
}

export interface GuiPlacementOptions extends PlacementOptions {
	/**
	 * The position to place the gui.
	 */
	position: Placement
}

export const GUI_PLACEMENT_DEFAULTS: GuiPlacementOptions = {
	position: 'top-right',
	bounds: 'window',
	margin: 16,
} as const

export interface GuiStorageOptions {
	/**
	 * Prefix to use for localStorage keys.
	 * @default "fractils::gui"
	 */
	key: string
	/**
	 * Whether to persist the folder's expanded state.
	 * @default true
	 */
	closed?: boolean
	/**
	 * Whether to persist the theme.
	 * @default true
	 */
	theme?: boolean
}

export const GUI_STORAGE_DEFAULTS: GuiStorageOptions = {
	key: 'fracgui',
	closed: true,
	theme: true,
} as const

export const GUI_DEFAULTS: GuiOptions = {
	title: 'gui',
	controls: new Map(),
	children: [],
	themer: true,
	themerOptions: {
		localStorageKey: 'fracgui::themer',
	},
	windowManager: {
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
	},
	storage: false,
	closed: false,
	placement: false,
	theme: 'default',
	hidden: false,
	parentFolder: undefined,
} as const

/**
 * The root Gui instance.  This is the entry point for creating
 * a gui.  You can create multiple root guis, but each gui
 * can only have one root.
 */
export class Gui extends Folder {
	isRoot = true as const

	declare elements: GuiElements

	static windowManager: WindowManager

	opts: GuiOptions

	container!: HTMLElement
	wrapper!: HTMLElement

	themer?: Themer
	settingsFolder: Folder

	closed: PrimitiveState<boolean>

	private _theme: GuiOptions['theme']

	#log: Logger

	constructor(options?: Partial<GuiOptions>) {
		//· Setup ····························································¬

		const opts = deepMerge(GUI_DEFAULTS, options ?? {}) as GuiOptions
		// Resolve storage separately since GUI_DEFAULTS.storage is `false`.
		opts.storage = resolveOpts(opts.storage, GUI_STORAGE_DEFAULTS)
		opts.container ??= document.body

		super(opts as any as FolderOptions, opts.container)

		this.opts = opts
		this.root = this
		this.container = opts.container

		this.#log = new Logger('Gui:' + opts.title, { fg: 'palevioletred' })
		this.#log.fn('constructor').info({ options, opts, this: this })

		this.wrapper = create('div', {
			classes: ['fracgui-wrapper'],
			style: {
				display: 'contents',
			},
		})
		//⌟

		//· State ····························································¬

		const storageOpts = resolveOpts(opts.storage, GUI_STORAGE_DEFAULTS)
		if (storageOpts && storageOpts.closed) {
			this.closed = state(this.opts.closed, {
				key: storageOpts.key + '::closed',
			})
		} else {
			this.closed = state(this.opts.closed)
		}
		//⌟

		//· Themer ···························································¬

		const { themer, themerOptions } = opts

		if (themer) {
			if (themerOptions.persistent) {
				themerOptions.persistent = (opts?.storage as GuiStorageOptions)?.theme ?? true
			}

			if (themer === true) {
				this.themer = new Themer(this.root.element, {
					...themerOptions,
					wrapper: this.wrapper,
				})
			} else {
				this.themer = themer
			}
		}
		//⌟

		//· Settings ·························································¬

		this.settingsFolder = this.addFolder({
			title: 'Settings',
			closed: true,
			header: false,
			hidden: false,
		})
		this.settingsFolder.element.style.setProperty('--background', 'var(--bg-b)')
		this.settingsFolder.element.style.setProperty('--color', 'var(--fg-c)')

		if (this.themer) {
			// todo - add an icon to the toolbar that toggles this folder.
			// const themeFolder = this.settingsFolder.addFolder({
			// 	title: 'theme',
			// })

			// themeFolder.add({
			this.settingsFolder.add({
				title: 'theme',
				options: [
					{ label: 'default', value: defaultTheme },
					{ label: 'theme-1', value: theme1 },
				],
				// todo - Use this once `state` is changed from `LabeledOption<T>` to `T`.
				binding: {
					target: this.themer,
					key: 'theme',
					initial: {
						label: this.themer.theme.value.title,
						value: this.themer.theme,
					},
				},
			})

			// themeFolder.add({
			this.settingsFolder.add({
				title: 'mode',
				options: ['light', 'dark', 'system'],
				binding: {
					target: this.themer,
					key: 'mode',
				},
			})
		}

		this.settingsFolder.addButton({
			title: 'log',
			text: 'console.log(gui)',
			onClick: () => {
				console.log(this)
			},
		})
		//⌟

		//· Window Manager ···················································¬

		if (!Gui.windowManager) {
			const dragOpts = resolveOpts<DraggableOptions>(
				opts.windowManager?.['draggable'],
				DRAG_DEFAULTS,
			)
			if (dragOpts) {
				dragOpts.handle = this.elements.header
				dragOpts.bounds = this.container
			}

			const resizeOpts = resolveOpts<ResizableOptions>(
				opts.windowManager?.['resizable'],
				RESIZABLE_DEFAULTS,
			)
			if (resizeOpts) {
				resizeOpts.bounds = this.container
			}

			// Use the provided window manager if it's an instance.
			if (opts.windowManager instanceof WindowManager) {
				Gui.windowManager = opts.windowManager

				Gui.windowManager.add(this.element, {
					draggable: dragOpts,
					resizable: resizeOpts,
				})
			} else {
				const windowManagerOpts = resolveOpts(opts.windowManager, WINDOWMANAGER_DEFAULTS)

				this.#log
					.fn('constructor')
					.info({ options, opts, dragOptions: dragOpts, resizeOpts })

				Gui.windowManager = new WindowManager({
					...windowManagerOpts,
					draggable: dragOpts,
					resizable: resizeOpts,
				})

				Gui.windowManager.add(this.element, {
					draggable: dragOpts,
					resizable: resizeOpts,
				})
			}
		}
		//⌟

		if (this.closed.value) this.close()

		// Wait until the gui is fully constructed before positioning it
		// to make sure we can calculate the correct size and position.
		// todo - This works great but feels ghetto. What's a better way
		// todo - to do this... maybe debouncing in `add`?
		Promise.resolve().then(() => {
			Promise.resolve().then(() => {
				// Append a non-animating, full-size clone to get the proper rect.
				const ghost = this.element.cloneNode(true) as HTMLElement
				document.querySelector('.page')?.prepend(ghost)
				const rect = ghost.getBoundingClientRect()
				ghost.remove()

				Promise.resolve().then(() => {
					// todo - This placement stuff should go into `Draggable`
					const placementOpts = resolveOpts(opts.placement, GUI_PLACEMENT_DEFAULTS)

					if (placementOpts) {
						const { position: placement, margin } = placementOpts
						const bounds =
							placementOpts.bounds ?? this.container.getBoundingClientRect()

						const placementPosition = place(rect, placement, {
							bounds,
							margin,
						})

						// this.position.set(placementPosition)
						Gui.windowManager.windows[0]?.draggableInstance?.moveTo(
							placementPosition,
							0,
						)
					}

					this.wrapper.appendChild(this.element)
					this.container.appendChild(this.wrapper)
					this.element.animate([{ opacity: 0 }, { opacity: 1 }], {
						fill: 'none',
						duration: 400,
					})
				})
			})
		})

		return this
	}

	createPresetManager() {
		const presetsFolder = this.settingsFolder.addFolder({
			title: 'presets',
		})
	}

	presets = new Map<string, Record<string, any>>()

	save(gui: Folder, presetName: string) {
		const preset = {} as Record<string, any>

		for (const [id, controller] of gui.allControls) {
			preset[id] = controller.state.value
		}

		this.presets.set('name', preset)
	}

	load(presetName: string) {
		const preset = this.presets.get(presetName)
		if (!preset) return

		for (const [id, value] of entries(preset)) {
			const controller = this.controls.get(id)
			if (!controller) continue

			// controller.state.set(value)
		}
	}

	toLocalStorage() {
		localStorage.setItem('presets', JSON.stringify([...this.presets]))
	}

	fromLocalStorage() {
		const presets = localStorage.getItem('presets')
		if (presets) {
			this.presets = new Map(JSON.parse(presets))
		}
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

	dispose = () => {
		super.dispose()

		window.addEventListener
		this.themer?.dispose()
		Gui.windowManager?.dispose?.()
		for (const window of Gui.windowManager.windows) {
			window
		}
	}
}
