import type { Draggable, DragOptions } from '../utils/draggable'
import type { ThemerOptions } from '../theme/Themer'
import type { FolderOptions } from './Folder'

import { Resizable, type ResizableOptions } from '../utils/resizable'
import { state, type PrimitiveState } from '../utils/state'
import { Logger } from '../utils/logger'

import { Themer } from '../theme/Themer'
import { Folder } from './Folder'

import './gui.scss'

type GuiTheme = 'default' | 'minimal' | (string & {})

export interface GuiOptions extends FolderOptions {
	/**
	 * Persist the gui's state to localStorage by specifying the key
	 * to save the state under.
	 * @default undefined
	 */
	storage?:
		| true
		| {
				/**
				 * @default "fractils::gui"
				 */
				key: string
				/**
				 * @default true
				 */
				size?: boolean
				/**
				 * @default true
				 */
				position?: boolean
				/**
				 * @default true
				 */
				closed?: boolean
				/**
				 * How long to debounce writes to localStorage (0 to disable).
				 * @default 50
				 */
				debounce?: number
		  }
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
	 * Whether the gui should be resizable.  Can be a boolean, or
	 * your own {@link ResizableOptions}.  If `false` or `undefined`,
	 * the gui will not be resizable.
	 */
	resizable: boolean | Partial<ResizableOptions>
	/**
	 * Whether the gui should be draggable.  Can be a boolean, or
	 * your own {@link DragOptions}.  If `false` or `undefined`,
	 * the gui will not be resizable.
	 */
	draggable: boolean | Partial<DragOptions>

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
	themerOptions: {},
	resizable: {
		grabberSize: 50,
		sides: ['right'],
		corners: [],
	},
	draggable: true,
	storage: {
		key: 'fractils::gui',
		size: true,
		position: true,
		closed: true,
		debounce: 50,
	},
	closed: false,
	size: { width: 0, height: 0 },
	position: { x: 16, y: 16 },
	// theme: 'default'
	theme: 'minimal',
} as const satisfies Omit<GuiOptions, 'parentFolder'>

type StorageOptions = typeof GUI_DEFAULTS.storage

/**
 * The root Gui instance.  This is the entry point for creating
 * a gui.  You can create multiple root guis, but each gui
 * can only have one root.
 */
export class Gui extends Folder {
	isRoot = true as const

	container!: HTMLElement

	themer?: Themer
	resizable?: Resizable
	draggable?: Draggable

	closed: PrimitiveState<boolean>
	size: PrimitiveState<{ width: number; height: number }>
	position: PrimitiveState<{ x: number; y: number }>

	/**
	 * Which state properties to persist to localStorage.
	 */
	storage: StorageOptions | Record<string, any>
	private _theme: GuiOptions['theme']

	log = new Logger('Gui', {
		fg: 'PaleVioletRed',
		deferred: true,
		server: false,
	})

	constructor(options?: Partial<GuiOptions>) {
		//· Setup ···································································¬

		const opts = Object.assign({}, GUI_DEFAULTS, options, {
			// Hack to force this to be the root in the super call.
			parentFolder: null as any,
			resizable: options?.resizable ?? GUI_DEFAULTS.resizable,
		})

		opts.container ??= document.body

		super(opts, opts.container)
		this.log.fn('constructor').info({ opts, this: this })

		this.root = this
		this.container = opts.container
		this.storage = !opts.storage
			? {}
			: opts.storage === true
				? GUI_DEFAULTS.storage
				: Object.assign({}, opts.storage, GUI_DEFAULTS.storage)
		//⌟

		//· State ···································································¬

		const getState = <T>(value: T, key: 'size' | 'position' | 'closed') => {
			if (opts.storage === true)
				return state<T>(value, { key: 'fractils::gui::' + key, debounce: 50 })

			if (typeof opts.storage === 'object') {
				const { storage } = this

				if (!storage[key]) return state<T>(value)

				return state<T>(value, {
					key: storage.key + '::' + key,
					debounce: storage.debounce,
				})
			}

			this.log.error('Error initializing state:', { key, value, opts, this: this })
			return state<T>(value)
		}

		this.size = getState(opts.size, 'size')
		this.position = getState(opts.position, 'position')
		this.closed = getState(closed, 'closed')

		if (this.closed.value) this.close()
		//⌟

		//· Themer ··································································¬

		if (opts.themer) {
			if (opts.themer === true) {
				this.themer = new Themer(opts.themerOptions ?? {})
			} else {
				this.themer = opts.themer
			}
		}
		//⌟

		//· Resizable ·······························································¬

		if (opts.resizable) {
			const resizeOpts: Partial<ResizableOptions> =
				typeof opts.resizable === 'object' ? opts.resizable : {}

			import('../utils/resizable').then(({ Resizable }) => {
				if (opts.storage === true || this.storage?.size) {
					resizeOpts.onResize = (size) => {
						this.size.set(size)
					}
				}

				this.resizable = new Resizable(this.element, {
					...resizeOpts,
				})

				// Load size from state.
				if (opts.storage === true || opts.storage?.size) {
					const size = this.size.get()
					this.log.fn('constructor').info('Loading size from state:', size)
					if (
						resizeOpts?.sides?.includes('left') ||
						resizeOpts?.sides?.includes('right')
					) {
						this.element.style.width = `${size.width}px`
					}
					if (
						resizeOpts?.sides?.includes('top') ||
						resizeOpts?.sides?.includes('bottom')
					) {
						this.element.style.height = `${size.height}px`
					}
				}
			})
		}
		//⌟

		//· Draggable ·······························································¬

		if (opts.draggable) {
			const dragOptions: Partial<DragOptions> =
				typeof opts.draggable === 'object' ? opts.draggable : {}
			dragOptions.handle = this.elements.header
			dragOptions.bounds = this.container

			dragOptions.defaultPosition = this.position.get()

			this.log.fn('constructor').info(dragOptions)

			import('../utils/draggable').then(({ Draggable }) => {
				this.draggable = new Draggable(this.element, {
					...dragOptions,
					onDragEnd: this.storage.position
						? (data) => {
								const { x, y } = data
								if (x === 0 && y === 0) return

								this.position.set({ x, y })

								this.log.fn('onDragEnd').info('Position updated:', { x, y })
							}
						: undefined,
				})
			})
		}
		//⌟

		setTimeout(() => {
			this.container.appendChild(this.element)
			this.element.animate([{ opacity: 0 }, { opacity: 1 }], {
				fill: 'none',
				duration: 400,
			})
		}, 15)

		return this
	}

	set theme(theme: GuiTheme) {
		this._theme = theme
		this.root.element.dataset.theme = theme
	}
	get theme() {
		return this._theme!
	}

	dispose = () => {
		super.dispose()

		window.addEventListener
		this.themer?.dispose()
		this.resizable?.dispose?.()
		this.draggable?.dispose?.()
	}
}
