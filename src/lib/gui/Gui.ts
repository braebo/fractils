import './gui.scss'

import type { WindowManagerOptions } from '../utils/windowManager'
import type { ResizableOptions } from '../utils/resizable'
import type { DragOptions } from '../utils/draggable'
import type { ThemerOptions } from '../themer/Themer'
import type { FolderOptions } from './Folder'

import { state, type PrimitiveState } from '../utils/state'
import { WindowManager } from '../utils/windowManager'
import { deepMerge } from '$lib/utils/deepMerge'
import { Themer } from '../themer/Themer'
import { Logger } from '../utils/logger'
import { Folder } from './Folder'

import defaultTheme from '../themer/themes/default'
import { place, type Placement } from './place'
import theme1 from '../themer/themes/theme-1'

type GuiTheme = 'default' | 'minimal' | (string & {})

export interface GuiOptions extends FolderOptions {
	/**
	 * Persist the gui's state to localStorage by specifying the key
	 * to save the state under.
	 * @default undefined
	 */
	storage?: Partial<GuiStorageOptions> | true
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
	 * {@link WindowManager} options.  Controls behaviors like dragging,
	 * resizing, and z-index management.
	 */
	windowManager: Partial<WindowManagerOptions>

	placement: {
		position: Placement
		bounds?: DOMRect | { x: number; y: number; width: number; height: number } | 'window'
		margin?: number | { x: number; y: number }
	}
	position: { x: number; y: number }
	size: { width: number; height: number }
	closed: boolean
	theme?: GuiTheme
}

export const GUI_DEFAULTS = {
	title: 'gui',
	controls: new Map(),
	children: [],
	themer: true,
	themerOptions: {
		localStorageKey: 'fracgui::themer',
	},
	windowManager: {
		resizable: {
			grabberSize: 9,
			color: 'var(--bg-d)',
			sides: ['right'],
			corners: [],
		},
		draggable: true,
	},
	storage: {
		key: 'fracgui',
		size: true,
		position: true,
		closed: true,
		debounce: 50,
	},
	closed: false,
	size: { width: 100, height: 400 },
	position: { x: 16, y: 16 },
	// placement: 'bottom-right',
	placement: {
		position: 'top-right',
		margin: 16,
	},
	theme: 'default',
	// theme: 'minimal',
} as const satisfies Omit<GuiOptions, 'parentFolder'>

interface GuiStorageOptions {
	/**
	 * Prefix to use for localStorage keys.
	 * @default "fractils::gui"
	 */
	key: string
	/**
	 * Whether to persist the size.
	 * @default true
	 */
	size?: boolean
	/**
	 * Whether to persist the position when windowManager is enabled.
	 * @default true
	 */
	position?: boolean
	/**
	 * Whether to persist the folder's expanded state.
	 * @default true
	 */
	closed?: boolean
	/**
	 * How long to debounce writes to localStorage (0 to disable).
	 * @default 50
	 */
	debounce?: number
	/**
	 * Whether to persist the theme.
	 * @default true
	 */
	theme?: boolean
}

/**
 * The root Gui instance.  This is the entry point for creating
 * a gui.  You can create multiple root guis, but each gui
 * can only have one root.
 */
export class Gui extends Folder {
	isRoot = true as const

	container!: HTMLElement

	themer?: Themer
	windowManager: WindowManager
	settingsFolder: Folder

	closed: PrimitiveState<boolean>
	size: PrimitiveState<{ width: number; height: number }>
	position: PrimitiveState<{ x: number; y: number }>

	/**
	 * Which state properties to persist to localStorage.
	 */
	storage: GuiStorageOptions | Record<string, any>
	private _theme: GuiOptions['theme']

	#log: Logger

