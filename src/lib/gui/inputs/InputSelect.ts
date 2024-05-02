import type { LabeledOption, Option } from '../controllers/Select'
import type { ElementMap, InputOptions } from './Input'
import type { State } from '../../utils/state'
import type { Folder } from '../Folder'

import { isLabeledOption, Select, toLabeledOption, fromLabeledOption } from '../controllers/Select'
import { isState, state } from '../../utils/state'
import { Logger } from '../../utils/logger'
import { create } from '../../utils/create'
import { Input } from './Input'

export type SelectInputOptions<T> = {
	type?: 'Select'
	title: string
	options: T[]
} & InputOptions<Option<unknown>>

export const SELECT_INPUT_DEFAULTS: SelectInputOptions<Option<any>> = {
	type: 'Select' as const,
	title: '',
	value: '',
	options: [],
} as const

export interface SelectControllerElements<T> extends ElementMap {
	container: HTMLElement
	select: Select<T>['elements']
}

export class InputSelect<T> extends Input<
	Option<T>,
	SelectInputOptions<T>,
	SelectControllerElements<T>
> {
	type = 'Select' as const
	initialValue: LabeledOption<T>
	state: State<Option<T>>
	events = ['change', 'preview']

	select: Select<T>

	/**
	 * A latch for event propagation. Toggled off everytime an event aborted.
	 */
	#stopPropagation = true
	#log: Logger

	constructor(options: Partial<SelectInputOptions<T>>, folder: Folder) {
		const opts = { ...SELECT_INPUT_DEFAULTS, ...options, type: 'Select' as const }
		super(opts, folder)

		this.evm.registerEvents(this.events)

		this.#log = new Logger(`InputSelect:${opts.title}`, { fg: 'cyan' })
		this.#log.fn('constructor').debug({ opts, this: this })

		// The idea here is that we can bind to a value, a `state` instance, a
		// labeled option, or a labaled option with a `state` instance value.
		if (opts.binding) {
			this.bound = true
			const v = opts.binding?.initial ?? (opts.binding.target[opts.binding.key] as Option<T>)

			if (isState(v)) {
				this.initialValue = toLabeledOption(v.value as T)
				this.state = v as State<Option<T>>
			} else {
				if (isLabeledOption(v)) {
					if (isState(v.value)) {
						this.initialValue = {
							label: v.label,
							value: v.value.value as T,
						}
						this.state = v.value as State<Option<T>>
					} else {
						this.initialValue = v as LabeledOption<T>
						this.state = state(v) as State<Option<T>>
					}
				} else {
					this.initialValue = toLabeledOption(v as T)
					this.state = this.resolveState(this.initialValue)
				}
			}
		} else {
			const v = opts.value as T
			this.state = this.resolveState(v)
			this.initialValue = toLabeledOption(this.state.value as T)
		}

		const container = create('div', {
			classes: ['fracgui-input-select-container'],
			parent: this.elements.content,
		})

		this.select = new Select<T>({
			input: this,
			container,
			options: opts.options,
			selected: this.initialValue,
			title: this.title,
			disabled: this.disabled,
		})

		this.elements.controllers = {
			container,
			select: this.select.elements,
		} as const satisfies SelectControllerElements<T>

		const bound = this.bound
		this.evm.add(
			this.state.subscribe(v => {
				if (!this.select.bubble) return

				if (this.#stopPropagation) {
					this.#stopPropagation = false
					this.#log
						.fn('bound $state')
						.debug('Stopped propagation.  Subscribers will not be notified.')
					return
				}

				if (bound) {
					this.targetValue = (v as LabeledOption<T>).value
				}

				this.#log.fn('bound $state').debug({ v, this: this })
				this.set(v)
			}),
		)

		if (options.onChange) {
			this.evm.on('change', options.onChange)
		}

		// Bind our state to the select controller.
		this.select.onChange(v => {
			// Make sure the select controller doesn't react to its own changes.
			this.#stopPropagation = true
			this.targetValue = v.value
			// console.warn(v)
			// console.warn(this.state.value)
			this.set(v)
		})
	}

	resolveState(v: T | Option<T> | State<T> | Option<State<T>>): State<Option<T>> {
		this.#log.fn('resolveState').debug(v)
		if (isState(v)) {
			this.#log.fn('resolveState').debug('Value is already state... returning unmodified.')
			return v as State<Option<T>>
		}

		if (isLabeledOption(v)) {
			if (isState(v.value)) {
				this.#log
					.fn('resolveState')
					.debug(
						"Value is a labeled option who's value is a state instance.  Returning `option.value`.",
					)
				return v.value as State<Option<T>>
			}

			this.#log
				.fn('resolveState')
				.debug('Value is a non-state labeled option.  Wrapping in state.')
			return state(v.value) as State<Option<T>>
		}

		this.#log
			.fn('resolveState')
			.debug('Value is a non-labeled, non-state option.  Wrapping in state.')
		return state(v) as State<Option<T>>
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
		this.#log.fn('set targetValue').debug(v)

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

		// if (this.select.expanded) {
		// 	this._emit('preview')
		// } else {
		// 	this._emit('change')
		// }
	}

	set(v = this.state.value) {
		this.#log.fn('set').info()
		this.select.select(v as T, false)
		this._emit('change', v as T)
		return this
	}

	enable() {
		this.#log.fn('enable').debug()
		this.select.enable()
		super.enable()
		return this
	}

	disable() {
		this.#log.fn('disable').debug()
		this.select.disable()
		super.disable()
		return this
	}

	refresh = () => {
		const v = this.state.value
		this.#log.fn('refresh').info({ v, this: this })

		this.select.select(v as T, false)

		super.refresh(v as T)
		return this
	}

	dispose() {
		super.dispose()
	}
}
