import type { ElementMap, InputOptions } from './Input'
import type { Folder } from '../Folder'

import { numberController, numberButtonsController, rangeController } from '../controllers/number'
import { Logger } from '../../utils/logger'
import { create } from '../../utils/create'
import { state } from '../../utils/state'
import { Input } from './Input'

export type NumberInputOptions = {
	min?: number
	max?: number
	step?: number
} & InputOptions<number>

export const NUMBER_INPUT_DEFAULTS: NumberInputOptions = {
	title: '',
	value: 0.5,
	min: 0,
	max: 1,
	step: 0.01,
} as const

export interface NumberControllerElements extends ElementMap {
	container: HTMLElement
	buttons: {
		container: HTMLDivElement
		increment: HTMLDivElement
		decrement: HTMLDivElement
	}
	input: HTMLInputElement
	range: HTMLInputElement
}

export class InputNumber extends Input<number, NumberInputOptions, NumberControllerElements> {
	type = 'Number' as const
	initialValue: number
	#log = new Logger('InputNumber', { fg: 'cyan' })

	// todo - move this into the number controller?
	dragEnabled = false

	constructor(options: Partial<NumberInputOptions>, folder: Folder) {
		const opts = { ...NUMBER_INPUT_DEFAULTS, ...options }
		super(opts, folder)

		this.opts = opts
		// //* this is bop it type beat but is cool - brb fire alarm
		// this.#log.fn('constructor').info({ opts, this: this }).groupEnd()

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
			classes: ['fracgui-input-number-container'],
			parent: this.elements.content,
		})

		this.elements.controllers = {
			container,
			input: numberController(this, opts, container),
			buttons: numberButtonsController(this, opts, container),
			range: rangeController(this, opts, container),
		} as const satisfies NumberControllerElements

		this.evm.listen(this.elements.controllers.input, 'input', this.set)

		this.evm.add(this.state.subscribe(this.refresh.bind(this)))

		this.evm.listen(this.elements.controllers.range, 'pointerdown', this.#lock.bind(this))
		this.evm.listen(this.elements.controllers.range, 'pointerup', this.#unlock.bind(this))
	}

	#lock() {
		this.lock()
	}
	#unlock() {
		this.unlock()
	}

	set(v?: number | Event) {
		if (typeof v === 'undefined') return

		let newValue = v as number

		if (v instanceof Event && v?.target && 'valueAsNumber' in v.target) {
			newValue = v.target.valueAsNumber as number
		}

		this.commit({ to: newValue })
		this.state.set(newValue)

		this._afterSet()
		return this
	}

	enable() {
		this.#log.fn('enable').debug()
		this.disabled = false
		this.elements.controllers.input.disabled = false
		return this
	}

	disable() {
		this.#log.fn('disable').debug()
		this.disabled = true
		this.elements.controllers.input.disabled = true
		return this
	}

	refresh() {
		const v = this.state.value
		this.#log.fn('refresh').debug(v)
		this.elements.controllers.range.value = String(v)
		this.elements.controllers.input.value = String(v)
		this.callOnChange(v) // todo - Should this go in the state subscription?

		return this
	}

	dispose() {
		this.#log.fn('dispose').debug()
		super.dispose()
	}
}
