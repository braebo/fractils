import type { InputOptions, ElementMap, ValueOrBinding } from './Input'
import type { Folder } from '../Folder'

import { numberController, numberButtonsController, rangeController } from '../controllers/number'
import { Logger } from '../../utils/logger'
import { create } from '../../utils/create'
import { state } from '../../utils/state'
import { Input } from './Input'

export type NumberInputOptions = {
	title: string
	min: number
	max: number
	step: number
} & ValueOrBinding<number>

export const NUMBER_INPUT_DEFAULTS: NumberInputOptions = {
	title: 'Number',
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

	// todo - Move this into the number controller.
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

			this.disposeCallbacks.add(
				this.state.subscribe((v) => {
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

		this.listen(this.elements.controllers.input, 'input', this.setState)

		this.listen(globalThis.document, 'keydown', this.toggleDrag)

		this.disposeCallbacks.add(this.state.subscribe(this.refresh))
	}

	// todo - Move this into the number controller.
	toggleDrag(e: KeyboardEvent) {
		if (e.metaKey || e.ctrlKey) {
			this.dragEnabled = true
		}
	}

	setState = (v?: number | Event) => {
		if (typeof v === 'undefined') {
			return
		}

		if (typeof v !== 'number') {
			if (v?.target && 'valueAsNumber' in v.target) {
				this.state.set(v.target.valueAsNumber as number)
			}
		} else {
			console.log('v', v)
			this.state.set(v)
		}
	}

	refresh = () => {
		const v = this.state.value
		this.elements.controllers.range.value = String(v)
		this.elements.controllers.input.value = String(v)

		this.callOnChange(v) // todo - should this go in the state subscription?
	}

	dispose() {
		super.dispose()
	}
}
