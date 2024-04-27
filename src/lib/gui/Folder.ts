import type { InputOptions, InputType, ValidInput } from './inputs/Input'
import type { Option } from './controllers/Select'

import { InputButtonGrid, type ButtonGridInputOptions } from './inputs/InputButtonGrid'
import { InputSwitch, type SwitchInputOptions } from './inputs/InputSwitch'
import { InputButton, type ButtonInputOptions } from './inputs/InputButton'
import { InputSelect, type SelectInputOptions } from './inputs/InputSelect'
import { InputNumber, type NumberInputOptions } from './inputs/InputNumber'
import { InputColor, type ColorInputOptions } from './inputs/InputColor'
import { InputText, type TextInputOptions } from './inputs/InputText'

import { composedPathContains } from '../internal/cancelClassFound'
import { isColor, isColorFormat } from '../color/color'
import settingsIcon from './svg/settings-icon.svg?raw'
import { Search } from './toolbar/Search'
import { create } from '../utils/create'
import { nanoid } from '../utils/nanoid'
import { Logger } from '../utils/logger'
import { state } from '../utils/state'
import { Gui } from './Gui'

export interface FolderElements {
	header: HTMLElement
	title: HTMLElement
	contentWrapper: HTMLElement
	content: HTMLElement
	toolbar: {
		container: HTMLElement
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
	title?: string
	/**
	 * The child folders of this folder.
	 */
	children?: Folder[]
	/**
	 * Any controls this folder should contain.
	 */
	controls?: Map<string, ValidInput>
	parentFolder: Folder
	/**
	 * Whether the folder should be collapsed by default.
	 * @default false
	 */
	closed?: boolean
	/**
	 * Whether the folder should be hidden by default.  If a function is
	 * provided, it will be called to determine the hidden state.  Use
	 * {@link refresh} to update the hidden state.
	 * @default false
	 */
	hidden?: boolean | (() => boolean)
	/**
	 * The element to append the folder to (usually
	 * the parent folder's content element).
	 */
	element?: HTMLElement
	/**
	 * The depth of the folder in the hierarchy.
	 */
	depth: number
}

/**
 * @internal
 */
export class Folder {
	id = nanoid()
	isFolder = true as const
	isRoot = false

	static #i = 0
	index = Folder.#i++
	depth: number

	root: Gui
	search: Search

	#title: string
	children: Folder[]
	inputs: Map<string, ValidInput>
	parentFolder: Folder

	closed = state(false)

	element: HTMLElement
	elements = {} as FolderElements
	graphics?: {
		icon: HTMLDivElement
		connector: {
			container: HTMLDivElement
			svg: SVGElement
			path: SVGPathElement
		}
	}

	#subs: Array<() => void> = []
	#log: Logger
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
	/**
	 * Whether the folder is visible.
	 */
	// @ts-expect-error - // todo
	#hidden: boolean | (() => boolean)
	/** {@link FolderOptions.hidden} if it was provided as a `function`. */
	// @ts-expect-error - // todo
	#hiddenFunction?: () => boolean

	constructor(options: FolderOptions, rootContainer: HTMLElement | null = null, instant = true) {
		const opts = Object.assign({}, options)

		this.#log = new Logger('Folder:' + opts.title, {
			fg: 'DarkSalmon',
			deferred: false,
			server: false,
		})
		this.#log.fn('constructor').debug({ opts, this: this })

		this.depth = opts.depth ?? 0
		this.#title = opts.title ?? ''
		this.children = opts.children ?? []
		this.inputs = opts.controls ?? new Map<string, ValidInput>()

		if (rootContainer) {
			this.root = this as any as Gui
			this.isRoot = true
			this.parentFolder = this

			if (!this.isGui()) throw new Error('Root folder must be a GUI.')

			const rootEl = this.#createRootElement(rootContainer)
			const { element, elements } = this.#createElements(rootEl)
			this.element = element

			const settingsButton = this.#createSettingsButton(elements.toolbar.container)

			this.elements = {
				...elements,
				toolbar: {
					container: elements.toolbar.container,
					settingsButton,
				},
			}

			// @ts-expect-error
			this.theme = opts.theme
		} else {
			this.parentFolder = opts.parentFolder
			this.root = this.parentFolder.root
			const { element, elements } = this.#createElements(opts.element)
			this.element = element
			this.elements = elements
		}

