import type { ElementMap, InputOptions } from './Input'
import type { Folder } from '../Folder'

// import { buttonController } from '../controllers/button'
import { Logger } from '../../utils/logger'
import { create } from '../../utils/create'
import { state } from '../../utils/state'
import { Input } from './Input'

export interface ButtonItem {
	text: string
	onClick: () => void
}

export interface ButtonGridItem extends ButtonItem {
	element: HTMLButtonElement & {
		dataset: {
			id: string
			row: string
			col: string
		}
	}
}

export type ButtonGrid = ButtonItem[][]

export type ButtonGridClickFunction = (this: InputButtonGrid) => void

export type ButtonGridInputOptions = {
	title: string
	grid: ButtonGrid
} & InputOptions<ButtonGrid>

export const BUTTONGRID_INPUT_DEFAULTS: ButtonGridInputOptions = {
	title: '',
	grid: [
		[
			{ text: 'foo', onClick: () => console.log('foo') },
			{ text: 'bar', onClick: () => console.log('bar') },
			{ text: 'baz', onClick: () => console.log('baz') },
		],
		[
			{ text: 'foo', onClick: () => console.log('foo') },
			{ text: 'bar', onClick: () => console.log('bar') },
		],
		[{ text: 'baz', onClick: () => console.log('baz') }],
	],
} as const

export interface ButtonGridControllerElements extends ElementMap {
	container: HTMLElement
	buttonGrid: HTMLButtonElement[]
}

export type ButtonId = string

export class InputButtonGrid extends Input<
	ButtonGrid,
	ButtonGridInputOptions,
	ButtonGridControllerElements
> {
	type = 'ButtonGrid' as const
	buttons: Map<ButtonId, ButtonGridItem> = new Map()
	buttonGrid: ButtonGrid
	initialValue: ButtonGrid

	#log = new Logger('InputButtonGrid', { fg: 'cyan' })

	constructor(options: Partial<ButtonGridInputOptions>, folder: Folder) {
		const opts = Object.assign({}, BUTTONGRID_INPUT_DEFAULTS, options)
		super(opts, folder)

		this.buttonGrid = this.initialValue = opts.grid

		this.#log.fn('constructor').info({ opts, this: this }).groupEnd()
		this.opts = opts

		if (opts.binding) {
			this.initialValue = opts.binding.target[opts.binding.key]
			// this.state = state(this.initialValue)

			this.disposeCallbacks.add(
				this.state.subscribe(v => {
					opts.binding!.target[opts.binding!.key] = v
				}),
			)
		} else {
			this.state = state(opts.value!)
		}

		const container = create('div', {
			classes: ['fracgui-input', 'fracgui-input-buttongrid-container'],
			parent: this.elements.content,
		})

		this.elements.controllers = {
			container,
			buttonGrid: [],
		} as const satisfies ButtonGridControllerElements

		this.disposeCallbacks.add(this.state.subscribe(this.refresh))

		this.toGrid(this.buttonGrid)
	}

	toGrid = (grid: ButtonGrid) => {
		// The grid is a 2D array of ButtonItems.  We need to get the  rows and
		// columns of the grid, assign them to buttons we create, update the container's
		// css grid properties, populate it with buttons, etc
		const rows = grid.length
		const cols = Math.max(...grid.map(row => row.length))

		// this.elements.controllers.container.style.setProperty(
		// 	'grid-template-columns',
		// 	`repeat(${cols}, 1fr)`,
		// )
		// this.elements.controllers.container.style.setProperty(
		// 	'grid-template-rows',
		// 	`repeat(${rows}, 1fr)`,
		// )
		// this.elements.controllers.container.style.gridTemplateColumns =  `repeat(${cols}, 1fr)`
		// this.elements.controllers.container.style.gridTemplateRows =  `repeat(${rows}, 1fr)`
		// this.elements.controllers.container.style.gridAutoColumns = '1fr'
		// this.elements.controllers.container.style.gridAutoRows = '1fr'

		// Remove all buttons.
		for (const { element } of this.buttons.values()) {
			element.remove()
		}
		this.buttons.clear()

		for (let i = 0; i < rows; i++) {
			const row = create('div', {
				classes: ['fracgui-controller-buttongrid-row'],
				parent: this.elements.controllers.container,
			})
			for (let j = 0; j < cols; j++) {
				const btn = grid[i]?.[j]
				if (btn) {
					const id = btn.text + i + j
					const button = this.addButton(btn, id, i, j)
					row.appendChild(button)
				}
			}
		}

		this.elements.container.style.setProperty(
			'height',
			getComputedStyle(this.elements.controllers.container).height,
		)
		// Create new buttons.
	}

	addButton = (btn: ButtonItem, id: string, i: number, j: number) => {
		const { text, onClick } = btn

		const button = create('button', {
			classes: [
				'fracgui-controller',
				'fracgui-controller-button',
				'fracgui-controller-buttongrid-button',
			],
			textContent: text,
			dataset: {
				id,
				row: String(i),
				col: String(j),
			},
		})

		button.addEventListener('click', onClick)

		this.buttons.set(id, {
			element: button,
			text: text,
			onClick,
		})

		this.listen(button, 'click', onClick)

		return button
	}

	static initialized = false
	static init() {
		if (this.initialized) return
		this.initialized = true

		const style = document.createElement('style')
		style.textContent = this.style
		document.head.appendChild(style)
	}
	static style = /*css*/ `
		.fracgui-controller-buttons-container {
			display: flex;
			flex-wrap: wrap;
			gap: 0.5em;
		}
		.fracgui-controller-buttons-button {
			padding: 0.5em 1em;
			margin: 0.25em;
			border: none;
			background-color: #333;
			color: white;
			cursor: pointer;
		}
	`

	enable() {
		for (const { element } of this.buttons.values()) {
			element.disabled = false
			element.classList.remove('disabled')
		}
		this.disabled = false
		return this
	}
	disable() {
		for (const { element } of this.buttons.values()) {
			element.disabled = true
			element.classList.add('disabled')
		}
		this.disabled = true
		return this
	}

	set = () => {
		throw new Error('not implemented')
	}

	dispose() {
		super.dispose()
	}
}
