import type { Resizable, ResizableOptions } from '../actions/resizable'
import type { ThemerOptions } from '../theme/Themer'

import { state, type State } from '../utils/state'
import { create } from '../utils/create'
import { logger } from '../utils/logger'
import { Themer } from '../theme/Themer'
import { nanoid } from '../utils/nanoid'
// import { onDestroy } from 'svelte'
import { BROWSER } from 'esm-env'
import { atom } from 'nanostores'
import { g, r } from '../utils/l'
import './gui.scss'

export interface Control<T = unknown> {
	value: T
	state: State<T>
	title: string
	type: string
	folder: Folder
}

export interface FolderOptions {
	title: string
	children: Folder[]
	controls: Map<string, Control>
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
	controls: Map<string, Control>
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
		this.controls = opts.controls ?? new Map<string, Control>()

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
			parent: container,
		})

		return rootEl
	}

	addFolder(options?: { title?: string; closed?: boolean }) {
		const folder = new Folder({
			// title: options.title ?? 'Folder ' + this.root.allChildren.length,
			title: options?.title ?? '',
			controls: new Map(),
			parentFolder: this,
			children: [],
			closed: options?.closed ?? false,
		})

		this.children.push(folder)

		return folder
	}

	open() {
		this.element.classList.remove('closed')
		this.closed.set(false)
	}

	close() {
		this.element.classList.add('closed')
		this.closed.set(true)
	}

	/**
	 * A flat array of all children of this folder.
	 */
	get allChildren() {
		return this.children.flatMap((child) => [child, ...child.allChildren])
	}

	dispose() {
		this.#subs.forEach((unsub) => unsub())
		this.element.remove()
		try {
			this.parentFolder.children.splice(this.parentFolder.children.indexOf(this), 1)
		} catch (err) {
			this.log(r('Error removing folder from parent'), { err })
		}
	}
}

export interface GuiOptions extends FolderOptions {
	persistent: boolean
	container?: HTMLElement
	themer: Themer | boolean
	themerOptions: Partial<ThemerOptions>
	resizable: boolean | ResizableOptions
}

export const GUI_DEFAULTS: Omit<GuiOptions, 'parentFolder'> = {
	title: 'Controls',
	controls: new Map(),
	children: [],
	themer: true,
	themerOptions: {},
	persistent: false,
	resizable: true,
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

	#persistent: boolean
	#unsubs: Array<() => void> = []

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
		this.#persistent = opts.persistent ?? false

		if (opts.themer) {
			if (opts.themer === true) {
				this.themer = new Themer(opts.themerOptions ?? {})
			} else {
				this.themer = opts.themer
			}
		}

		if (opts.resizable) {
			const resizeOptions = typeof opts.resizable === 'object' ? opts.resizable : {}

			import('../actions/resizable').then(({ resizable }) => {
				resizable(this.element, {
					...resizeOptions,
					persistent: resizeOptions.persistent ?? this.#persistent ?? undefined,
				})
			})
		}

		return this
	}
}
