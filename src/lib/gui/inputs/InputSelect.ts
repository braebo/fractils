import type { ElementMap, InputEvents, InputOptions, ValidInputValue } from './Input'
import type { LabeledOption } from '../controllers/Select'
import type { State } from '../../utils/state'
import type { Folder } from '../Folder'

import { isLabeledOption, Select, toLabeledOption, fromLabeledOption } from '../controllers/Select'
import { fromState, isState, state } from '../../utils/state'
import { stringify } from '../../utils/stringify'
import { Logger } from '../../utils/logger'
import { create } from '../../utils/create'
import { toFn } from '../shared/toFn'
import { Input } from './Input'

export type SelectInputOptions<T = ValidInputValue> = Omit<
	InputOptions<T | { label: string; value: T }>,
	'onChange' | 'value'
> & {
	__type?: 'SelectInputOptions'
	onChange?: (value: LabeledOption<T>) => void
} & (
		| {
				labelKey?: never
				value?: { label: string; value: T }
				options: { label: string; value: T }[] | (() => { label: string; value: T }[])
		  }
		| {
				labelKey: keyof T
				value?: T
				options: T[] | (() => T[])
		  }
	)

export const SELECT_INPUT_DEFAULTS: SelectInputOptions = {
	__type: 'SelectInputOptions' as const,
	options: [],
} as const

export interface SelectControllerElements<T> extends ElementMap {
	container: HTMLElement
	select: Select<T>['elements']
}

export interface SelectInputEvents<T> extends InputEvents<LabeledOption<T>> {
	preview: LabeledOption<T>
	open: void
	close: void
	cancel: void
}

export class InputSelect<T = unknown> extends Input<
	LabeledOption<T>,
	SelectInputOptions<T>,
	SelectControllerElements<T>,
	SelectInputEvents<T>
