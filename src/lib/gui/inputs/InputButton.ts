import type { ElementMap, InputOptions } from './Input'
import type { Folder } from '../Folder'

import { ButtonController } from '../controllers/ButtonController'
import { Logger } from '../../utils/logger'
import { create } from '../../utils/create'
import { state } from '../../utils/state'
import { Input } from './Input'

export type ButtonClickFunction = (this: InputButton) => void

export type InputButtonOptions = {
	title: string
	text: string | (() => string)
	onClick: () => void
} & InputOptions<ButtonClickFunction>

export const BUTTON_INPUT_DEFAULTS: InputButtonOptions = {
	title: 'Button',
	text: () => 'click me',
	onClick: () => {},
} as const

export interface ButtonControllerElements extends ElementMap {
	container: HTMLElement
	button: HTMLButtonElement
}

export class InputButton extends Input<
	ButtonClickFunction,
	InputButtonOptions,
	ButtonControllerElements
> {
	type = 'Button' as const
	// #text!: () => string
	onClick: ButtonClickFunction = () => {}

	button: ButtonController

	#log = new Logger('InputButton', { fg: 'cyan' })

	constructor(options: Partial<InputButtonOptions>, folder: Folder) {
		const opts = Object.assign({}, BUTTON_INPUT_DEFAULTS, options)
		super(opts, folder)

		this.#log.fn('constructor').info({ opts, this: this }).groupEnd()
		this.opts = opts

		this.onClick = opts.onClick

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

		this.listen(this.elements.controllers.button, 'click', this.click)

		this.disposeCallbacks.add(this.state.subscribe(this.refresh))
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
	click = () => {
		this.button.click()
	}

	enable = () => {
		this.button.enable()
		return this
	}

	disable() {
		this.button.disable()
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