	constructor(options?: Partial<GuiOptions>) {
		//· Setup ···································································¬

		const opts = deepMerge(GUI_DEFAULTS, options ?? {}) as GuiOptions
		opts.container ??= document.body
		super(opts, opts.container)

		this.#log = new Logger('Gui:' + opts.title, { fg: 'palevioletred' })
		this.#log.fn('constructor').info({ opts, this: this })

		this.root = this
		this.container = opts.container
		this.storage = !opts.storage
			? {}
			: opts.storage === true
				? GUI_DEFAULTS.storage
				: Object.assign({}, GUI_DEFAULTS.storage, opts.storage)

		this.#log.info('Storage:', this.storage)
		//⌟

		//· State ···································································¬

		const getState = <T>(value: T, key: 'size' | 'position' | 'closed') => {
			if (opts.storage === true)
				return state<T>(value, { key: this.storage.key + '::' + key, debounce: 50 })

			if (typeof opts.storage === 'object') {
				const { storage } = this

				if (!storage[key]) return state<T>(value)

				return state<T>(value, {
					key: storage.key + '::' + key,
					debounce: storage.debounce,
				})
			}

			this.#log.error('Error initializing state:', { key, value, opts, this: this })
			return state<T>(value)
		}

		this.size = getState(opts.size, 'size')
		this.position = getState(opts.position, 'position')
		this.closed = getState(closed, 'closed')

		this.settingsFolder = this.addFolder({ title: 'Settings', closed: false, header: false })

		if (this.closed.value) this.close()
		//⌟

		//· Themer ··································································¬

		const { themer, themerOptions } = opts

		if (themer) {
			if (themerOptions.persistent) {
				themerOptions.persistent = (opts?.storage as GuiStorageOptions)?.theme ?? true
			}

			if (themer === true) {
				if (!themerOptions) {
					themerOptions
				}
				this.themer = new Themer(this.root.element, themerOptions)
			} else {
				this.themer = themer
			}

			//* Global Settings Folder

			// todo - add an icon to the toolbar that toggles this folder.

			const themeFolder = this.settingsFolder.addFolder({
				title: 'theme',
			})
			themeFolder.element.style.setProperty('--background', 'var(--bg-b)')
			themeFolder.element.style.setProperty('--color', 'var(--fg-c)')

			themeFolder
				.add({
					title: 'theme',
					options: [
						{ label: 'default', value: defaultTheme },
						{ label: 'theme-1', value: theme1 },
					],
					// todo - Use this once `state` is changed from `LabeledOption<T>` to `T`.
					// binding: {
					// 	target: this.themer,
					// 	key: 'theme',
					// },21	Q1
					value: { label: this.themer.theme.value.title, value: this.themer.theme },
				})
				.onChange(e => {
					console.error(e)
					// alert(e.value)
					// this.themer?.theme.set(e.value)
				})

			themeFolder.add({
				title: 'mode',
				options: ['light', 'dark', 'system'],
				binding: {
					target: this.themer,
					key: 'mode',
				},
			})
		}
		//⌟

		//· Window Manager ·····························································¬

		//··  Draggable ································································¬

		const dragOptions: Partial<DragOptions> =
			typeof opts.windowManager?.draggable === 'object' ? opts.windowManager?.draggable : {}
		this.#log.fn('constructor').info({ dragOptions, opts })
		dragOptions.handle = this.elements.header
		dragOptions.bounds = this.container

		// if (!dragOptions.defaultPosition && this.position.value) {
		if (!opts.placement && !dragOptions.defaultPosition && this.position.value) {
			//? Prioritize opts.position over opts.draggable.defaultPosition.
			dragOptions.defaultPosition = this.position.value
		}
		// if (opts.placement) {
		// 	//? Prioritize placement over opts.position.
		// 	const rect = this.element.getBoundingClientRect()
		// 	const { position: placement, margin } = opts.placement
		// 	const bounds = opts.placement.bounds ?? this.container.getBoundingClientRect()
		// 	const placementPosition = place(rect, placement, {
		// 		bounds,
		// 		margin,
		// 	})
		// 	dragOptions.defaultPosition = placementPosition
		// 	this.position.set(placementPosition)
		// 	this.#log.fn('constructor').info({ rect, placement, margin, bounds })
		// }

		//? Persist position to state if storage is enabled.
		if (this.storage.position) {
			dragOptions.onDragEnd = data => {
				const { x, y } = data
				if (x === 0 && y === 0) return

				this.position.set({ x, y })

				this.#log.fn('onDragEnd').info('Position updated:', { x, y })
			}
		}
		//⌟

		//·· Resizable ·······························································¬

		//? If `false`, disable resizing
		// todo - Resizable needs a proper `disabled` option/toggle.
		//? If `true`, an empty object will result in default options.
		const resizeOpts: Partial<ResizableOptions> =
			typeof opts.windowManager?.resizable === 'object'
				? opts.windowManager?.resizable
				: opts.windowManager?.resizable === false
					? {
							sides: [],
							corners: [],
						}
					: {} // Results in defaults in Resizable.

		if (opts.storage === true || this.storage?.size) {
			resizeOpts.onResize = size => {
				this.size.set(size)
			}

			//? Load size from state if storage is enabled.
			if (opts.storage === true || opts.storage?.size) {
				const size = this.size.value
				this.#log.fn('constructor').info('Loading size from state:', size)
				if (resizeOpts?.sides?.includes('left') || resizeOpts?.sides?.includes('right')) {
					this.element.style.width = `${size.width}px`
				}
				if (resizeOpts?.sides?.includes('top') || resizeOpts?.sides?.includes('bottom')) {
					this.element.style.height = `${size.height}px`
				}
			}
		}
		//⌟
		//⌟

		this.windowManager = new WindowManager({
			...opts.windowManager,
			draggable: dragOptions,
			resizable: resizeOpts,
		})

		this.windowManager.add(this.element, {
			draggable: {
				bounds: this.container,
				defaultPosition: this.position.value,
			},
			resizable: {
				bounds: this.container,
			},
		})
		//⌟

		Promise.resolve().then(() => {
			Promise.resolve().then(() => {
				const ghost = this.element.cloneNode(true) as HTMLElement
				document.querySelector('.page')?.prepend(ghost)
				const rect = ghost.getBoundingClientRect()
				ghost.remove()

				Promise.resolve().then(() => {
					const { position: placement, margin } = opts.placement
					const bounds = opts.placement.bounds ?? this.container.getBoundingClientRect()

					const placementPosition = place(rect, placement, {
						bounds,
						margin,
					})

					this.position.set(placementPosition)
					this.windowManager.windows[0]?.draggableInstance?.moveTo(placementPosition, 0)
					this.container.appendChild(this.element)
					this.element.animate([{ opacity: 0 }, { opacity: 1 }], {
						fill: 'none',
						duration: 400,
					})
				})
			})
		})
		// }, 15)

		return this
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
		this.windowManager?.dispose?.()
		for (const window of this.windowManager.windows) {
			window
		}
	}
}
