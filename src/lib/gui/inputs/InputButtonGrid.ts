import type { ElementMap, InputOptions } from './Input'
import type { State } from '../../utils/state'
import type { Folder } from '../Folder'

import { create, type CreateOptions } from '../../utils/create'
import { Logger } from '../../utils/logger'
import { state } from '../../utils/state'
import { toFn } from '../shared/toFn'
import { Input } from './Input'
import { DEV } from 'esm-env'

/**
 * A button item to be added to the grid.  This is used in the
 * {@link ButtonGrid} generated in the {@link InputButtonGrid}
 * constructor.
 */
export interface ButtonItemOptions {
	readonly __type?: 'ButtonItemOptions'
	/**
	 * Text to display on the button.
	 */
	label: string | (() => string)
	/**
	 * Function to run when the button is clicked.  It is passed a {@link ButtonItem}
	 * object containing both the {@link InputButtonGrid|`input`} and the individual
	 * {@link ButtonItem|`button`} in the {@link ButtonGrid|`buttongrid`} that was clicked.
	 */
	onClick: (payload: ButtonItem) => void
	/**
	 * Optional function to determine if the button is active.  If the function returns `true`,
	 * the button will have the `active` class added to it, and removed if `false`.  This updates
	 * in the {@link InputButtonGrid.refresh|`refresh`} method, which is called internally
	 * whenever the input {@link InputButtonGrid.state|`state`} changes.
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
	style?: CreateOptions['styles']
}

/**
 * A {@link ButtonItemOptions} object, with the `label` property coerced into a function that
 * returns a string.
 */
export interface ButtonItem extends Omit<ButtonItemOptions, '__type'> {
	readonly __type?: 'ButtonItem'
	/**
	 * Text to display on the button.
	 */
	label: () => string
	element: HTMLButtonElement
}

/**
 * A {@link ButtonItemOptions} added to the grid is stored internally as a `ButtonGridItem`,
 * accessible via the {@link InputButtonGrid.buttonGrid | buttonGrid} map.
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

/**
 * A 2D array of {@link ButtonItemOptions} objects, representing a grid of buttons.
 */
export type ButtonGrid = ButtonItemOptions[][]

export type ButtonGridClickFunction = (payload: ButtonItem) => void

export type ButtonGridInputOptions = {
	readonly __type?: 'ButtonGridInputOptions'
	title: string
	value: ButtonGrid
	styles?: CreateOptions['styles']
	/**
	 * If `true`, the last clicked button will have the `active` class added to it.
	 * @default true
	 */
	activeOnClick?: boolean
} & InputOptions<ButtonGrid>

export const BUTTONGRID_INPUT_DEFAULTS = {
	__type: 'ButtonGridInputOptions' as const,
	title: '',
	value: [[{ label: '', onClick: () => {} }]],
	styles: {
		gap: '0.5em',
	},
	activeOnClick: false,
} as const satisfies ButtonGridInputOptions

export interface ButtonGridControllerElements extends ElementMap {
	container: HTMLElement
	buttonGrid: HTMLButtonElement[]
}

export type ButtonId = string

export class InputButtonGrid extends Input<
	ButtonItem,
	ButtonGridInputOptions,
	ButtonGridControllerElements
> {
	readonly __type = 'InputButtonGrid' as const
	readonly initialValue = {} as ButtonGrid
	readonly state = state({} as ButtonItem) as State<ButtonItem>

	buttons: Map<ButtonId, ButtonGridItem> = new Map()
	buttonGrid: ButtonGrid

	#log: Logger

	constructor(options: Partial<ButtonGridInputOptions>, folder: Folder) {
		const opts = Object.assign({}, BUTTONGRID_INPUT_DEFAULTS, options, {
			__type: 'ButtonGridInputOptions' as const,
		})
		super(opts, folder)

		this.buttonGrid = this.initialValue = opts.value
		this.#log = new Logger(`InputButtonGrid : ${opts.title}`, { fg: 'cyan' })
		this.#log.fn('constructor').debug({ opts, this: this })

		const container = create('div', {
			classes: ['fracgui-input', 'fracgui-input-buttongrid-container'],
			parent: this.elements.content,
		})

		this.elements.controllers = {
			container,
			buttonGrid: [],
		} as const satisfies ButtonGridControllerElements

		this.toGrid(this.buttonGrid)

		this.refresh()
	}

	onClick(callback: ButtonGridClickFunction) {
		this.#log.fn('onClick').debug({ payload: this.state.value, this: this })
		this.evm.on('click', () => callback(this.state.value))
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
					const button = this.addButton(btn, toFn(btn.label)(), i, j)
					row.appendChild(button)
				}
			}
		}

		this.elements.container.style.setProperty(
			'height',
			getComputedStyle(this.elements.controllers.container).height,
		)
	}

	addButton(opts: ButtonItemOptions, id: string, i: number, j: number) {
		const label = toFn(opts.label)

		const button = create('button', {
			classes: [
				'fracgui-controller',
				'fracgui-controller-button',
				'fracgui-controller-buttongrid-button',
			],
			textContent: label(),
			dataset: {
				id,
				row: String(i),
				col: String(j),
			},
			styles: {
				width: '100%',
				...opts.style,
			},
		})

		let btn = {
			...opts,
			__type: 'ButtonItem' as const,
			element: button,
			label,
		}

		if (typeof opts.isActive !== 'function') {
			if (this.opts.activeOnClick) {
				btn.isActive = () => {
					return this.state.value === btn
				}
			}
		}

		this.buttons.set(id, btn)

		this.evm.listen(button, 'click', e => {
			const id = (e.target as HTMLButtonElement).dataset['id']

			if (!id) {
				if (DEV) console.error('ButtonGrid button missing id', e.target)
				return
			}

			const button = this.buttons.get(id)

			if (!button) {
				if (DEV) console.error('ButtonGrid button not found', id)
				return
			}

			button.onClick(button)
			this.set(button)
		})

		return button
	}

	set(button: ButtonItem) {
		this.state.set(button)

		this._emit('click', button)
		this.refresh()
	}

	refresh() {
		this.#log.fn('refresh').debug({ this: this })

		for (const [, { element, isActive, label }] of this.buttons) {
			if (typeof isActive === 'function') {
				element.classList.toggle('active', !!isActive())
			}
			if (typeof label === 'function') {
				element.textContent = label()
			}
		}

		super.refresh()
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

	dispose() {
		super.dispose()
	}
}
