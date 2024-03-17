import type { InputOptions, InputType, ValidInputs as ValidInput } from './inputs/Input'

import { InputNumber, type NumberInputOptions } from './inputs/InputNumber'
import { InputColor, type ColorInputOptions } from './inputs/InputColor'

import { cancelClassFound } from '../internal/cancelClassFound'
import { isColor, isColorFormat } from '../color/color'
import { create } from '../utils/create'
import { nanoid } from '../utils/nanoid'
import { Logger } from '../utils/logger'
import { state } from '../utils/state'
import { Search } from './Search'
import { Gui } from './Gui'

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
	controls: Map<string, ValidInput>
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
	search: Search

	title: string
	children: Folder[]
	controls: Map<string, ValidInput>
	parentFolder: Folder

	element: HTMLElement
	elements = {} as {
		header: HTMLElement
		toolbar: HTMLElement
		title: HTMLElement
		contentWrapper: HTMLElement
		content: HTMLElement
	}

	closed = state(false)

	#log = new Logger('Folder', {
		fg: 'DarkSalmon',
		deferred: false,
		server: false,
	})

	#folderIcon?: HTMLElement
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

	constructor(options: FolderOptions, rootContainer: HTMLElement | null = null) {
		const opts = Object.assign({}, options)
		this.#log.fn('constructor').info({ opts, this: this })

		this.title = opts.title ?? ''
		this.children = opts.children ?? []
		this.controls = opts.controls ?? new Map<string, ValidInput>()

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

		this.search = new Search(this.elements.toolbar)

		if (opts.closed) this.closed.set(opts.closed)

		// Open/close the folder when the closed state changes.
		this.#subs.push(
			this.closed.subscribe((v) => {
				v ? this.close() : this.open()
			}),
		)
	}

	// todo - with the addition of the dataset `dragged` attribute from draggable, this might not be necessary.
	#skip_header_click_if_drag = (event: PointerEvent) => {
		if (event.button !== 0) return

		this.element.addEventListener('pointerup', this.toggle, { once: true })

		// todo - Figure out why `stopPropagation` doesn't work so we don't need this.
		if (cancelClassFound(event)) return this.disable()

		// We need to watch for the mouseup event within a certain timeframe
		// to make sure we don't accidentally trigger a click after dragging.
		clearTimeout(this.#disabledTimer)
		// First we delay the drag check to allow for messy clicks.
		this.#disabledTimer = setTimeout(() => {
			this.elements.header.addEventListener('pointermove', this.disable, { once: true })

			// Then we set a timer to disable the drag check.
			this.#disabledTimer = setTimeout(() => {
				this.elements.header.removeEventListener('pointermove', this.disable)
				this.element.removeEventListener('pointerup', this.toggle)
				this.#disabled = false
			}, this.#clickTime)
		}, 150)

		if (this.#disabled) return
	}

	disable = () => {
		if (!this.#disabled) {
			this.#disabled = true
			this.#log.fn('disable').debug('Clicks DISABLED')
		}
		this.#disabled = true
		clearTimeout(this.#disabledTimer)
	}

	reset() {
		this.#log.fn('cancel').debug('Clicks ENABLED')
		removeEventListener('pointerup', this.toggle)
		this.#disabled = false
	}

	#createElements(el?: HTMLElement) {
		const element =
			el ??
			create('div', {
				parent: this.parentFolder.elements.content,
				classes: ['fracgui-folder'],
				// dataset: { id: this.id },
			})
		if (el) el.classList.add('fracgui-root')

		const header = create('div', {
			parent: element,
			classes: ['fracgui-header'],
		})
		header.addEventListener('pointerdown', this.#skip_header_click_if_drag)
		if (!this.isRoot) {
			header.appendChild(this.#folderIcon!)
		}

		const title = create('h2', {
			parent: header,
			classes: ['fracgui-title'],
			textContent: this.title,
		})

		const toolbar = create('div', {
			parent: header,
			classes: ['fracgui-toolbar'],
		})

		const contentWrapper = create('div', {
			classes: ['fracgui-content-wrapper'],
			parent: element,
		})
		const content = create('div', {
			classes: ['fracgui-content'],
			parent: contentWrapper,
		})

		return {
			element,
			elements: {
				header,
				toolbar,
				title,
				contentWrapper,
				content,
			},
		}
	}

	#createRootElement(container: HTMLElement | null = null) {
		container ??= document.body

		const rootEl = create('div', {
			classes: ['fracgui-root'],
			id: 'fracgui-root',
			dataset: { theme: this.root.theme },
		})

		return rootEl
	}

	#createIcon() {
		const strokeWidth = 1
		const x = 12
		const y = 12
		const r = 4
		const fill = 'var(--bg-a)'
		const theme = 'var(--theme-a)'
		const altStroke = 'var(--fg-d)'

		this.#folderIcon ??= document.createElement('div')
		this.#folderIcon.classList.add('icon-folder-container')

		const orbCount = this.allChildren.length + this.controls.size
		this.#folderIcon.style.setProperty(
			'filter',
			`hue-rotate(${-60 + (orbCount % 360) * 20}deg)`,
		)

		const circs = [
			{ id: 1, cx: 16.43, cy: 11.93, r: 1.1103 },
			{ id: 2, cx: 15.13, cy: 15.44, r: 0.8081 },
			{ id: 3, cx: 15.13, cy: 8.423, r: 0.8081 },
			{ id: 4, cx: 12.49, cy: 16.05, r: 0.4788 },
			{ id: 5, cx: 12.42, cy: 7.876, r: 0.545 },
			{ id: 6, cx: 10.43, cy: 15.43, r: 0.2577 },
			{ id: 7, cx: 10.43, cy: 8.506, r: 0.2769 },
			{ id: 8, cx: 17.85, cy: 14.59, r: 0.5635 },
			{ id: 9, cx: 17.85, cy: 9.295, r: 0.5635 },
			{ id: 10, cx: 19.19, cy: 12.95, r: 0.5635 },
			{ id: 11, cx: 19.19, cy: 10.9, r: 0.5635 },
			{ id: 12, cx: 20.38, cy: 11.96, r: 0.2661 },
			{ id: 13, cx: 19.74, cy: 14.07, r: 0.2661 },
			{ id: 14, cx: 19.74, cy: 9.78, r: 0.2661 },
			{ id: 15, cx: 20.7, cy: 12.96, r: 0.2661 },
			{ id: 16, cx: 20.7, cy: 10.9, r: 0.2661 },
			{ id: 17, cx: 21.38, cy: 11.96, r: 0.2661 },
		] as const

		function circ(c: { id: number; cx: number; cy: number; r: number }) {
			return /*html*/ `<circle
				class="alt c${c.id}"
				cx="${c.cx * 1.1}"
				cy="${c.cy}"
				r="${c.r}"
				style="transition-delay: ${c.id * 0.05}s;"
			/>`
		}

		function toCircs(ids: number[]) {
			return ids.map((id) => circ(circs[id - 1])).join('\n')
		}

		const circMap = {
			0: [],
			1: [1],
			2: [2, 3],
			3: [1, 2, 3],
			4: [2, 3, 4, 5],
			5: [1, 2, 3, 4, 5],
			6: [2, 3, 4, 5, 6, 7],
			7: [1, 2, 3, 4, 5, 6, 7],
			8: [1, 2, 3, 4, 5, 6, 7, 8],
			9: [1, 2, 3, 4, 5, 6, 7, 8, 9],
			10: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
			11: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
			12: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
			13: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
			14: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
			15: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
			16: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
			17: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
		}

		const circles = toCircs(circMap[Math.min(orbCount, circs.length)])
		const bounce = 'cubic-bezier(0.36, 0, 0.66, -0.56)'
		const ease = 'cubic-bezier(0.23, 1, 0.320, 1)'

		const css = /*css*/ `
			.icon-folder {
				overflow: visible;
			}

			.icon-folder circle, .icon-folder line {
				transform-origin: center;

				transition-duration: 0.33s;
				transition-timing-function: ${ease};
			}

			/*//?	Circle A	*/
			.icon-folder circle.a {
				transform: scale(1);
				
				stroke: ${theme};
				fill: ${fill};
				
				transition: all .2s ${bounce}, stroke 2s ${bounce};
			}
			.closed .icon-folder circle.a {
				transform: scale(0.5);

				stroke: ${fill};
				fill: ${theme};

			}

			/*//?	Circle B	*/
			.icon-folder circle.b {
				transform: scale(1);
				
				fill: ${fill};
			}
			.closed .icon-folder circle.b {
				transform: scale(1.75);

				stroke: none;
				fill: ${fill};

				transition-duration: 0.5s;
				transition-timing-function: cubic-bezier(0.83, 1, 0.820, 1);
			}

			/*//?	Circle Alt	*/
			.icon-folder circle.alt {
				transform: translate(-3px, 0) scale(1.8);

				stroke: none;
				fill: ${theme};

				transition-duration: 0.5s;
				transition-timing-function: ${ease};
			}
			.closed .icon-folder circle.alt {
				transform: translate(0, 0) scale(0);

				transition-duration: 1.5s;
				transition-timing-function: ${ease};
			}
		`.trim()

		this.#folderIcon.innerHTML = /*html*/ `
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="100%"
			height="100%"
			viewBox="0 0 24 24"
			fill="none"
			stroke-width="${strokeWidth}"
			stroke-linecap="round"
			stroke-linejoin="round"
			class="icon-folder"
			overflow="visible"
		>
			<circle class="b" cx="${x}" cy="${y}" r="${r}" stroke="${altStroke}" stroke-width="0.1" fill="none" />

			<circle class="a" cx="${x}" cy="${y}" r="${r}" stroke="${theme}" fill="${fill}" />

			${circles}

			<style lang="css">
				${css}
			</style>
		</svg>`.trim()

		if (this.closed.value) this.#folderIcon.classList.add('closed')

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

	add(options: NumberInputOptions): InputNumber
	add(options: ColorInputOptions): InputColor
	add(options: InputOptions): ValidInput {
		const input = this.#createInput(options)
		this.controls.set(input.title, input)
		this.#createIcon()
		return input
	}

	addMany(obj: Record<string, any>) {
		// todo
	}

	addNumber(options: Partial<NumberInputOptions>) {
		const input = new InputNumber(options, this)
		this.controls.set(input.title, input)
		this.#createIcon()
		return input
	}

	addColor(options: Partial<ColorInputOptions>) {
		const input = new InputColor(options, this)
		this.controls.set(input.title, input)
		this.#createIcon()
		return input
	}

	#createInput(options: InputOptions) {
		const type = this.resolveType(
			options.value ?? options.binding!.target[options.binding!.key],
		)

		switch (type) {
			case 'Number':
				return new InputNumber(options as NumberInputOptions, this)
			case 'Color':
				return new InputColor(options as ColorInputOptions, this)
		}

		throw new Error('Invalid input view: ' + options)
	}

	resolveType(value: any): InputType {
		switch (typeof value) {
			case 'number':
				return 'Number'
			case 'string':
				if (isColorFormat(value)) return 'Color'
			case 'object':
				if (Array.isArray(value)) {
					return 'Select'
				}
				if (isColor(value)) {
					return 'Color'
				}
			default:
				throw new Error('Invalid input view: ' + value)
		}
	}

	isGui(): this is Gui {
		return this.isRoot
	}

	toggle = () => {
		// this.#log.fn('toggle').info()
		clearTimeout(this.#disabledTimer)
		if (this.#disabled) {
			this.reset()
			return
		}

		//? If the folder is being dragged, don't toggle.
		if (this.element.classList.contains('fractils-dragged')) {
			this.element.classList.remove('fractils-dragged')
			return
		}

		const state = !this.closed.value
		if (this.isGui()) {
			state ? this.close(true) : this.open(true)
		} else {
			this.closed.set(state)
		}
	}

	open(updateState = false) {
		// this.#log.fn('open').info()
		this.element.classList.remove('closed')
		if (updateState) this.closed.set(false)
		this.#disabled = false

		this.#toggleAnimClass()
	}

	close(updateState = false) {
		this.#log.fn('close').info()

		this.element.classList.add('closed')
		if (updateState) this.closed.set(true)
		this.#disabled = false

		this.#toggleAnimClass()
	}

	#toggleAnimClass = () => {
		this.element.classList.add('animating')
		setTimeout(() => {
			this.element.classList.remove('animating')
		}, 500) // todo - this needs to sync with the animation duration in the css... smelly.
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
			this.#log.fn('dispose').error('Error removing folder from parent', { err })
		}
	}
}

// Test

// const gui = new Gui()
// const folder = gui.addFolder({ title: 'wow' })

// //? Values

// const a = folder.addNumber({ title: 'size', value: 0 })
// const b = folder.addColor({ title: 'background', value: '#ff0000' })
// const c = folder.add({ title: 'count', value: 0, min: 0, max: 100, step: 1 })

// //? Bindings

// const params = {
// 	background: '#ff0000',
// 	dimensions: {
// 		width: 100,
// 		height: 100,
// 	},
// }

// const wow = folder.add({
// 	title: 'width',
// 	// value: 10,
// 	binding: { target: params.dimensions, key: 'width' },
// 	min: 0,
// 	max: 1000,
// 	step: 1,
// })
