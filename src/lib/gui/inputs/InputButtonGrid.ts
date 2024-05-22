import type { JavascriptStyleProperty } from '../../css/types'
import type { TooltipOptions } from '../../actions/tooltip'
import type { CreateOptions } from '../../utils/create'
import type { ElementMap, InputOptions } from './Input'
import type { Folder } from '../Folder'
import type {
	ButtonControllerEvents,
	ButtonControllerOptions,
} from '../controllers/ButtonController'

import { ButtonController } from '../controllers/ButtonController'
import { getStyle } from '../../dom/getStyle'
import { nanoid } from '../../utils/nanoid'
import { Logger } from '../../utils/logger'
import { create } from '../../utils/create'
import { state } from '../../utils/state'
import { toFn } from '../../utils/toFn'
import { Input } from './Input'

/**
 * A 2D array of {@link ButtonControllerOptions} objects, representing a grid of buttons. The inner
 * arrays represent rows, and the outer array represents columns.
 * @example
 * ```ts
 * [
 *   // First row columns
 *   [
 *     { text: 'top-left', onClick: () => {} },
 *     { text: 'top-right', onClick: () => {} }
 *   ],
 *   // Second row columns
 *   [
 *     { text: 'bottom-left', onClick: () => {} },
 *     { text: 'bottom-right', onClick: () => {} }
 *   ]
 * ]
 * ```
 */
export type ButtonGridArrays = ButtonControllerOptions[][]

/**
 * A fully processed {@link ButtonGridArrays} entry with the generated {@link ButtonController}s.
 * Stored in the input's {@link InputButtonGrid.buttonGrid|`buttonGrid`} property.
 */
export type ButtonGrid = ButtonController[][]

export type ButtonGridInputOptions = {
	readonly __type?: 'ButtonGridInputOptions'
	value: ButtonGridArrays
	/**
	 * Optional css style overrides in {@link JavascriptStyleProperty} (camelCase) format.
	 */
	style?: CreateOptions['style']
	/**
	 * If `true`, the `active` class will be added to the last clicked button, and removed from
	 * all other buttons.  This is useful for indicating the currently selected button in a grid.
	 * @default true
	 */
	activeOnClick?: boolean
	disabled?: boolean | (() => boolean)
} & InputOptions<ButtonGridArrays>

export const BUTTONGRID_INPUT_DEFAULTS = {
	__type: 'ButtonGridInputOptions' as const,
	value: [[{ text: '', onClick: () => {} }]],
	style: {
		gap: '0.5em',
	},
	activeOnClick: false,
	resettable: false,
} as const satisfies ButtonGridInputOptions

export interface ButtonGridControllerElements extends ElementMap {
	container: HTMLElement
	buttonGrid: HTMLButtonElement[]
}

export type ButtonId = string

export class InputButtonGrid extends Input<
	ButtonController,
	ButtonGridInputOptions,
	ButtonGridControllerElements,
	ButtonControllerEvents
> {
	readonly __type = 'InputButtonGrid' as const
	readonly initialValue = {} as ButtonGridArrays
	readonly state = state({} as ButtonController)

	buttons: Map<ButtonId, ButtonController> = new Map()
	buttonGrid: ButtonGrid

	private _log: Logger

	constructor(options: Partial<ButtonGridInputOptions>, folder: Folder) {
		const opts = Object.assign({}, BUTTONGRID_INPUT_DEFAULTS, options)
		super(opts, folder)

		this._evm.registerEvents(['click'])

		this.initialValue = opts.value
		this._log = new Logger(`InputButtonGrid ${opts.title}`, { fg: 'cyan' })
		this._log.fn('constructor').debug({ opts, this: this })

		const container = create('div', {
			classes: ['fracgui-input', 'fracgui-input-buttongrid-container'],
			parent: this.elements.content,
		})

		this.elements.controllers = {
			container,
			buttonGrid: [],
		} as const satisfies ButtonGridControllerElements

		this.buttonGrid = this.toGrid(this.initialValue)

		this.refresh()
	}

	onClick(callback: (payload: ButtonController) => void) {
		this._evm.on('click', () => callback(this.state.value))
	}

	/**
	 * Converts a {@link ButtonGridArrays} into a a grid of {@link HTMLButtonElement}
	 * elements, and
	 *
	 * - appends them to the {@link InputButtonGrid.elements.controllers.container}
	 */
	toGrid(grid: ButtonGridArrays) {
		const instanceGrid: ButtonGrid = []

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

			instanceGrid[i] = []

			for (let j = 0; j < cols; j++) {
				const opts = grid[i]?.[j]
				if (opts) {
					const button = this.addButton(opts, opts.id ?? nanoid(8), i, j)
					row.appendChild(button.element)
					instanceGrid[i][j] = button
				}
			}
		}

		this.elements.container.style.setProperty(
			'height',
			// getComputedStyle(this.elements.controllers.container).height,
			getStyle(this.elements.controllers.container, 'height'),
		)

		return instanceGrid
	}

	addButton(opts: ButtonControllerOptions, id: string, i: number, j: number) {
		const text = toFn(opts.text)

		const tooltip: Partial<TooltipOptions> | undefined = opts.tooltip
			? Object.assign(
					{
						placement: 'top',
						delay: 1000,
					},
					opts.tooltip,
				)
			: undefined

		opts.element = create('button', {
			id,
			classes: [
				'fracgui-controller',
				'fracgui-controller-button',
				'fracgui-controller-buttongrid-button',
			],
			innerHTML: text(),
			dataset: {
				id,
				row: String(i),
				col: String(j),
			},
			style: {
				...opts.style,
				width: '100%',
			},
			tooltip,
		})

		const btn = new ButtonController(opts)

		if (typeof opts.active !== 'function') {
			if (this.opts.activeOnClick) {
				btn.active = () => {
					return this.state.value === btn
				}
			}
		}

		btn.on('click', ({ button }) => {
			this.set(button)
		})

		this.buttons.set(id, btn)

		return btn
	}

	set(button: ButtonController) {
		this.state.set(button)

		this._emit('click', button)
		this.refresh()
	}

	refresh() {
		this._log.fn('refresh').debug({ this: this })

		for (const btn of this.buttons.values()) {
			btn.refresh()
		}

		super.refresh()
		return this
	}

	enable() {
		for (const btn of this.buttons.values()) {
			btn.enable()
		}
		super.enable()
		return this
	}

	disable() {
		for (const btn of this.buttons.values()) {
			btn.disable()
		}
		super.disable()
		return this
	}

	dispose() {
		for (const btn of this.buttons.values()) {
			btn.dispose()
		}
		this.buttons.clear()
		super.dispose()
	}
}
