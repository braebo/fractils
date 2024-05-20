import type { ElementMap, InputOptions } from './Input'
import type { State } from '../../utils/state'
import type { Folder } from '../Folder'

import { textController } from '../controllers/text'
import { create } from '../../utils/create'
import { Logger } from '../../utils/logger'
import { state } from '../../utils/state'
import { Input } from './Input'

export type TextInputOptions = InputOptions<string> & {
	readonly __type?: 'TextInputOptions'
	/**
	 * The maximum number of characters that can be entered.
	 * @default 50
	 */
	maxLength?: number
}

export const TEXT_INPUT_DEFAULTS = {
	__type: 'TextInputOptions' as const,
	value: 'foo',
	maxLength: 50,
} as const satisfies TextInputOptions

export interface TextControllerElements extends ElementMap {
	container: HTMLElement
	input: HTMLInputElement
}

export class InputText extends Input<string, TextInputOptions, TextControllerElements> {
	readonly __type = 'InputText' as const
	readonly initialValue: string
	readonly state: State<string>

	// get element() {
	// 	return this.elements.controllers.input
	// }

	#log: Logger

	constructor(options: Partial<TextInputOptions>, folder: Folder) {
		const opts = Object.assign({}, TEXT_INPUT_DEFAULTS, options)
		super(opts, folder)

		this.#log = new Logger(`InputText ${opts.title}`, { fg: 'cyan' })
		this.#log.fn('constructor').info({ opts, this: this })

		if (opts.binding) {
			this.initialValue = opts.binding.target[opts.binding.key]
			this.state = state(this.initialValue)

			this._evm.add(
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

		this._evm.listen(this.elements.controllers.input, 'input', this.set)

		this._evm.add(
			this.state.subscribe(() => {
				this.refresh()
			}),
		)
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

	set = (v?: string | Event) => {
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

		this._emit('change', this.state.value)
		return this
	}

	refresh = () => {
		const v = this.state.value
		this.elements.controllers.input.value = v
		super.refresh(v)
		return this
	}

	dispose() {
		super.dispose()
	}
}
