import type { Gui } from './Gui'

import { Input, type InputOptions } from './Input'
import { create } from '../utils/create'
import { nanoid } from '../utils/nanoid'
import { Logger } from '../utils/logger'
import { state } from '../utils/state'

import icon_folder from './icon-folder.svg?raw'
import { debounce } from '$lib/utils/debounce'
import { r } from '$lib'

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
	// #folderIcon?: SVGElement
	// #iconClosed?: SVGElement

	constructor(options: FolderOptions, rootContainer: HTMLElement | null = null) {
		const opts = Object.assign({}, options)
		this.log.fn('constructor').info({ opts, this: this })

		this.title = opts.title ?? ''
		this.children = opts.children ?? []
		this.controls = opts.controls ?? new Map<string, Input>()

		if (rootContainer) {
			this.root = this
			this.isRoot = true
			this.parentFolder = this
			const rootEl = this.#createRootElement(rootContainer)
			const { element, elements } = this.#createElements(rootEl)
			this.element = element
			this.elements = elements
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
				dataset: { id: this.id },
			})
		if (el) el.classList.add('gui-root')

		const header = create('div', {
			parent: element,
			classes: ['gui-header'],
		})
		header.addEventListener('pointerdown', this.#skip_header_click_if_drag)
		if (!this.isRoot) {
			// this.headerElement.appendChild(this.#iconClosed!)
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
			dataset: { id: this.id, title: this.title },
		})

		return rootEl
	}

	#createIcon() {
		this.#folderIcon ??= document.createElement('div')
		this.#folderIcon.classList.add('icon-folder-container')
		const css = /*css*/ `
			.icon-folder {
				stroke: var(--brand-a);
				fill: var(--brand-a);
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
			}
		`
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
			${this.allChildren.map((c, ii) => {
				const i = ii + 1
				const x = 14 + i * 6
				// const y = 12 + i * 3
				const y = 12
				const r = Math.pow(2, -i * 0.5)
				return /*html*/ `<circle class="alt" cx="${x}" cy="${y}" r="${r}" fill="var(--brand-a)" />`
			})}
			<circle class="a" cx="12" cy="12" r="3" stroke="var(--brand-a)" fill="var(--brand-a)" />
			<circle class="b" cx="12" cy="12" r="3" stroke="var(--bg-a)" fill="none" />
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

	addInput(options: Omit<InputOptions, 'folder'> & { folder?: Folder }) {
		const input = new Input({
			folder: this,
			...options,
		})
		this.controls.set(input.title, input)
		this.elements.content.appendChild(input.element)
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

	#contentHeight = null as null | number

	updateDisplay() {
		this.#createIcon()
		// this.#updateContentHeight()
	}

	open() {
		this.log.fn('open').info({ 'this.#contentHeight': this.#contentHeight })

		this.element.classList.remove('closed')
		this.closed.set(false)
		this.#disabled = false

		// if (this.#contentHeight !== null) {
		// 	// this.#updateContentHeight()
		// 	this.contentElement.animate([{ height: 0 }, { height: this.#contentHeight + 'px' }], {
		// 		duration: 200,
		// 		easing: 'cubic-bezier(0.19, 1, 0.22, 1)',
		// 		fill: 'forwards',
		// 	})
		// }

		// this.contentElement.animate([{ height: 0 }, { height: '100%' }], {
	}

	close() {
		this.element.classList.add('closed')
		this.closed.set(true)
		this.#disabled = false

		//todo	how to get the natural height of the expanded content element
		//todo	regardless of whether it's currently open or closed?
		//todo  Because if the element is initially collapsed, the height will
		//todo	always be 0, even after opening it.
		// this.#contentHeight = this.contentElement.getBoundingClientRect().height
		// if (this.#contentHeight === null) {
		// this.contentElement.animate([{ height: this.#contentHeight + 'px' }, { height: 0 }], {
		// 	// this.contentElement.animate([{ height: 0 }], {
		// 	duration: 200,
		// 	easing: 'cubic-bezier(0.19, 1, 0.22, 1)',
		// 	fill: 'forwards',
		// })
		// }
	}

	// #updateContentHeight = debounce(() => this.#_updateContentHeight(), 0)
	// #updateContentHeight = async () => {
	// 	await new Promise((resolve) => setTimeout(resolve, 0))
	// 	// Clone the element
	// 	const clone = this.elements.content.cloneNode(true) as HTMLElement

	// 	// Apply styles to ensure the clone is not visible but can expand to its natural height
	// 	clone.classList.remove('closed')
	// 	// clone.style.position = 'absolute'
	// 	// clone.style.visibility = 'hidden'
	// 	// clone.style.height = '100%'
	// 	// clone.style.width = this.contentElement.offsetWidth + 'px' // Maintain the same width
	// 	// clone.style.top = '0'
	// 	// clone.style.left = '-9999px' // Position it off-screen

	// 	// Append the clone to the body
	// 	document.body.appendChild(clone)

	// 	// Measure the height
	// 	const height = clone.getBoundingClientRect().height

	// 	// Remove the clone from the DOM
	// 	document.body.removeChild(clone)

	// 	// console.log(r('height'), height)

	// 	this.#contentHeight = height

	// 	return this
	// }

	/**
	 * A flat array of all children of this folder.
	 */
	get allChildren() {
		return this.children.flatMap((child) => [child, ...child.allChildren])
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