		this.search = new Search(this)

		if (opts.closed) {
			this.closed.set(opts.closed)
		} else if (instant) {
			// We need to bypass animations so I can get the rect.
			this.element.classList.add('instant')
			setTimeout(() => {
				this.element.classList.remove('instant')
			}, 0)
		}

		this.#hidden = opts.hidden ?? false
		// if (opts.hidden === true) {
		// 	this.hide()
		// } else {
		// 	this.show()
		// }

		// Open/close the folder when the closed state changes.
		this.#subs.push(
			this.closed.subscribe(v => {
				v ? this.close() : this.open()
			}),
		)

		Promise.resolve().then(() => {
			if (!this.isRoot) {
				this.graphics = this.#createSvgs()
				this.elements.header.prepend(this.graphics.icon)
				this.element.prepend(this.graphics.connector.container)
			}
		})
	}

	/**
	 * The folder's title.  Reactive to assignments.
	 */
	get title() {
		return this.#title
	}
	set title(v: string) {
		if (v === this.#title) return
		this.#title = v
		this.elements.title.animate(
			{
				opacity: 0,
				transform: 'translateY(-0.33rem)',
			},
			{
				duration: 75,
				easing: 'ease-out',
				fill: 'forwards',
			},
		).onfinish = () => {
			this.elements.title.textContent = v
			this.elements.title.animate(
				[
					{
						opacity: 0,
						transform: 'translateY(.33rem)',
					},
					{
						opacity: 1,
						transform: 'translateY(0rem)',
					},
				],
				{
					delay: 0,
					duration: 75,
					easing: 'ease-in',
					fill: 'forwards',
				},
			)
		}
	}

	/**
	 * A flat array of all child folders of this folder (and their children, etc).
	 */
	get allChildren(): Folder[] {
		return this.children.flatMap<Folder>(child => [child, ...child.allChildren])
	}

	/**
	 * A flat array of all controls of all child folders of this folder (and their children, etc).
	 * See Input Generators region.
	 */
	get allInputs(): Map<string, ValidInput> {
		const allControls = new Map<string, ValidInput>()
		for (const child of [this, ...this.allChildren]) {
			for (const [key, value] of child.inputs.entries()) {
				allControls.set(key, value)
			}
		}
		return allControls
	}

	isGui(): this is Gui {
		return this.isRoot
	}

	//· Folders ···································································¬

	addFolder(options?: { title?: string; closed?: boolean; header?: boolean; hidden?: boolean }) {
		const folder = new Folder({
			title: options?.title ?? '',
			controls: new Map(),
			parentFolder: this,
			children: [],
			closed: options?.closed ?? false,
			hidden: options?.hidden ?? false,
			depth: this.depth + 1,
		})

		this.children.push(folder)
		this.#createSvgs()

		if (options?.header === false) {
			folder.elements.header.style.display = 'none'
		}

		return folder
	}

	#handleClick(event: PointerEvent) {
		if (event.button !== 0) return

		this.element.removeEventListener('pointerup', this.toggle.bind(this))
		this.element.addEventListener('pointerup', this.toggle.bind(this), { once: true })

		// todo - with the addition of the dataset `dragged` attribute from draggable, this might not be necessary.
		// todo - Figure out why `stopPropagation` doesn't work so we don't need this.
		if (composedPathContains(event, 'fractils-cancel')) return this.#disable()

		// We need to watch for the mouseup event within a certain timeframe
		// to make sure we don't accidentally trigger a click after dragging.
		clearTimeout(this.#disabledTimer)
		// First we delay the drag check to allow for messy clicks.
		this.#disabledTimer = setTimeout(() => {
			this.elements.header.removeEventListener('pointermove', this.#disable.bind(this))
			this.elements.header.addEventListener('pointermove', this.#disable.bind(this), {
				once: true,
			})

			// Then we set a timer to disable the drag check.
			this.#disabledTimer = setTimeout(() => {
				this.elements.header.removeEventListener('pointermove', this.#disable.bind(this))
				this.element.removeEventListener('pointerup', this.toggle.bind(this))
				this.#disabled = false
			}, this.#clickTime)
		}, 150)

		if (this.#disabled) return
	}
	#disable() {
		if (!this.#disabled) {
			this.#disabled = true
			this.#log.fn('disable').debug('Clicks DISABLED')
		}
		this.#disabled = true
		clearTimeout(this.#disabledTimer)
	}
	#reset() {
		this.#log.fn('cancel').debug('Clicks ENABLED')
		removeEventListener('pointerup', this.toggle)
		this.#disabled = false
	}

	//·· Open/Close ···························································¬

	toggle() {
		this.#log.fn('toggle').debug()
		clearTimeout(this.#disabledTimer)
		if (this.#disabled) {
			this.#reset()
			return
		}

		// If the folder is being dragged, don't toggle. // todo - Is this doing anything?
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
		this.#log.fn('open').debug()
		this.element.classList.remove('closed')
		if (updateState) this.closed.set(false)
		this.#disabled = false

		this.#toggleAnimClass()
		this.#animateConnector('open')
	}

	close(updateState = false) {
		this.#log.fn('close').debug()

		this.element.classList.add('closed')
		if (updateState) this.closed.set(true)
		this.#disabled = false

		this.#toggleAnimClass()
		this.#animateConnector('close')
	}

	toggleHidden() {
		this.#log.fn('toggleHidden').debug()
		this.element.classList.toggle('hidden')
	}

	hide() {
		this.#log.fn('hide').debug()
		this.element.classList.add('hidden')
		// this.#hiddenFunction = typeof this.#hidden === 'function' ? this.#hidden : undefined
	}

	show() {
		this.#log.fn('show').debug()
		this.element.classList.remove('hidden')
		// this.#hiddenFunction = undefined
	}

	#toggleTimeout!: ReturnType<typeof setTimeout>
	#toggleAnimClass = () => {
		this.element.classList.add('animating')

		clearTimeout(this.#toggleTimeout)
		this.#toggleTimeout = setTimeout(() => {
			this.element.classList.remove('animating')
		}, 600) // todo - This needs to sync with the animation duration in the css... smelly.
	}
	//⌟
	//⌟

	//· Input Generators ·····················································¬

	add(title: string, options: SwitchInputOptions): InputSwitch
	add(options: SwitchInputOptions, never?: never): InputSwitch
	add(title: string, options: NumberInputOptions): InputNumber
	add(options: NumberInputOptions, never?: never): InputNumber
	add(title: string, options: TextInputOptions): InputText
	add(options: TextInputOptions, never?: never): InputText
	add(title: string, options: ColorInputOptions): InputColor
	add(options: ColorInputOptions, never?: never): InputColor
	add(title: string, options: ButtonInputOptions): InputButton
	add(options: ButtonInputOptions, never?: never): InputButton
	add(title: string, options: ButtonGridInputOptions): InputButtonGrid
	add(options: ButtonGridInputOptions, never?: never): InputButtonGrid
	add<T>(title: string, options: SelectInputOptions<T>): InputSelect<T>
	add<T>(options: SelectInputOptions<T>, never?: never): InputSelect<T>
	add(options: InputOptions, never?: never): ValidInput
	add(titleOrOptions: string | InputOptions, maybeOptions?: InputOptions): ValidInput {
		const twoArgs = typeof titleOrOptions === 'string' && typeof maybeOptions === 'object'
		const title = twoArgs ? (titleOrOptions as string) : maybeOptions?.title ?? ''
		const options = twoArgs ? maybeOptions! : (titleOrOptions as InputOptions)
		if (!twoArgs && options) options.title ??= title

		const input = this.#createInput(options)
		this.inputs.set(input.title, input)
		this.#refreshIcon()
		return input
	}

	// todo - This should take any object and build the inputs from it.
	// addMany(obj: Record<string, any>) {}

	addNumber(options: Partial<NumberInputOptions>) {
		const input = new InputNumber(options, this)
		this.inputs.set(input.title, input)
		this.#refreshIcon()
		return input
	}

	addText(options: Partial<TextInputOptions>) {
		const input = new InputText(options, this)
		this.inputs.set(input.title, input)
		this.#refreshIcon()
		return input
	}

	addColor(options: Partial<ColorInputOptions>) {
		const input = new InputColor(options, this)
		this.inputs.set(input.title, input)
		this.#refreshIcon()
		return input
	}

	addButton(options: Partial<ButtonInputOptions>) {
		const input = new InputButton(options, this)
		this.inputs.set(input.title, input)
		this.#refreshIcon()
		return input
	}

	addButtonGrid(options: Partial<ButtonGridInputOptions>) {
		const input = new InputButtonGrid(options, this)
		this.inputs.set(input.title, input)
		this.#refreshIcon()
		return input
	}

	addSelect<T>(options: Partial<SelectInputOptions<T>>) {
		const input = new InputSelect(options, this)
		this.inputs.set(input.title, input)
		this.#refreshIcon()
		return input
	}

	addSwitch(options: Partial<SwitchInputOptions>) {
		const input = new InputSwitch(options, this)
		this.inputs.set(input.title, input)
		this.#refreshIcon()
		return input
	}

	#createInput(options: InputOptions) {
		const type = this.resolveType(options)

		switch (type) {
			case 'Text':
				return new InputText(options as TextInputOptions, this)
			case 'Number':
				return new InputNumber(options as NumberInputOptions, this)
			case 'Color':
				return new InputColor(options as ColorInputOptions, this)
			case 'Select':
				return new InputSelect(options as SelectInputOptions<Option<any>>, this)
			case 'Button':
				return new InputButton(options as ButtonInputOptions, this)
			case 'Switch':
				return new InputSwitch(options as SwitchInputOptions, this)
		}

		throw new Error('Invalid input view: ' + options)
	}

	resolveType(options: any): InputType {
		const value = options.value ?? options.binding!.target[options.binding!.key]

		if ('onClick' in options) {
			return 'Button'
		}

		if ('options' in options) {
			return 'Select'
		}

		switch (typeof value) {
			case 'boolean':
				// todo - We need some way to differentiate between a switch and a checkbox once the checkbox is added.
				// if ((options as SwitchInputOptions).labels) return 'Switch'
				return 'Switch'
			case 'number':
				return 'Number'
			case 'string':
				if (isColorFormat(value)) return 'Color'
				// todo - Could detect CSS units like `rem` and `-5px 0 0 3px` for an advanced `CSSTextInput`.
				// todo - Or even better, a "TextWithComponents" input that can have any number of "components" (like a color picker, number, select, etc) inside a string.
				return 'Text'
			case 'function':
				return 'Button'
			case 'object':
				if (Array.isArray(value)) {
					return 'Select'
				}
				if (isColor(value)) {
					return 'Color'
				}
				throw new Error('Invalid input view: ' + JSON.stringify(value))
			default:
				throw new Error('Invalid input view: ' + value)
		}
	}
	//⌟

	//· Elements ·····························································¬

	#createElements(el?: HTMLElement): { element: HTMLElement; elements: FolderElements } {
		const element =
			el ??
			create('div', {
				parent: this.parentFolder.elements.content,
				classes: ['fracgui-folder', 'closed'],
				// metaurl: import.meta.url, // todo - there must be a solution for this
			})

		if (!element) throw new Error('Failed to create element.')

		if (el) el.classList.add('fracgui-root')

		const header = create('div', {
			parent: element,
			classes: ['fracgui-header'],
		})
		header.addEventListener('pointerdown', this.#handleClick.bind(this))

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
				toolbar: {
					container: toolbar,
				},
				title,
				contentWrapper,
				content,
			},
		}
	}

	// @ts-expect-error - // todo - Why tf can't typescript see this is used?
	#createRootElement(container: HTMLElement | null = null) {
		container ??= document.body

		const rootEl = create('div', {
			classes: ['fracgui-root', 'fracgui-folder', 'closed'],
			id: 'fracgui-root',
			dataset: { theme: this.root.theme ?? 'default' },
		})

		return rootEl
	}

	// @ts-expect-error - // todo - Why tf can't typescript see this is used?
	#createSettingsButton(parent: HTMLElement) {
		if (!this.isGui()) {
			throw new Error('Settings button can only be created on the root folder.')
		}

		const svg = new DOMParser().parseFromString(settingsIcon, 'image/svg+xml').documentElement

		const button = create<'button', any, HTMLButtonElement>('button', {
			parent,
			classes: ['fracgui-toolbar-item', 'fracgui-settings-button'],
			children: [svg],
			tooltip: {
				text: () => {
					return this.settingsFolder?.closed.value ? 'Open Settings' : 'Close Settings'
				},
				placement: 'left',
				delay: 750,
				delayOut: 0,
				hideOnClick: true,
			},
		})

		button.addEventListener('click', () => {
			this.settingsFolder.toggle()

			this.elements.toolbar.settingsButton.classList.toggle(
				'open',
				!this.settingsFolder.closed.value,
			)
		})

		return button
	}
	//⌟

	//· SVG's ································································¬

	#createSvgs() {
		const icon = this.#createIcon()
		const connector = this.#createConnector()

		return { icon, connector }
	}

	get #hue() {
		const localIndex = this.parentFolder.children.indexOf(this)

		// todo - This will break if we ever add built-in folders other than "Settings Folder".
		const i = this.parentFolder.isGui() ? localIndex - 1 : localIndex
		// Don't count the root folder.
		const depth = this.depth - 1

		return i * 20 + depth * 80
	}

	//·· Icon ································································¬

	#createIcon() {
		const strokeWidth = 1
		const x = 12
		const y = 12
		const r = 4
		const fill = 'var(--fracgui-theme-a)'
		const theme = 'var(--fracgui-theme-a)'

		const icon = document.createElement('div')
		icon.classList.add('fracgui-folder-icon-container')

		const count = this.allChildren.length + this.inputs.size
		icon.style.setProperty('filter', `hue-rotate(${this.#hue}deg)`)

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
			return ids.map(id => circ(circs[id - 1])).join('\n')
		}

		const circMap: Record<number, number[]> = {
			0: [] as number[],
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

		const circles = toCircs(circMap[Math.min(count, circs.length)])
		const bounce = 'cubic-bezier(0.36, 0, 0.66, -0.56)'
		const ease = 'cubic-bezier(0.23, 1, 0.320, 1)'

		const css = /*css*/ `
			.icon-folder {
				overflow: visible;
				backface-visibility: hidden;
			}

			.icon-folder circle, .icon-folder line {
				transform-origin: center;

				transition-duration: 0.25s;
				transition-timing-function: ${ease};
				backface-visibility: hidden;
			}

			/*//?	Circle A	*/
			.icon-folder circle.a {
				transform: scale(1);
				
				stroke: transparent;
				fill: ${fill};
				
				transition: all .5s ${bounce}, stroke 2s ${bounce}, fill .2s ${bounce} 0s;
			}
			.closed .icon-folder circle.a {
				transform: scale(0.66);

				stroke: ${fill};
				fill: ${theme};

				transition: all .33s ${bounce}, stroke 2s ${bounce}, fill .2s ease-in 0.25s;
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

		icon.innerHTML = /*html*/ `
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
			<circle class="a" cx="${x}" cy="${y}" r="${r}" stroke="${theme}" fill="${fill}" />

			${circles}

			<style lang="css">
				${css}
			</style>
		</svg>`.trim()

		if (this.closed.value) icon.classList.add('closed')

		return icon
	}

	#refreshIcon() {
		if (this.graphics) {
			this.graphics.icon.replaceWith(this.#createIcon())
		}
	}
	//⌟

	//·· Connector ···························································¬

	#createConnector() {
		const container = create('div', {
			classes: ['fracgui-connector-container'],
		})

		const width = 20
		const height = this.element.clientHeight
		const stroke = 1

		//? SVG
		const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
		svg.setAttribute('class', 'fracgui-connector-svg')
		svg.setAttribute('width', `${width}`)
		svg.setAttribute('stroke-width', `${stroke}`)
		svg.setAttribute('viewBox', `0 0 ${width} ${height}`)
		svg.setAttribute('overflow', 'visible')
		svg.setAttribute('backface-visibility', 'hidden')

		svg.setAttribute('preserveAspectRatio', 'xMinYMin slice')

		svg.style.setProperty('position', 'absolute')
		svg.style.setProperty('display', 'flex')
		svg.style.setProperty('top', '0')
		svg.style.setProperty('left', '0')
		svg.style.setProperty('width', '20px')
		svg.style.setProperty('height', '100%')
		svg.style.setProperty('pointer-events', 'none')
		svg.style.setProperty('overflow', 'hidden')
		svg.style.setProperty('z-index', '10')
		svg.style.setProperty('filter', `hue-rotate(${this.#hue}deg)`)

		//? Path
		const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
		path.setAttribute('vector-effect', 'non-scaling-stroke')
		path.setAttribute('fill', 'none')
		path.setAttribute('stroke', 'var(--fracgui-theme-a)')
		path.setAttribute('stroke-width', `${stroke}`)
		path.setAttribute('stroke-linecap', 'round')
		path.setAttribute('stroke-linejoin', 'round')
		path.setAttribute('d', `M10,0 Q0,0 0,10 L0,${height}`)
		const headerHeight = this.elements.header.clientHeight
		path.setAttribute('transform', `translate(0, ${headerHeight / 2})`)

		//? Path Gradient
		const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
		const linearGradient = document.createElementNS(
			'http://www.w3.org/2000/svg',
			'linearGradient',
		)
		linearGradient.setAttribute('id', 'gradient')
		linearGradient.setAttribute('x1', '0%')
		linearGradient.setAttribute('y1', '0%')
		linearGradient.setAttribute('x2', '0%')
		linearGradient.setAttribute('y2', '100%')

		function stop(offset: number, opacity: number, color = 'var(--fracgui-theme-a)') {
			const stop = document.createElementNS('http://www.w3.org/2000/svg', 'stop')
			stop.setAttribute('offset', `${offset}%`)
			stop.setAttribute('style', `stop-color: ${color}; stop-opacity: ${opacity}`)
			linearGradient.appendChild(stop)
			return stop
		}

		stop(0, 0.5)
		stop(1, 0.5)
		stop(5, 0.4)
		stop(20, 0.3)
		stop(40, 0.2)
		stop(100, 0.2)

		path.setAttribute('stroke', 'url(#gradient)')

		//? Appending
		defs.appendChild(linearGradient)
		svg.insertBefore(defs, svg.firstChild)
		svg.appendChild(path)
		container.appendChild(svg)

		return {
			container,
			svg,
			path,
		}
	}

	#animateConnector(action: 'open' | 'close') {
		if (!this.graphics) return
		const path = this.graphics.connector.path
		const length = `${path.getTotalLength()}`
		path.style.strokeDasharray = `${length}`

		const { duration, from, to, delay, easing } =
			action === 'open'
				? ({
						duration: 600,
						delay: 0,
						from: length,
						easing: 'cubic-bezier(.29,.1,.03,.94)',
						to: '0',
					} as const)
				: ({
						duration: 150,
						delay: 0,
						from: '0',
						easing: 'cubic-bezier(.15,.84,.19,.98)',
						to: length,
					} as const)

		const keyframes = [{ strokeDashoffset: from }, { strokeDashoffset: to }]

		const timing = {
			duration,
			delay,
			easing,
			fill: 'forwards',
		} as const satisfies KeyframeAnimationOptions

		this.graphics.connector.path.animate(keyframes, timing)
	}

	// todo - This will likely be needed when dynamically adding/removing inputs.
	#updateConnector(svg: SVGSVGElement, path: SVGPathElement) {
		if (!this.graphics) return

		// const svg = this.graphics.connector.svg

		const height = this.element.clientHeight
		svg.setAttribute('height', `${height * 0.1}`)
		// svg.style.setProperty('height', `${height}px`)

		const count = this.allChildren.length + this.inputs.size
		svg.style.setProperty('filter', `hue-rotate(${-60 + (count % 360) * 20}deg)`)

		const headerHeight = this.elements.header.clientHeight
		path.setAttribute('transform', `translate(0, ${headerHeight / 2})`)
		path.setAttribute('d', `M10,0 Q0,0 0,10 L0,${height}`)
		path.setAttribute('d', `M10,0 Q0,0 0,10 L0,${height}`)
	}
	//⌟
	//⌟

	onChange() {
		alert('// todo: not implemented')
	}

	dispose() {
		this.#subs.forEach(unsub => unsub())

		this.elements.header.removeEventListener('click', this.toggle)
		this.elements.header.addEventListener('pointerdown', this.#handleClick)

		this.element.remove()

		try {
			this.parentFolder.children.splice(this.parentFolder.children.indexOf(this), 1)
		} catch (err) {
			this.#log.fn('dispose').error('Error removing folder from parent', { err })
		}
	}
}
