import type { ElementMap, InputOptions } from './Input'
import type { State } from '../../utils/state'
import type { Folder } from '../Folder'

import { textareaController } from '../controllers/textarea'
import { Logger } from '../../utils/logger'
import { create } from '../../utils/create'
import { Input } from './Input'

export type TextAreaInputOptions = {
	readonly __type?: 'TextAreaInputOptions'
	/**
	 * The maximum number of characters that can be entered.
	 * @default 50
	 */
	maxLength?: number
} & InputOptions<string>

export const TEXTAREA_INPUT_DEFAULTS: TextAreaInputOptions = {
	__type: 'TextAreaInputOptions' as const,
	value: 'foo',
	maxLength: 50,
} as const

export interface TextAreaControllerElements extends ElementMap {
	container: HTMLElement
	input: HTMLInputElement
}

export class InputTextArea extends Input<string, TextAreaInputOptions, TextAreaControllerElements> {
	readonly __type = 'InputTextArea' as const
	readonly initialValue: string
	readonly state: State<string>

	// get element() {
	// 	return this.elements.controllers.input
	// }

	#log: Logger

	constructor(options: Partial<TextAreaInputOptions>, folder: Folder) {
		const opts = Object.assign({}, TEXTAREA_INPUT_DEFAULTS, options, {
			__type: 'TextAreaInputOptions' as const,
		})
		super(opts, folder)

		this.#log = new Logger(`InputTextArea ${opts.title}`, { fg: 'cyan' })
		this.#log.fn('constructor').debug({ opts, this: this })

		this.initialValue = this.resolveInitialValue(opts)
		this.state = this.resolveState(opts)

		const container = create('div', {
			classes: ['fracgui-input-textarea-container'],
			parent: this.elements.content,
		})

		this.elements.controllers = {
			container,
			input: textareaController(this, opts, container),
		} as const satisfies TextAreaControllerElements

		this._evm.listen(this.elements.controllers.input, 'input', this.set)

		this._evm.add(this.state.subscribe(this.refresh))
	}

	enable() {
		this.elements.controllers.input.disabled = false
		this.disabled = false
		super.enable()
		return this
	}
	disable() {
		this.elements.controllers.input.disabled = true
		this.disabled = true
		super.disable()
		return this
	}

	set = (v?: string | Event) => {
		if (typeof v === 'undefined') {
			return
		}

		if (typeof v !== 'string') {
			if (v?.target && 'value' in v.target) {
				this.state.set(v.target.value as string)
			}
		} else {
			this.state.set(v)
		}

		this._emit('change', this.state.value)
		return this
	}

	refresh = () => {
		const v = this.state.value
		super.refresh(v)

		this.elements.controllers.input.value = v

		return this
	}

	dispose() {
		super.dispose()
	}
}
