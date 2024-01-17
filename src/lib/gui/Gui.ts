import type { Resizable, ResizableOptions } from '../utils/resizable'
import type { Draggable, DragOptions } from '../utils/draggable'
import type { ThemerOptions } from '../theme/Themer'

import { state, type State } from '../utils/state'
import { entries } from '../utils/object'
import { create } from '../utils/create'
import { logger } from '../utils/logger'
import { Themer } from '../theme/Themer'
import { nanoid } from '../utils/nanoid'
import { fn, g, r } from '../utils/l'
import { BROWSER } from 'esm-env'
import './gui.scss'

type InputType =
	| 'Text'
	| 'Number'
	| 'Boolean'
	| 'Color'
	| 'Range'
	| 'Select'
	| 'Button'
	| 'Folder'
	| 'Textarea'

type InputValue<T = InputType> = T extends 'Text'
	? string
	: T extends 'Number'
		? number
		: T extends 'Boolean'
			? boolean
			: T extends 'Color'
				? string
				: T extends 'Range'
					? number
					: T extends 'Select'
						? string
						: T extends 'Button'
							? void
							: T extends 'Folder'
								? Folder
								: T extends 'Textarea'
									? string
									: never

export interface InputOptions<T = InputType, V = InputValue<T>> {
	value: V
	title: string
	type: string
	folder: Folder
}

export class Input<T = InputType, V = InputValue<T>> {
	state: State<V>
	title: string
	type: string
	folder: Folder
	element: HTMLElement

	constructor(options: InputOptions<T, V>) {
		this.state = state(options.value)
		this.title = options.title
		this.type = options.type
		this.folder = options.folder
		this.element = this.#createElement()
	}

	#createElement() {
		const element = create('div', {
			classes: ['gui-control'],
			parent: this.folder.contentElement,
		})

		create('label', {
			classes: ['gui-label'],
			parent: element,
			textContent: this.title,
		})

		return element
	}
}

/**
 * @internal
 */
export interface FolderOptions {
	/**
	 * The title of the folder.
	 * @default ''
	 */
	title: string
	/**
	 * The child folders of this folder.
	 */
	children: Folder[]
	/**
	 * Any controls this folder should contain.
	 */
	controls: Map<string, Input>
	parentFolder: Folder
	/**
	 * Whether the folder should be collapsed by default.
	 * @default false
	 */
	closed: boolean
	/**
	 * The element to append the folder to (usually
	 * the parent folder's content element).
	 */
	element?: HTMLElement
}

/**
 * @internal
 */
export class Folder {
	id = nanoid()
	isFolder = true as const

	isRoot = false
	root: Folder

	title: string
	children: Folder[]
	controls: Map<string, Input>
	parentFolder: Folder

	element: HTMLElement
	headerElement!: HTMLElement

	titleElement!: HTMLElement
	contentElement!: HTMLElement

	closed = state(false)

	log = logger('Folder', {
		fg: 'DarkSalmon',
		deferred: false,
		server: false,
	})

	constructor(options: FolderOptions, rootContainer: HTMLElement | null = null) {
		const opts = Object.assign({}, options)
		this.log(g('constructor') + '()', { opts, this: this })

		this.title = opts.title ?? ''
		this.children = opts.children ?? []
		this.controls = opts.controls ?? new Map<string, Input>()

		if (rootContainer) {
			this.root = this
			this.isRoot = true
			this.parentFolder = this
			const rootEl = this.#createRootElement(rootContainer)
			this.element = this.#createElements(rootEl)
		} else {
			this.parentFolder = opts.parentFolder
			this.root = this.parentFolder.root
			this.element = this.#createElements(opts.element)
		}

		if (opts.closed) this.closed.set(opts.closed)

		// Open/close the folder when the closed state changes.
		this.#subs.push(this.closed.subscribe((v) => (v ? this.close() : this.open())))
	}

	#subs: Array<() => void> = []

	/**
	 * Used to disable clicking the header to open/close the folder.
	 */
	#disabledTimer?: NodeJS.Timeout
	/**
	 * The time in ms to wait after mousedown before
	 * disabling toggle for a potential drag.
	 */
	#clickTime = 200
	/**
	 * Whether clicking the header to open/close the folder is disabled.
	 */
	#disabled = false

