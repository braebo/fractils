import type { Resizable, ResizableOptions } from '../utils/resizable'
import type { Draggable, DragOptions } from '../utils/draggable'
import type { ThemerOptions } from '../theme/Themer'
import type { FolderOptions } from './Folder'

import { entries } from '../utils/object'
import { logger } from '../utils/logger'
import { state, type PrimitiveState, type State } from '../utils/state'
import { fn, g, r } from '../utils/l'

import { Themer } from '../theme/Themer'
import { Folder } from './Folder'

import { BROWSER } from 'esm-env'
import './gui.scss'

// /**
//  * Each key provided will result in a state property being persisted
//  * to localStorage under the specified key.  When persisting, the
//  * state will be loaded from localStorage on initialization, and
//  * saved to localStorage on update.
//  */
// interface LocalStorageKeys {
// 	/**
// 	 * Specify to load and save the gui's position to localStorage.
// 	 * @default 'fractils::gui::position'
// 	 */
// 	position?: string
// 	/**
// 	 * Specify to load and save the gui's size to localStorage.
// 	 * @default 'fractils::gui::size'
// 	 */
// 	size?: string
// 	/**
// 	 * Specify to load and save the gui's closed state to localStorage.
// 	 * @default 'fractils::gui::closed'
// 	 */
// 	closed?: string
// }

