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
} as const

export class InputNumber extends Input<number, NumberInputOptions, NumberControllerElements> {
	readonly __type = 'InputNumber' as const
	private _log: Logger
	initialValue: number
	state: State<number>

	dragEnabled = false // todo - Move this into the number controller?
	numberController: NumberController
	numberButtonsController: NumberButtonsController

	constructor(options: Partial<NumberInputOptions>, folder: Folder) {
		const opts = Object.assign({}, NUMBER_INPUT_DEFAULTS, options, {
			__type: 'NumberInputOptions' as const,
		})

		// Smart defaults.
		let v = opts.binding?.initial ?? opts.value ?? 1
		opts.value ??= v
		opts.min ??= v <= 0 ? v * 2 : 0
		opts.max ??= v <= 0 ? v * -2 : v * 2
		const step = v / 100
		opts.step ??= step <= 0.1 ? 0.001 : 0.1

		super(opts, folder)

		this._log = new Logger(`InputNumber ${opts.title}`, { fg: 'cyan' })
		this._log.fn('constructor').debug({ opts, this: this })

		this.initialValue = this.resolveInitialValue(opts)
		this.state = this.resolveState(opts)

		const container = create('div', {
			classes: ['fracgui-input-number-container'],
			parent: this.elements.content,
		})

		this.numberController = new NumberController(this, opts, container)
		this.numberButtonsController = new NumberButtonsController(this, opts, container)

		this.elements.controllers = {
			container,
			input: this.numberController.element,
			buttons: this.numberButtonsController.elements,
			range: rangeController(this, opts, container),
		} as const satisfies NumberControllerElements

		this._evm.add(this.state.subscribe(this.refresh))

		this._evm.listen(this.elements.controllers.range, 'pointerdown', this.lock)
		this._evm.listen(this.elements.controllers.range, 'pointerup', () => this.unlock())

		this._evm.listen(this.elements.controllers.input, 'input', this.set)

		this._evm.listen(this.elements.controllers.input, 'dragStart', this.lock)
		this._evm.listen(this.elements.controllers.input, 'dragEnd', () => this.unlock())
	}

	set = (v?: number | Event) => {
		this._log.fn('set').debug(v)

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
		this._log.fn('enable').debug()
		this.elements.controllers.input.disabled = false
		super.enable()
		return this
	}

	disable() {
		this._log.fn('disable').debug()
		this.elements.controllers.input.disabled = true
		super.disable()
		return this
	}

	refresh = () => {
		const v = this.state.value
		this._log.fn('refresh').debug(v)
		this.elements.controllers.range.value = String(v)
		this.elements.controllers.input.value = String(v)
		super.refresh(v)
		return this
	}

	dispose() {
		this._log.fn('dispose').debug()
		super.dispose()
	}
}