	#skip_header_click_if_drag = (event: PointerEvent) => {
		if (event.button !== 0) return

		addEventListener('pointerup', this.toggle, { once: true })

		// We need to watch for the mouseup event within a certain timeframe
		// to make sure we don't accidentally trigger a click after dragging.
		clearTimeout(this.#disabledTimer)
		// First we delay the drag check to allow for messy clicks.
		this.#disabledTimer = setTimeout(() => {
			this.headerElement.addEventListener('pointermove', this.disable, { once: true })

			// Then we set a timer to disable the drag check.
			this.#disabledTimer = setTimeout(() => {
				this.headerElement.removeEventListener('pointermove', this.disable)
				this.#disabled = false
			}, this.#clickTime)
		}, 150)

		if (this.#disabled) return
	}

	disable = () => {
		if (!this.#disabled) {
			this.#disabled = true
			this.log(fn('disable'), 'Clicks DISABLED')
		}
		this.#disabled = true
		clearTimeout(this.#disabledTimer)
	}

	reset() {
		this.log(fn('cancel'), ' Clicks ENABLED')
		removeEventListener('pointerup', this.toggle)
		this.#disabled = false
	}

	#createElements(el?: HTMLElement) {
		const element =
			el ??
			create('div', {
				parent: this.parentFolder.contentElement,
				classes: ['gui-folder'],
				dataset: { id: this.id },
			})

		this.headerElement = create('div', {
			parent: element,
			classes: ['gui-header'],
		})
		this.headerElement.addEventListener('pointerdown', this.#skip_header_click_if_drag)

		this.titleElement = create('h2', {
			parent: this.headerElement,
			classes: ['gui-title'],
			textContent: this.title,
		})

		this.contentElement = create('div', {
			classes: ['gui-content'],
			parent: element,
		})

		return element
	}

	#createRootElement(container: HTMLElement | null = null) {
		container ??= document.body

		const rootEl = create('div', {
			classes: ['gui-root'],
			id: 'gui-root',
			dataset: { id: this.id, title: this.title },
		})

		return rootEl
	}

	addFolder(options?: { title?: string; closed?: boolean }) {
		const folder = new Folder({
			title: options?.title ?? '',
			controls: new Map(),
			parentFolder: this,
			children: [],
			closed: options?.closed ?? false,
		})

		this.children.push(folder)

		return folder
	}

	addInput(control: Input) {
		this.controls.set(control.title, control)
		this.contentElement.appendChild(control.element)
	}

	isGui(): this is Gui {
		return this.isRoot
	}

	toggle = () => {
		if (this.isGui()) {
			clearTimeout(this.#disabledTimer)
			if (this.#disabled) {
				this.reset()
				return
			}
		}

		this.closed.get() ? this.open() : this.close()
	}

	open() {
		this.element.classList.remove('closed')
		this.closed.set(false)
		this.#disabled = false
	}

	close() {
		this.element.classList.add('closed')
		this.closed.set(true)
		this.#disabled = false
	}

	/**
	 * A flat array of all children of this folder.
	 */
	get allChildren() {
		return this.children.flatMap((child) => [child, ...child.allChildren])
	}

	dispose() {
		this.#subs.forEach((unsub) => unsub())

		this.headerElement.removeEventListener('click', this.toggle)
		this.headerElement.addEventListener('pointerdown', this.#skip_header_click_if_drag)

		this.element.remove()

		try {
			this.parentFolder.children.splice(this.parentFolder.children.indexOf(this), 1)
		} catch (err) {
			this.log(r('Error removing folder from parent'), { err })
		}
	}
}

/**
 * Each key provided will result in a state property being persisted
 * to localStorage under the specified key.  When persisting, the
 * state will be loaded from localStorage on initialization, and
 * saved to localStorage on update.
 */
interface LocalStorageKeys {
	/**
	 * Specify to load and save the gui's position to localStorage.
	 * @default 'fractils::gui::position'
	 */
	position?: string
	/**
	 * Specify to load and save the gui's size to localStorage.
	 * @default 'fractils::gui::size'
	 */
	size?: string
	/**
	 * Specify to load and save the gui's closed state to localStorage.
	 * @default 'fractils::gui::closed'
	 */
	closed?: string
}

export interface GuiOptions extends FolderOptions {
	/**
	 * Determines what to persist in localStorage, and under what keys.
	 * @default undefined
	 */
	localStorageKeys?: LocalStorageKeys
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
	localStorageKeys: undefined,
	resizable: true,
	draggable: true,
	closed: false,
}

/**
 * The Gui gui class
 */
export class Gui extends Folder {
	isRoot = true as const

	container!: HTMLElement

	themer?: Themer
	resizable?: Resizable
	draggable?: Draggable

	/**
	 * Which state properties to persist to localStorage,
	 * and under what keys.
	 */
	persist = {
		position: 'fractils::gui::position',
		size: 'fractils::gui::size',
		closed: 'fractils::gui::closed',
	}

	state = state(
		{
			position: { x: 0, y: 0 },
			size: { width: 16, height: 16 },
			closed: false,
		},
		{
			set: (state) => {
				if (this.persist.position) {
					this.save('fractils::gui::position', state.position)
				}
				if (this.persist.size) {
					this.save('fractils::gui::size', state.size)
				}
				if (this.persist.closed) {
					this.save('fractils::gui::closed', state.closed)
				}
				return state
			},
		},
	)

	/**
	 * Safely saves a single state property to localStorage.
	 * @param key - The key to save the state under.
	 * @param data - The data to save.
	 */
	save(key: string, data: any) {
		if (typeof window === 'undefined') return
		if (typeof localStorage === 'undefined') return

		if (typeof data !== 'string') data = JSON.stringify(data)
		localStorage.setItem(key, data)
		this.log(fn('save'), { key, data })
	}

	/**
	 * Loads the gui's state from localStorage.
	 */
	load(config = this.persist) {
		this.log(fn('load'), { config })
		for (const [key, persist] of entries(config)) {
			if (persist) {
				const state = localStorage.getItem(`fractils::gui::${key}`)
				if (state) {
					this.state.update((v) => ({ ...v, [key]: JSON.parse(state) }))
				}
			}
		}
	}

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

		if (opts.themer) {
			if (opts.themer === true) {
				this.themer = new Themer(opts.themerOptions ?? {})
			} else {
				this.themer = opts.themer
			}
		}

		this.#setupPersistence(opts)

		if (opts.resizable) {
			const resizeOptions = typeof opts.resizable === 'object' ? opts.resizable : {}

			import('../utils/resizable').then(({ Resizable }) => {
				const opts: ResizableOptions = resizeOptions

				if (this.persist.size) {
					let debounce: NodeJS.Timeout

					opts.onResize = (size) => {
						if (!size) {
							this.log(fn('onResize'), r('Error: No size to save'))
							return
						}

						clearTimeout(debounce)

						debounce = setTimeout(() => {
							this.state.update((v) => ({ ...v, size }))

							this.log(fn('resizable.onResize'), 'Saving size.', size)
							this.save('fractils::gui::size', size)
						}, 100)
					}
				}

				this.resizable = new Resizable(this.element, opts)

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

			let debounce: NodeJS.Timeout
			import('../utils/draggable').then(({ Draggable }) => {
				this.draggable = new Draggable(this.element, {
					...dragOptions,
					onDragEnd: this.persist.position
						? (data) => {
								const pos = { x: data.offsetX, y: data.offsetY }
								if (!pos) {
									this.log(r('onDragEnd'), 'No position to save')
									return
								}

								this.log(fn('onDragEnd'), 'Saving position', pos)

								clearTimeout(debounce)
								debounce = setTimeout(() => {
									this.state.update((v) => ({ ...v, position: pos }))

									this.log(fn('gui.draggable.onDragEnd'), 'Saving position.', pos)
									this.save('fractils::gui::position', pos)
								}, 100)
							}
						: undefined,
				})
			})
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

	#setupPersistence(opts: GuiOptions) {
		if (opts.localStorageKeys !== undefined) {
			this.persist = {
				position: opts.localStorageKeys?.position ?? '',
				size: opts.localStorageKeys?.size ?? '',
				closed: opts.localStorageKeys?.closed ?? '',
			}
		}

		this.load()
	}

	dispose() {
		super.dispose()

		this.themer?.dispose()
		this.resizable?.destroy?.()
		this.draggable?.destroy?.()
	}
}
