import type { Input } from './Input'
import type { Gui } from './Gui'

import { create } from '../utils/create'
import { nanoid } from '../utils/nanoid'
import { logger } from '../utils/logger'
import { state } from '../utils/state'
import { fn, g, r } from '../utils/l'

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

	addInput(input: Input) {
		this.controls.set(input.title, input)
		this.contentElement.appendChild(input.element)
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
