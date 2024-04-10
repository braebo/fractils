import type { ElementMap, InputOptions } from './Input'
import type { Folder } from '../Folder'

import { textController } from '../controllers/text'
import { Logger } from '../../utils/logger'
import { create } from '../../utils/create'
import { state } from '../../utils/state'
import { Input } from './Input'

export type TextInputOptions = {
	title: string
	/**
	 * The maximum number of characters that can be entered.
	 * @default 50
	 */
	maxLength?: number
	// } & ValueOrBinding<string> & InputOptions<string>
} & InputOptions<string>

export const TEXT_INPUT_DEFAULTS: TextInputOptions = {
	title: '',
	value: 'foo',
	maxLength: 50,
} as const

export interface TextControllerElements extends ElementMap {
	container: HTMLElement
	input: HTMLInputElement
}

export class InputText extends Input<string, TextInputOptions, TextControllerElements> {
	type = 'Text' as const
	initialValue: string
	#log = new Logger('InputText', { fg: 'cyan' })

	constructor(options: Partial<TextInputOptions>, folder: Folder) {
		const opts = { ...TEXT_INPUT_DEFAULTS, ...options }
		super(opts, folder)

		this.opts = opts
		// //* this is bop it type beat but is cool - brb fire alarm
		this.#log.fn('constructor').info({ opts, this: this })

		if (opts.binding) {
			this.initialValue = opts.binding.target[opts.binding.key]
			this.state = state(this.initialValue)

			this.disposeCallbacks.add(
				this.state.subscribe(v => {
					opts.binding!.target[opts.binding!.key] = v
				}),
			)
		} else {
			this.initialValue = opts.value!
			this.state = state(opts.value!)
		}

		const container = create('div', {
			classes: ['fracgui-input-text-container'],
			parent: this.elements.content,
		})

		this.elements.controllers = {
			container,
			input: textController(this, opts, container),
		} as const satisfies TextControllerElements

		this.listen(this.elements.controllers.input, 'input', this.set)

		this.disposeCallbacks.add(this.state.subscribe(this.refresh))
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
		console.log(CSS.supports('border', ((v as Event).target as HTMLTextAreaElement)?.value))
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
		// if (this.disabled) return

		const v = this.state.value
		this.elements.controllers.input.value = v

		this.callOnChange(v) // todo - should this go in the state subscription?

		return this
	}

	dispose() {
		super.dispose()
	}
}
