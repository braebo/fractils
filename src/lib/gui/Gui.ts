import type { Draggable, DragOptions, computeBoundRect } from '../utils/draggable'
import type { Resizable, ResizableOptions } from '../actions/resizable'
import type { ThemerOptions } from '../theme/Themer'

import { state, type State } from '../utils/state'
import { entries } from '../utils/object'
import { create } from '../utils/create'
import { logger } from '../utils/logger'
import { Themer } from '../theme/Themer'
import { nanoid } from '../utils/nanoid'
import { fn, g, r } from '../utils/l'
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

export interface FolderOptions {
	title: string
	children: Folder[]
	controls: Map<string, Input>
	parentFolder: Folder
	closed: boolean
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
	disabledTimer?: NodeJS.Timeout
	/**
	 * The time in ms to wait after mousedown before
	 * disabling toggle for a potential drag.
	 */
	clickTime = 200
	/**
	 * Whether clicking the header to open/close the folder is disabled.
	 */
	disabled = false

	#skip_header_click_if_drag = (event: PointerEvent) => {
		if (event.button !== 0) return

		addEventListener('pointerup', this.toggle, { once: true })

		// We need to watch for the mouseup event within a certain timeframe
		// to make sure we don't accidentally trigger a click after dragging.
		clearTimeout(this.disabledTimer)
		// First we delay the drag check to allow for messy clicks.
		this.disabledTimer = setTimeout(() => {
			this.headerElement.addEventListener('pointermove', this.disable, { once: true })

			// Then we set a timer to disable the drag check.
			this.disabledTimer = setTimeout(() => {
				this.headerElement.removeEventListener('pointermove', this.disable)
				this.disabled = false
			}, this.clickTime)
		}, 150)

		if (this.disabled) return
	}

	disable = () => {
		if (!this.disabled) {
			this.disabled = true
			this.log(fn('disable'), 'Clicks DISABLED')
		}
		this.disabled = true
		clearTimeout(this.disabledTimer)
	}

	reset() {
		this.log(fn('cancel'), ' Clicks ENABLED')
		removeEventListener('pointerup', this.toggle)
		this.disabled = false
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
			clearTimeout(this.disabledTimer)
			if (this.disabled) {
				this.reset()
				return
			}
		}

		this.closed.get() ? this.open() : this.close()
	}

	open() {
		this.element.classList.remove('closed')
		this.closed.set(false)
		this.disabled = false
	}

	close() {
		this.element.classList.add('closed')
		this.closed.set(true)
		this.disabled = false
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

interface PersistenceOptions {
	/** Persists {@link Draggable} gui's position in local storage. */
	position?: boolean
	size?: boolean
	closed?: boolean
}

export interface GuiOptions extends FolderOptions {
	/**
	 * Determines what to store in localStorage.  If `true`, stores all.  If
	 * `false`, stores nothing.  If an object, stores only the specified
	 * properties from {@link PersistenceOptions} (e.g. `{ position: true, size: true }`).
	 * @default false
	 */
	persistence: boolean | PersistenceOptions
	container?: HTMLElement
	themer: Themer | boolean
	themerOptions: Partial<ThemerOptions>
	resizable: boolean | ResizableOptions
	draggable: boolean | DragOptions
}

export const GUI_DEFAULTS: Omit<GuiOptions, 'parentFolder'> = {
	title: 'Controls',
	controls: new Map(),
	children: [],
	themer: true,
	themerOptions: {},
	persistence: false,
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

	/** Whether the gui is currently being dragged. */
	// dragging = false
	// dragEndTimer?: ReturnType<Window['setTimeout']>
	// dragStartTimer?: ReturnType<Window['setTimeout']>
	/** Wether to persist state, i.e. position/size/closed/etc. */
	persist = {
		position: false,
		size: false,
		closed: false,
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

			import('../actions/resizable').then(({ resizable }) => {
				const options: ResizableOptions = {
					...resizeOptions,
					// persistent: resizeOptions.persistent ?? this.#persist.size ?? undefined,
					persistent: false,
				}

				if (this.persist.size) {
					let debounce: NodeJS.Timeout

					options.onResize = (size) => {
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

				resizable(this.element, options)

				if (this.persist.size) {
					const state = this.state.get()

					this.log(fn('constructor'), 'Loading size from state.', state.size)

					if (options?.sides?.includes('left') || options?.sides?.includes('right')) {
						this.element.style.width = `${state.size.width}px`
					}
					if (options?.sides?.includes('top') || options?.sides?.includes('bottom')) {
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

			addEventListener?.('resize', () => {
				if (this.persist.position) {
					this.draggable?.updateOptions({ position: offscreenCheck() })
				}
			})

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
			this.element.animate(
				[
					{ opacity: 0, clipPath: 'inset(100%,0,0,0)' },
					{ opacity: 1, clipPath: 'inset(0,0,0,0)' },
				],
				{
					fill: 'none',
					duration: 400,
				},
			)

			// this.draggable?.updateOptions()
		}, 15)

		return this
	}

	#setupPersistence(opts: GuiOptions) {
		if (opts.persistence === true) {
			this.persist = {
				position: opts.persistence,
				size: opts.persistence,
				closed: opts.persistence,
			}
		} else if (typeof opts.persistence === 'object') {
			this.persist = {
				position: opts.persistence?.position ?? false,
				size: opts.persistence?.size ?? false,
				closed: opts.persistence?.closed ?? false,
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
