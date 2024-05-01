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
	type?: 'Button'
	title: string
	text: string | (() => string)
	onClick?: () => void
}

export const BUTTON_INPUT_DEFAULTS: ButtonInputOptions = {
	title: 'Button',
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
	readonly type = 'Button' as const
	readonly initialValue = {} as ButtonClickFunction
	readonly state = state({}) as State<ButtonClickFunction>
	readonly events = ['change', 'click']

	onClick: ButtonClickFunction = () => {}

	button: ButtonController

	#log: Logger

	constructor(options: Partial<ButtonInputOptions>, folder: Folder) {
		const opts = Object.assign({}, BUTTON_INPUT_DEFAULTS, options, { type: 'Button' as const })
		super(opts, folder)

		this.#log = new Logger(`InputButton:${opts.title}`, { fg: 'cyan' })
		this.#log.fn('constructor').debug({ opts, this: this })

		this.onClick = opts.onClick

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
		this.onClick = v
	}

	dispose() {
		this.button.dispose()
		super.dispose()
	}
}
