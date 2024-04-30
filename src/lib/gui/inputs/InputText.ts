import type { ElementMap, InputOptions } from './Input'
import type { Folder } from '../Folder'

import { textController } from '../controllers/text'
import { Logger } from '../../utils/logger'
import { create } from '../../utils/create'
import { state, type State } from '../../utils/state'
import { Input } from './Input'

export type TextInputOptions = {
	/**
	 * The maximum number of characters that can be entered.
	 * @default 50
	 */
	maxLength?: number
} & InputOptions<string>

export const TEXT_INPUT_DEFAULTS = {
	title: '',
	value: 'foo',
	maxLength: 50,
} as const satisfies TextInputOptions

export interface TextControllerElements extends ElementMap {
	container: HTMLElement
	input: HTMLInputElement
}

export class InputText extends Input<string, TextInputOptions, TextControllerElements> {
	type = 'Text' as const
	initialValue: string
	state: State<string>
	events = ['change']

	#log: Logger

	constructor(options: Partial<TextInputOptions>, folder: Folder) {
		const opts = { ...TEXT_INPUT_DEFAULTS, ...options, type: 'Text' as const }
		super(opts, folder)

		this.#log = new Logger(`InputText:${opts.title}`, { fg: 'cyan' })
		this.#log.fn('constructor').debug({ opts, this: this })

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
			classes: ['fracgui-input-text-container'],
			parent: this.elements.content,
		})

		this.elements.controllers = {
			container,
			input: textController(this, opts, container),
		} as const satisfies TextControllerElements

		this.evm.listen(this.elements.controllers.input, 'input', this.set.bind(this))

		this.evm.add(this.state.subscribe(this.refresh))
	}

	enable() {
		super.enable()
		this.elements.controllers.input.disabled = false
		return this
	}
	disable() {
		super.disable()
		this.elements.controllers.input.disabled = true
		return this
	}

	set(v?: string | Event) {
		if (typeof v === 'undefined') return

		if (typeof v !== 'string') {
			if (v?.target && 'value' in v.target) {
				this.commit({ to: v.target.value as string })
				this.state.set(v.target.value as string)
			}
		} else {
			this.commit({ to: v })
			this.state.set(v)
		}

		this._afterSet()
		return this
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
