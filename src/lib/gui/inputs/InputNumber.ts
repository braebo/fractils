import type { ElementMap, InputOptions } from './Input'
import type { State } from '../../utils/state'
import type { Folder } from '../Folder'

import { NumberButtonsController } from '../controllers/NumberButtonsController'
import { NumberController } from '../controllers/NumberController'
import { rangeController } from '../controllers/number'
import { Logger } from '../../utils/logger'
import { create } from '../../utils/create'
import { Input } from './Input'

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

export type NumberInputOptions = {
	readonly __type?: 'NumberInputOptions'
	min?: number
	max?: number
	step?: number
} & InputOptions<number>

export const NUMBER_INPUT_DEFAULTS: NumberInputOptions = {
	__type: 'NumberInputOptions' as const,
	value: 0.5,
	min: 0,
	max: 1,
	step: 0.01,
} as const

export class InputNumber extends Input<number, NumberInputOptions, NumberControllerElements> {
	readonly __type = 'InputNumber' as const
	initialValue: number
	state: State<number>
	events = ['change']
	#log: Logger

	// todo - Move this into the number controller?
	dragEnabled = false

	constructor(options: Partial<NumberInputOptions>, folder: Folder) {
		const opts = Object.assign({}, NUMBER_INPUT_DEFAULTS, options, {
			__type: 'NumberInputOptions' as const,
		})
		super(opts, folder)

		this.#log = new Logger(`InputNumber : ${opts.title}`, { fg: 'cyan' })
		this.#log.fn('constructor').debug({ opts, this: this })

		this.initialValue = this.resolveInitialValue(opts)
		this.state = this.resolveState(opts)

		const container = create('div', {
			classes: ['fracgui-input-number-container'],
			parent: this.elements.content,
		})

		this.elements.controllers = {
			container,
			input: new NumberController(this, opts, container).element,
			buttons: new NumberButtonsController(this, opts, container).elements,
			range: rangeController(this, opts, container),
		} as const satisfies NumberControllerElements

		this.evm.add(this.state.subscribe(this.refresh.bind(this)))

		this.evm.listen(this.elements.controllers.range, 'pointerdown', this.#lock.bind(this))
		this.evm.listen(this.elements.controllers.range, 'pointerup', this.#unlock.bind(this))

		this.evm.listen(this.elements.controllers.input, 'change', this.set.bind(this))
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

		this._emit('change', newValue)
		return this
	}

	enable() {
		this.#log.fn('enable').debug()
		this.elements.controllers.input.disabled = false
		super.enable()
		return this
	}

	disable() {
		this.#log.fn('disable').debug()
		this.elements.controllers.input.disabled = true
		super.disable()
		return this
	}

	refresh() {
		const v = this.state.value
		this.#log.fn('refresh').debug(v)
		this.elements.controllers.range.value = String(v)
		this.elements.controllers.input.value = String(v)
		super.refresh(v)

		return this
	}

	dispose() {
		this.#log.fn('dispose').debug()
		super.dispose()
	}
}