export interface GuiOptions extends FolderOptions {
	// /**
	//  * Determines what to persist in localStorage, and under what keys.
	//  * @default undefined
	//  */
	// localStorageKeys?: LocalStorageKeys
	/**
	 * Persist the gui's state to localStorage by specifying the key
	 * to save the state under.
	 * @default undefined
	 */
	persist?: {
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
	resizable: boolean | ResizableOptions
	/**
	 * Whether the gui should be draggable.  Can be a boolean, or
	 * your own {@link DragOptions}.  If `false` or `undefined`,
	 * the gui will not be resizable.
	 */
	draggable: boolean | DragOptions
}

export const GUI_DEFAULTS: Omit<GuiOptions, 'parentFolder'> = {
	title: 'Controls',
	controls: new Map(),
	children: [],
	themer: true,
	themerOptions: {},
	resizable: true,
	draggable: true,
	closed: false,
	persist: undefined,
	// localStorageKeys: undefined,
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
	resizable?: Resizable
	draggable?: Draggable

	// /**
	//  * Which state properties to persist to localStorage,
	//  * and under what keys.
	//  */
	// persist = {
	// 	position: 'fractils::gui::position',
	// 	size: 'fractils::gui::size',
	// 	closed: 'fractils::gui::closed',
	// 	// todo - [{ key: 'Foo Folder', open: true }, ... }] ?
	// 	// children: 'fractils::gui::children',
	// }

	/**
	 * Which state properties to persist to localStorage.
	 */
	persist = {
		key: 'fractils::gui',
		position: false,
		size: false,
		closed: false,
		// todo - [{ key: 'Foo Folder', open: true }, ... }] ?
		// children: 'fractils::gui::children',
	}

	state: PrimitiveState<{
		position: { x: number; y: number }
		size: { width: number; height: number }
		closed: boolean
	}>

	// /**
	//  * Safely saves a single state property to localStorage.
	//  * @param key - The key to save the state under.
	//  * @param data - The data to save.
	//  */
	// save(key: string, data: any) {
	// 	if (typeof window === 'undefined') return
	// 	if (typeof localStorage === 'undefined') return

	// 	if (typeof data !== 'string') data = JSON.stringify(data)

	// 	localStorage.setItem(key, data)

	// 	this.log(fn('save'), { key, data })
	// }

	// /**
	//  * Loads the gui's state from localStorage.
	//  */
	// load(config = this.persist) {
	// 	this.log(fn('load'), { config })
	// 	for (const [key, persist] of entries(config)) {
	// 		if (persist) {
	// 			const state = localStorage.getItem(`fractils::gui::${key}`)
	// 			if (state) {
	// 				this.state.update((v) => ({ ...v, [key]: JSON.parse(state) }))
	// 			}
	// 		}
	// 	}
	// }

	log = logger('Gui', {
		fg: 'PaleVioletRed',
		deferred: false,
		server: false,
	})

	constructor(options?: Partial<GuiOptions>) {
		const opts = Object.assign({}, GUI_DEFAULTS, options, {
			// Hack to force this to be the root in the super call.
			parentFolder: null as any,
		})

		opts.container ??= document.body

		super(opts, opts.container)
		this.log(g('constructor') + '()', { opts, this: this })

		this.root = this
		this.container = opts.container
		this.state = state(
			{
				position: { x: 0, y: 0 },
				size: { width: 16, height: 16 },
				// todo - Booleans are messed up...
				// closed: false, //! TypeError: Type 'boolean' is not assignable to type 'false'
				// closed: false as boolean, // 👀
				closed: opts.closed,
			},
			{
				key: 'fractils::gui::state',
				debounce: 50,
			},
		)
		this.closed = state(opts.closed, {
			onChange: (v) => {
				this.log(fn('state.onChange'), v)
				if (this.persist.closed) {
					this.state.update((vv) => ({ ...vv, closed: v }))
				}
			},
		})

		if (opts.themer) {
			if (opts.themer === true) {
				this.themer = new Themer(opts.themerOptions ?? {})
			} else {
				this.themer = opts.themer
			}
		}

		Object.assign(this.persist, opts.persist ?? {})
		// this.#setupPersistence(opts)

		if (opts.resizable) {
			const resizeOptions = typeof opts.resizable === 'object' ? opts.resizable : {}

			import('../utils/resizable').then(({ Resizable }) => {
				const opts: ResizableOptions = resizeOptions

				if (this.persist.size) {
					// let debounce: NodeJS.Timeout

					opts.onResize = (size) => {
						this.state.update((v) => ({ ...v, size }))
						// if (!size) {
						// 	this.log(fn('onResize'), r('Error: No size to save'))
						// 	return
						// }

						// clearTimeout(debounce)

						// debounce = setTimeout(() => {
						// this.state.update((v) => ({ ...v, size }))

						// this.log(fn('resizable.onResize'), 'Saving size.', size)
						// this.save('fractils::gui::size', size)
						// }, 100)
					}
				}

				this.resizable = new Resizable(this.element, opts)

				// Load size from state.
				if (this.persist.size) {
					const state = this.state.get()
					this.log(fn('constructor'), 'Loading size from state.', state.size)
					if (opts?.sides?.includes('left') || opts?.sides?.includes('right')) {
						this.element.style.width = `${state.size.width}px`
					}
					if (opts?.sides?.includes('top') || opts?.sides?.includes('bottom')) {
						this.element.style.height = `${state.size.height}px`
					}
				}
			})
		}

		if (opts.draggable) {
			const dragOptions = typeof opts.draggable === 'object' ? opts.draggable : {}
			dragOptions.handle = this.headerElement
			dragOptions.bounds = this.container
			dragOptions.recomputeBounds = {
				dragStart: true,
				dragEnd: true,
				drag: true,
			}

			//· todo - move this into the draggable class ··································¬
			// This makes sure the gui is in the viewport.
			const offscreenCheck = () => {
				const state = this.state.get()
				this.log(fn('constructor'), 'Loading position from state.', state.position)

				let x = state.position.x
				let y = state.position.y

				const w = this.element.offsetWidth || state.size.width
				const h = this.element.offsetHeight || state.size.height

				const diff = x + w - this.container.offsetWidth

				if (diff > 0) {
					x -= diff
				}

				if (x < 0) {
					x = 0
				}

				if (y + h > this.container.offsetHeight) {
					const diff = y + h - this.container.offsetHeight

					if (diff > 0) {
						y -= diff
					}
				}

				if (y < 0) {
					y = 0
				}

				return { x, y }
			}

			if (BROWSER) {
				window.addEventListener('resize', () => {
					if (this.persist.position) {
						this.draggable?.updateOptions({ position: offscreenCheck() })
					}
				})
			}

			dragOptions.position = offscreenCheck()
			//⌟

			// let debounce: NodeJS.Timeout
			import('../utils/draggable').then(({ Draggable }) => {
				this.draggable = new Draggable(this.element, {
					...dragOptions,
					onDragEnd: this.persist.position
						? (data) => {
								this.state.update((v) => ({
									...v,
									position: { x: data.offsetX, y: data.offsetY },
								}))
								// const pos = { x: data.offsetX, y: data.offsetY }
								// if (!pos) {
								// 	this.log(r('onDragEnd'), 'No position to save')
								// 	return
								// }

								// this.log(fn('onDragEnd'), 'Saving position', pos)

								// clearTimeout(debounce)
								// debounce = setTimeout(() => {
								// this.state.update((v) => ({ ...v, position: pos }))

								// this.log(fn('gui.draggable.onDragEnd'), 'Saving position.', pos)
								// 	this.save('fractils::gui::position', pos)
								// }, 100)
							}
						: undefined,
				})
			})
		}

		// Load closed from state.
		if (this.persist.closed) {
			const { closed } = this.state.get()
			this.log(fn('constructor'), 'Loading closed from state.', closed)
			closed ? this.open() : this.close()
		}

		setTimeout(() => {
			this.container.appendChild(this.element)

			// A quick fade can mask ssr/hydration jank.
			this.element.animate([{ opacity: 0 }, { opacity: 1 }], {
				fill: 'none',
				duration: 400,
			})
		}, 15)

		return this
	}

	// #setupPersistence(opts: GuiOptions) {
	// 	if (opts.localStorageKeys !== undefined) {
	// 		this.persist = {
	// 			position: opts.localStorageKeys?.position ?? '',
	// 			size: opts.localStorageKeys?.size ?? '',
	// 			closed: opts.localStorageKeys?.closed ?? '',
	// 		}
	// 	}
	// 	this.load()
	// }

	dispose() {
		super.dispose()

		this.themer?.dispose()
		this.resizable?.destroy?.()
		this.draggable?.destroy?.()
	}
}
