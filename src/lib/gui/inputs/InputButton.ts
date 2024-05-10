import type { ElementMap, InputOptions } from './Input'
import type { State } from '../../utils/state'
import type { Folder } from '../Folder'

import { ButtonController } from '../controllers/ButtonController'
import { Logger } from '../../utils/logger'
import { create } from '../../utils/create'
import { state } from '../../utils/state'
import { Input } from './Input'
import { DEV } from 'esm-env'

export type ButtonClickFunction = (this: InputButton) => void

export type ButtonInputOptions = InputOptions<ButtonClickFunction> & {
	readonly __type?: 'ButtonInputOptions'
	text: string | (() => string)
	/**
	 * The function to call when the button is clicked.
	 */
	value?: ButtonClickFunction
	/**
	 * An alias for {@link value} (does the same thing).
	 */
	onClick?: ButtonClickFunction
}

export const BUTTON_INPUT_DEFAULTS: ButtonInputOptions = {
	__type: 'ButtonInputOptions' as const,
	text: () => 'click me',
} as const

export interface ButtonControllerElements extends ElementMap {
	container: HTMLElement
	button: HTMLButtonElement
}

export class InputButton extends Input<
	ButtonClickFunction,
	ButtonInputOptions,
	ButtonControllerElements
> {
	readonly __type = 'InputButton' as const
	readonly initialValue = {} as ButtonClickFunction
	readonly state = state({}) as State<ButtonClickFunction>
	readonly events = ['change', 'click']

	onClick: ButtonClickFunction = () => {}

	button: ButtonController

	#log: Logger

	constructor(options: Partial<ButtonInputOptions>, folder: Folder) {
		const opts = Object.assign({}, BUTTON_INPUT_DEFAULTS, options, {
			__type: 'ButtonInputOptions' as const,
		})
		super(opts, folder)

		this.#log = new Logger(`InputButton ${opts.title}`, { fg: 'cyan' })
		this.#log.fn('constructor').debug({ opts, this: this })

		if (opts.value) this.onClick = opts.value
		else if (opts.onClick) this.onClick = opts.onClick
		else {
			if (DEV) {
				console.error(
					`${this.title} created with no onClick function. Use the 'value' or 'onClick' property to assign one.`,
				)
			}
		}

		const container = create('div', {
			classes: ['fracgui-input-button-container'],
			parent: this.elements.content,
		})

		this.button = new ButtonController(container, {
			text: opts.text,
			onClick: opts.onClick,
		})

		this.elements.controllers = {
			container,
			button: this.button.elements.button,
		} as const satisfies ButtonControllerElements

		this.evm.listen(this.elements.controllers.button, 'click', this.click.bind(this))

		this.evm.add(this.state.subscribe(this.refresh.bind(this)))
	}

	get text() {
		return this.button.text
	}
	set text(v: string | (() => string)) {
		this.button.text = v
	}

	/**
	 * Manually calls the {@link onClick} function.
	 */
	click() {
		this.button.click()
		this._emit('click')
		this._emit('change')
	}

	enable() {
		this.button.enable()
		super.enable()
		return this
	}

	disable() {
		this.button.disable()
		super.disable()
		return this
	}

	/**
	 * Assigns {@link onClick} to a new function.
	 */
	set = (v: ButtonClickFunction) => {
		if (typeof v !== 'function') {
			if (DEV) {
				console.error(
					'InputButton.set() must be called with a function to assign a new onClick action.',
				)
			}
			return
		}
		this.onClick = v
	}

	/**
	 * Refreshes the button text.
	 */
	refresh() {
		this.button.refresh()
		super.refresh()
		return this
	}

	dispose() {
		this.button.dispose()
		super.dispose()
	}
}
