import type { ElementMap, InputOptions } from './Input'
import type { Folder } from '../Folder'

import { create, type CreateOptions } from '../../utils/create'
// import { randomInt, randomString } from '$lib/utils/random'
// import { array as arr } from '$lib/utils/array'
import { Logger } from '../../utils/logger'
import { state } from '../../utils/state'
import { Input } from './Input'

/**
 * A button item to be added to the grid.  This is used in the
 * {@link ButtonGrid} generated in the {@link InputButtonGrid}
 * constructor.
 */
export interface ButtonItem {
	/**
	 * Text to display on the button.
	 */
	label: string
	/**
	 * Function to run when the button is clicked.  It is passed an object
	 * containing the input ({@link InputButtonGrid}), the text of the button,
	 * and the {@link HTMLButtonElement} itself.
	 */
	onClick: (data: { input: InputButtonGrid; text: string; button: HTMLButtonElement }) => void
	/**
	 * Optional function to determine if the button is active.  If the function
	 * returns `true`, the button will have the `active` class added to it, and
	 * removed if `false`.  This updates in {@link InputButtonGrid.refresh},
	 * which is called internally whenever the input
	 * {@link InputButtonGrid.state state} changes.
	 */
	isActive?: () => boolean
	/**
	 * Optional css styles.
	 * @example
	 * ```ts
	 * {
	 *   width: '50%',
	 *   'background-color': 'red',
	 *   border: '1px solid black',
	 * }
	 * ```
	 */
	style?: CreateOptions['style']
}

/**
 * A {@link ButtonItem} added to the grid is stored internally as a `ButtonGridItem`,
 * accessible via the {@link InputButtonGrid} map.
 */
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
	styles?: CreateOptions['style']
} & InputOptions<ButtonGrid>

export const BUTTONGRID_INPUT_DEFAULTS: ButtonGridInputOptions = {
	title: '',
	grid: [[{ label: '', onClick: () => {} }]],
	styles: {
		gap: '0.5em',
	},
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

		this.disposeCallbacks.add(this.state.subscribe(this.refresh.bind(this)))

		this.toGrid(this.buttonGrid)

		this.refresh()
	}

	/**
	 * Converts a {@link ButtonGrid} into a a grid of {@link HTMLButtonElement}
	 * elements, and
	 *
	 * - appends them to the {@link InputButtonGrid.elements.controllers.container}
	 */
	toGrid(grid: ButtonGrid) {
		const rows = grid.length
		const cols = Math.max(...grid.map(row => row.length))

		// Remove all buttons.
		for (const { element } of this.buttons.values()) {
			element.remove()
		}
		this.buttons.clear()

		for (let i = 0; i < rows; i++) {
			const row = create('div', {
				classes: ['fracgui-controller-buttongrid-row'],
				parent: this.elements.controllers.container,
				style: { gap: '0.5em' },
			})

			for (let j = 0; j < cols; j++) {
				const btn = grid[i]?.[j]
				if (btn) {
					const id = btn.label + i + j
					const button = this.addButton(btn, id, i, j)
					row.appendChild(button)
				}
			}
		}

		this.elements.container.style.setProperty(
			'height',
			getComputedStyle(this.elements.controllers.container).height,
		)
	}

	addButton(btn: ButtonItem, id: string, i: number, j: number) {
		const { label: text, onClick } = btn

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
			styles: {
				width: '100%',
				...btn.style,
			},
		})

		this.buttons.set(id, {
			element: button,
			...btn,
		})

		this.listen(button, 'click', () => {
			onClick({ input: this, text, button })
			this.refresh()
		})

		return button
	}

	// todo - would this be a nicer way to do styles?
	// static initialized = false
	// static init() {
	// 	if (this.initialized) return
	// 	this.initialized = true

	// 	const style = document.createElement('style')
	// 	style.textContent = this.style
	// 	document.head.appendChild(style)
	// }
	// static style = /*css*/ `
	// 	.fracgui-controller-buttons-container {
	// 		display: flex;
	// 		flex-wrap: wrap;
	// 		gap: 0.5em;
	// 	}
	// 	.fracgui-controller-buttons-button {
	// 		padding: 0.5em 1em;
	// 		margin: 0.25em;
	// 		border: none;
	// 		background-color: #333;
	// 		color: white;
	// 		cursor: pointer;
	// 	}
	// `

	refresh() {
		this.#log.fn('refresh').info({ this: this })
		for (const [, { element, isActive }] of this.buttons) {
			element.classList.toggle('active', !!isActive?.())
		}
		return this
	}

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

	set() {
		throw new Error('not implemented')
	}

	dispose() {
		super.dispose()
	}
}

// function randomButtonGrid() {
// 	const randomStuff = () => (Math.random() > 0.5 ? randomString(3) : String(randomInt(0, 1000)))
// 	return arr(randomInt(1, 4), () =>
// 		arr(randomInt(1, 4), () => ({
// 			label: randomInt(),
// 			onClick: ({ button }) => {
// 				button.innerText = randomStuff()
// 			},
// 		})),
// 	)
// }
