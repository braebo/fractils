import type { ElementMap } from '../inputs/Input'

import { disableable, type Disableable } from '../../decorators/disableable-class-decorator'
import { EventManager } from '../../utils/EventManager'
// import { Controller } from './Controller'
import { create } from '../../utils/create'
import { Logger } from '../../utils/logger'
import { toFn } from '../../utils/toFn'

export type ButtonClickFunction = () => void

// todo - wtf is this??  All of this is already defined identically in `InputButton`...?
// todo - this whole `controller` vs `input` thing needs to be nuked from orbit and rethought entirely.

export type InputButtonOptions = {
	title: string
	text: string | (() => string)
	disabled: boolean | (() => boolean)
	onClick: () => void
}

export const BUTTON_INPUT_DEFAULTS: InputButtonOptions = {
	title: 'Button',
	text: () => 'click me',
	onClick: () => {},
	disabled: false,
} as const

export interface ButtonControllerElements extends ElementMap {
	button: HTMLButtonElement
}

export interface ButtonController extends Disableable {}

@disableable
export class ButtonController {
	private _text!: () => string

	// onClick: ButtonClickFunction
	element: HTMLButtonElement
	elements = {} as ButtonControllerElements
	events = ['click'] as const
	private _evm = new EventManager<{ change: void; refresh: void; click: void }>([
		'change',
		'refresh',
		'click',
	])

	#log = new Logger('ButtonController', { fg: 'coral' })

	constructor(
		public parent: HTMLElement | undefined,
		options: Partial<InputButtonOptions>,
	) {
		const opts = Object.assign({}, BUTTON_INPUT_DEFAULTS, options)
		// super(opts)
		this.#log.fn('constructor').debug({ opts, this: this })

		const button = create('button', {
			classes: ['fracgui-controller', 'fracgui-controller-button'],
			parent,
		})
		this.element = this.elements.button = button

		this.text = toFn(opts.text)
		if (opts.onClick) {
			this._evm.on('click', opts.onClick)
		}

		this.disabled = opts.disabled
	}

	get text(): string {
		return this._text()
	}
	set text(v: string | (() => string)) {
		this._text = toFn(v)
		this.elements.button.innerText = this._text()
	}

	click = () => {
		this.refresh()
		this._evm.emit('click')
	}

	enable = () => {
		if (this.disabled) this.disabled = false
		this.elements.button.disabled = false
		return this
	}

	disable = () => {
		if (!this.disabled) this.disabled = true
		this.elements.button.disabled = true
		return this
	}

	refresh = () => {
		this.elements.button.disabled = this.disabled
		this.elements.button.innerText = this.text
		this._evm.emit('refresh')
		return this
	}

	dispose() {
		this.elements.button.remove()
		this._evm.dispose()
	}
}
