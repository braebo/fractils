import type { InputOptions, ElementMap } from './Input'
import type { Folder } from '../Folder'

import { numberController, numberButtonsController, rangeController } from '../controllers/number'
import { state, type State } from '../../utils/state'
import { Logger } from '../../utils/logger'
import { create } from '../../utils/create'
import { Input } from './Input'

export interface NumberInputOptions extends InputOptions {
	value: number
	min: number
	max: number
	step: number
}

export const NUMBER_INPUT_DEFAULTS: NumberInputOptions = {
	view: 'Slider',
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

export class InputSlider extends Input<number, NumberInputOptions, NumberControllerElements> {
	#log = new Logger('InputSlider', { fg: 'cyan' })

	#onChangeListeners = new Set<(v: number) => void>()
	onChange(cb: (v: number) => void) {
		this.#onChangeListeners.add(cb)
		return () => {
			this.#onChangeListeners.delete(cb)
		}
	}

	constructor(options: Partial<NumberInputOptions>, folder: Folder) {
		const opts = { ...NUMBER_INPUT_DEFAULTS, ...options }
		super(opts, folder)

		this.opts = opts
		//* this is bop it type beat but is cool - brb fire alarm
		this.#log.fn('constructor').info({ opts, this: this }).groupEnd()

		if (opts.binding) {
			this.initialValue = opts.binding.target[opts.binding.key]
			this.state = state(this.initialValue)
			this.disposeCallbacks.add(
				this.state.subscribe((v) => {
					opts.binding!.target[opts.binding!.key] = v
				}),
			)
		} else {
			this.initialValue = opts.value
			this.state = state(opts.value)
		}

		const container = create('div', {
			classes: ['gui-input-number-container'],
			parent: this.elements.content,
		})

		this.elements.controllers = {
			container,
			input: numberController(this, opts, container),
			buttons: numberButtonsController(this, opts, container),
			range: rangeController(this, opts, container),
		} as const satisfies NumberControllerElements

		this.disposeCallbacks.add(
			this.state.subscribe((v) => {
				this.elements.controllers.range.value = String(v)
				this.elements.controllers.input.value = String(v)

				for (const cb of this.#onChangeListeners) {
					cb(v)
				}
			}),
		)
	}

	updateState = (v: number | Event) => {
		if (typeof v !== 'number') {
			if (v?.target && 'valueAsNumber' in v.target) {
				this.state.set(v.target.valueAsNumber as number)
			}
		} else {
			this.state.set(v)
		}
	}

	dispose() {
		super.dispose()
	}
}