> {
	readonly __type = 'InputSelect' as const
	readonly initialValue: LabeledOption<T>
	state: State<LabeledOption<T>>

	#options: SelectInputOptions['options']
	set options(v: SelectInputOptions['options']) {
		this.#options = toFn(v)
		this.select.options = this.#options() as LabeledOption<T>[]
	}
	get options(): LabeledOption<T>[] {
		return this.resolveOptions(this.#options)
	}

	/**
	 * The select controller instance.
	 */
	select: Select<T>

	/**
	 * A latch for event propagation. Toggled off everytime an event aborted.
	 */
	#stopPropagation = true

	/**
	 * The currently selected option as a labeled option.
	 */
	labeledSelection: LabeledOption<T>

	#log: Logger

	constructor(options: Partial<SelectInputOptions<T>>, folder: Folder) {
		const opts = Object.assign({}, SELECT_INPUT_DEFAULTS as SelectInputOptions<T>, options, {
			__type: 'SelectInputOptions' as const,
		})

		// const YEET = (str: string, ...args: any[]) => {
		// 	this.#log.info(b(str), ...args)
		// }

		super(opts, folder)

		this.evm.registerEvents(['preview', 'open', 'close', 'cancel'])

		this.#log = new Logger(`InputSelect ${opts.title}`, { fg: 'slategrey' })
		this.#log.fn('constructor').info({ opts, this: this })

		opts.value ??= opts.binding?.initial ?? fromState(this.targetValue)
		this.initialValue = this.resolveInitialValue(opts)
		// YEET('this.initialValue', this.initialValue)
		// YEET('opts.value', opts.value)

		this.labeledSelection = {
			value: fromLabeledOption(this.initialValue),
			label: this.resolveInitialLabel(this.initialValue, opts),
		}
		// YEET('this.labeledSelection', this.labeledSelection)
		// YEET('opts.options', opts.options)

		this.#options = this.opts.options

		this.state = state(this.initialValue)

		const container = create('div', {
			classes: ['fracgui-input-select-container'],
			parent: this.elements.content,
		})

		this.select = new Select({
			// @ts-expect-error - idfk
			input: this,
			container,
			options: this.options,
			selected: this.labeledSelection,
			title: this.title,
			disabled: this.disabled,
		})

		this.elements.controllers = {
			container,
			select: this.select.elements,
		} as const satisfies SelectControllerElements<T>

		this.evm.add(
			this.state.subscribe(v => {
				if (!this.select.bubble) return

				if (this.targetObject) {
					if (isState(this.targetValue)) {
						this.#log
							.fn('updating binding')
							.info({ from: this.targetValue.value, to: v.value })
						this.targetValue.set(v.value)
					} else {
						this.targetValue = v.value
					}
				}

				if (this.#stopPropagation) {
					this.#stopPropagation = false
					this.#log
						.fn('state.subscribe')
						.info('Stopped propagation.  Subscribers will not be notified.')
					return
				}

				this.set(v)
			}),
		)

		if (options.onChange) {
			this.evm.on('change', v => {
				options.onChange?.(toLabeledOption(v))
			})
		}

		// Bind our state to the select controller.
		this.select.onChange(v => {
			this.#log.fn('select.onChange').info(v)
			if (this.#stopPropagation) return
			// Make sure the select controller doesn't react to its own changes.
			this.#stopPropagation = true
			this.set(v)
		})

		// if (isState(options.options)) {
		// 	this.evm.add(
		// 		options.options.subscribe(v => {
		// 			if (isState(v)) {
		// 				this.options = v.value as T[]
		// 			}
		// 		}),
		// 	)
		// }

		this.listen(this.select.element, 'preview', () => {
			this._emit('preview')
		})
		this.listen(this.select.element, 'open', () => {
			this._emit('open')
		})
		this.listen(this.select.element, 'close', () => {
			this._emit('close')
		})
		this.listen(this.select.element, 'cancel', () => {
			this._emit('cancel')
		})

		this.#log.fn('constructor').info({ this: this })
	}

	resolveOptions(providedOptions: SelectInputOptions['options']): LabeledOption<T>[] {
		function isLabeledOptionsArray(v: any): v is LabeledOption<T>[] {
			return isLabeledOption(v[0])
		}

		let selectOptions = toFn(providedOptions)() as T[] | LabeledOption<T>[]

		if (!isLabeledOptionsArray(selectOptions)) {
			if (!this.opts.labelKey) {
				throw new Error(
					'Recieved unlabeled options with no `labelKey` specified.  Please label your options or provide the `labelKey` to use as a label.',
				)
			}

			return selectOptions.map(o => ({
				label: o[this.opts.labelKey!] as string,
				value: o,
			}))
		}

		return selectOptions
	}

	resolveInitialValue(opts: SelectInputOptions<T>) {
		const value = opts.binding ? opts.binding.target[opts.binding.key] : opts.value!
		const v = fromState(value)
		if (!isLabeledOption(v)) {
			if (!opts.labelKey) {
				throw new Error(
					'Cannot resolve initial value.  Please provide a `labelKey` or use labeled options.',
				)
			}

			return {
				label: v[opts.labelKey],
				value: v,
			}
		}

		return v
	}

	resolveInitialLabel(initialValue: this['initialValue'], opts: SelectInputOptions<T>): string {
		const v = isState(initialValue) ? initialValue.value : initialValue

		if (isLabeledOption(v)) {
			return v.label
		}

		if (opts.labelKey) {
			return initialValue[opts.labelKey as keyof this['initialValue']] as string
		}

		return stringify(v)
	}

	get targetObject() {
		return this.opts.binding?.target
	}
	get targetKey() {
		return this.opts.binding?.key
	}
	get targetValue(): T {
		return this.targetObject?.[this.targetKey as keyof typeof this.targetObject]
	}
	set targetValue(v: T) {
		if (isLabeledOption(v)) v = fromLabeledOption(v) as T
		this.#log.fn('set targetValue').info(v)

		if (typeof v === 'undefined') {
			console.error('Cannot set target value to undefined')
			console.error('this', this)
			throw new Error('Cannot set target value to undefined')
		}

		const to = this.targetObject
		const tk = this.targetKey as keyof typeof this.targetObject

		if (to && tk) {
			if (isState(to[tk])) {
				to[tk].set(v)
			} else {
				to[tk] = v
			}
		}
	}

	/**
	 * Selects the option with the given value.
	 */
	set(value: LabeledOption<T>) {
		this.#log.fn('set').info(value)

		this.#stopPropagation = true
		this.select.select(value, false)
		this.state.set(value)
		this._emit('change', value)

		return this
	}

	enable() {
		this.#log.fn('enable').info()
		this.select.enable()
		super.enable()
		return this
	}

	disable() {
		this.#log.fn('disable').info()
		this.select.disable()
		super.disable()
		return this
	}

	refresh = () => {
		const v = this.state.value
		this.#log.fn('refresh').info({ v, this: this })

		if (!this.labeledSelection) {
			throw new Error('Failed to find labeled selection.')
		}

		const newOptions = this.options.filter(o => !this.select.options.includes(o))
		for (const option of newOptions) {
			this.select.add(option)
		}
		this.select.select(this.labeledSelection, false)

		super.refresh()
		return this
	}

	dispose() {
		super.dispose()
	}
}
