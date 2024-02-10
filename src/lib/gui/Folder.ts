import type { InputOptions, InputView, NumberInputOptions } from './Input'
import type { Gui } from './Gui'

import { Input, InputSlider } from './Input'
import { create } from '../utils/create'
import { nanoid } from '../utils/nanoid'
import { Logger } from '../utils/logger'
import { state } from '../utils/state'

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
	root: Gui

	title: string
	children: Folder[]
	controls: Map<string, Input>
	parentFolder: Folder

	element: HTMLElement

	elements = {} as {
		header: HTMLElement
		title: HTMLElement
		contentWrapper: HTMLElement
		content: HTMLElement
	}

	closed = state(false)

	log = new Logger('Folder', {
		fg: 'DarkSalmon',
		deferred: false,
		server: false,
	})

	#folderIcon?: HTMLElement

	constructor(options: FolderOptions, rootContainer: HTMLElement | null = null) {
		const opts = Object.assign({}, options)
		this.log.fn('constructor').info({ opts, this: this })

		this.title = opts.title ?? ''
		this.children = opts.children ?? []
		this.controls = opts.controls ?? new Map<string, Input>()

		if (rootContainer) {
			this.root = this as any as Gui
			this.isRoot = true
			this.parentFolder = this
			const rootEl = this.#createRootElement(rootContainer)
			const { element, elements } = this.#createElements(rootEl)
			this.element = element
			this.elements = elements
			// @ts-expect-error
			this.theme = opts.theme
		} else {
			this.#createIcon()
			this.parentFolder = opts.parentFolder
			this.root = this.parentFolder.root
			const { element, elements } = this.#createElements(opts.element)
			this.element = element
			this.elements = elements
		}

		if (opts.closed) this.closed.set(opts.closed)

		// Open/close the folder when the closed state changes.
		this.#subs.push(this.closed.subscribe((v) => (v ? this.close() : this.open())))
	}

	#subs: Array<() => void> = []

	/**
	 * Used to disable clicking the header to open/close the folder.
	 */
	#disabledTimer?: ReturnType<typeof setTimeout>
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
			this.elements.header.addEventListener('pointermove', this.disable, { once: true })

			// Then we set a timer to disable the drag check.
			this.#disabledTimer = setTimeout(() => {
				this.elements.header.removeEventListener('pointermove', this.disable)
				this.#disabled = false
			}, this.#clickTime)
		}, 150)

		if (this.#disabled) return
	}

	disable = () => {
		if (!this.#disabled) {
			this.#disabled = true
			this.log.fn('disable').debug('Clicks DISABLED')
		}
		this.#disabled = true
		clearTimeout(this.#disabledTimer)
	}

	reset() {
		this.log.fn('cancel').debug('Clicks ENABLED')
		removeEventListener('pointerup', this.toggle)
		this.#disabled = false
	}

	#createElements(el?: HTMLElement) {
		const element =
			el ??
			create('div', {
				parent: this.parentFolder.elements.content,
				classes: ['gui-folder'],
				// dataset: { id: this.id },
			})
		if (el) el.classList.add('gui-root')

		const header = create('div', {
			parent: element,
			classes: ['gui-header'],
		})
		header.addEventListener('pointerdown', this.#skip_header_click_if_drag)
		if (!this.isRoot) {
			header.appendChild(this.#folderIcon!)
		}

		const title = create('h2', {
			parent: header,
			classes: ['gui-title'],
			textContent: this.title,
		})

		const contentWrapper = create('div', {
			classes: ['gui-content-wrapper'],
			parent: element,
		})
		const content = create('div', {
			classes: ['gui-content'],
			parent: contentWrapper,
		})

		return {
			element,
			elements: {
				header,
				title,
				contentWrapper,
				content,
			},
		}
	}

	#createRootElement(container: HTMLElement | null = null) {
		container ??= document.body

		const rootEl = create('div', {
			classes: ['gui-root'],
			id: 'gui-root',
			// dataset: { id: this.id, title: this.title },
			dataset: { theme: this.root.theme },
		})

		return rootEl
	}

	#createIcon() {
		this.#folderIcon ??= document.createElement('div')
		this.#folderIcon.classList.add('icon-folder-container')
		const css = /*css*/ `
			.icon-folder {
				stroke: var(--theme-a);
				fill: var(--theme-a);
				overflow: visible;
			}
			.icon-folder circle {
				transition: 0.25s;
				transform-origin: center;
			}
			.icon-folder circle.b {
				transform: scale(1);
			}
			.closed .icon-folder circle.b {
				transform: scale(2);
			}
			
			.icon-folder circle.alt {
				transform: scale(0);
			}
			.closed .icon-folder circle.alt {
				transform: scale(1);
			}`

		this.#folderIcon.innerHTML = /*html*/ `
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="100%"
			height="100%"
			viewBox="0 0 24 24"
			fill="none"
			stroke-width="1"
			stroke-linecap="round"
			stroke-linejoin="round"
			class="icon-folder"
		>
			${this.allChildren.map((_: Folder, ii: number) => {
				const i = ii + 1
				const x = 14 + i * 6
				// const y = 12 + i * 3
				const y = 12
				const r = Math.pow(2, -i * 0.5)
				return /*html*/ `<circle class="alt" cx="${x}" cy="${y}" r="${r}" fill="var(--theme-a)" />`
			})}
			<circle class="a" cx="12" cy="12" r="3" stroke="var(--theme-a)" fill="var(--theme-a)" />
			<circle class="b" cx="12" cy="12" r="3" stroke="var(--bg-a)" fill="none" />
			<!-- Vertical line that spans downwards to fill 100% of it's flexbox parent -->
			<line x1="12" y1="12" x2="12" y2="100%" stroke="var(--theme-a)" />
			<style lang="css">
				${css}
			</style>
		</svg>`.trim()

		if (this.closed.get()) this.#folderIcon.classList.add('closed')

		return this.#folderIcon
	}

	get folderSvg() {
		return this.#folderIcon!.querySelector('svg.icon-folder')!
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
		this.#createIcon()

		return folder
	}

	add<T>(options: InputOptions) {
		const input = this.#createInput(options)
		this.controls.set(input.title, input)
		return input as T
	}

	#createInput(options: InputOptions) {
		options.view ??= this.resolveView(options.value, options.view)

		switch (options.view) {
			case 'Slider':
				return new InputSlider(options as NumberInputOptions, this)
			// case 'Checkbox':
			// 	this.boolean()
			// 	break
			// case 'Text':
			// case 'TextArea':
			// 	this.string()
			// 	break
			// case 'Color':
			// 	this.color()
			// 	break
			// case 'Range':
			// 	this.range()
			// 	break
			// case 'Select':
			// 	this.select()
			// 	break
			// case 'Button':
			// 	this.button()
			// 	break
		}

		throw new Error('Invalid input view: ' + options.view)
	}

	resolveView(value: any, view: InputView | undefined): InputView {
		switch (typeof value) {
			case 'number':
				return 'Slider'
			case 'boolean':
				return 'Checkbox'
			case 'string':
				if (view?.startsWith('#')) return 'Color'
				return 'Text'
			case 'function':
				return 'Button'
			case 'object':
				if (Array.isArray(value)) {
					return 'Select'
				}
			default:
				throw new Error('Invalid input view: ' + view)
		}
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

	#updateDisplay = () => {
		this.#createIcon()
	}

	open() {
		this.log.fn('open').info()

		this.element.classList.remove('closed')
		this.closed.set(false)
		this.#disabled = false
	}

	close() {
		this.log.fn('close').info()

		this.element.classList.add('closed')
		this.closed.set(true)
		this.#disabled = false
	}

	/**
	 * A flat array of all children of this folder.
	 */
	get allChildren() {
		return this.children.flatMap((child) => [child, ...child.allChildren]) as Folder[]
	}

	dispose() {
		this.#subs.forEach((unsub) => unsub())

		this.elements.header.removeEventListener('click', this.toggle)
		this.elements.header.addEventListener('pointerdown', this.#skip_header_click_if_drag)

		this.element.remove()

		try {
			this.parentFolder.children.splice(this.parentFolder.children.indexOf(this), 1)
		} catch (err) {
			this.log.fn('dispose').error('Error removing folder from parent', { err })
		}
	}
}
