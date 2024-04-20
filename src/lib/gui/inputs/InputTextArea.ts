import type { ElementMap, InputOptions } from './Input'
import type { Folder } from '../Folder'

import { textareaController } from '../controllers/textarea'
import { Logger } from '../../utils/logger'
import { create } from '../../utils/create'
import { state } from '../../utils/state'
import { Input } from './Input'

export type TextAreaInputOptions = {
	title: string
	/**
	 * The maximum number of characters that can be entered.
	 * @default 50
	 */
	maxLength?: number
} & InputOptions<string>

export const TEXTAREA_INPUT_DEFAULTS: TextAreaInputOptions = {
	title: '',
	value: 'foo',
	maxLength: 50,
} as const

export interface TextAreaControllerElements extends ElementMap {
	container: HTMLElement
	input: HTMLInputElement
}

export class InputTextArea extends Input<string, TextAreaInputOptions, TextAreaControllerElements> {
	type = 'TextArea' as const
	initialValue: string
	#log = new Logger('InputTextArea', { fg: 'cyan' })

	constructor(options: Partial<TextAreaInputOptions>, folder: Folder) {
		const opts = { ...TEXTAREA_INPUT_DEFAULTS, ...options }
		super(opts, folder)

		this.opts = opts
		this.#log.fn('constructor').info({ opts, this: this })

		if (opts.binding) {
			this.initialValue = opts.binding.target[opts.binding.key]
			this.state = state(this.initialValue)

			this.evm.add(
				this.state.subscribe(v => {
					opts.binding!.target[opts.binding!.key] = v
				}),
			)
		} else {
			this.initialValue = opts.value!
			this.state = state(opts.value!)
		}

		const container = create('div', {
			classes: ['fracgui-input-textarea-container'],
			parent: this.elements.content,
		})

		this.elements.controllers = {
			container,
			input: textareaController(this, opts, container),
		} as const satisfies TextAreaControllerElements

		this.evm.listen(this.elements.controllers.input, 'input', this.set)

		this.evm.add(this.state.subscribe(this.refresh))
	}

	enable() {
		this.elements.controllers.input.disabled = false
		this.disabled = false
		return this
	}
	disable() {
		this.elements.controllers.input.disabled = true
		this.disabled = true
		return this
	}

	set = (v?: string | Event) => {
		// console.log(CSS.supports('border', ((v as Event).target as HTMLTextAreaElement)?.value))
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
	}

	refresh = () => {
		const v = this.state.value
		this.elements.controllers.input.value = v

		this.callOnChange(v) // todo - should this go in the state subscription?

		return this
	}

	dispose() {
		super.dispose()
	}
}
