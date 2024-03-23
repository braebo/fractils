import type { ElementMap, ValueOrBinding } from './Input'
import type { Folder } from '../Folder'

import {
	isLabeledOption,
	Select,
	toLabeledOption,
	type LabeledOption,
	type Option,
} from '../controllers/Select'
import { isState, state, type State } from '../../utils/state'
import { Logger } from '../../utils/logger'
import { create } from '../../utils/create'
import { Input } from './Input'

export type SelectInputOptions<T> = {
	title: string
	options: T[]
} & ValueOrBinding<T>

export const SELECT_INPUT_DEFAULTS: SelectInputOptions<Option<any>> = {
	title: 'Select',
	value: '',
	options: [],
} as const

export interface SelectControllerElements<T> extends ElementMap {
	container: HTMLElement
	select: Select<T>['elements']
}

export class InputSelect<T> extends Input<
	LabeledOption<T>,
	SelectInputOptions<T>,
	SelectControllerElements<T>
> {
	type = 'Select' as const
	initialValue: LabeledOption<T>
	select: Select<T>
	#log = new Logger('InputSelect', { fg: 'cyan' })

	// todo - Move this into the select controller.
	dragEnabled = false

	constructor(options: Partial<SelectInputOptions<T>>, folder: Folder) {
		const opts = { ...SELECT_INPUT_DEFAULTS, ...options }
		super(opts, folder)

		this.opts = opts
		// //* this is bop it type beat but is cool - brb fire alarm
		this.#log.fn('constructor').info({ opts, this: this })

		// console.log(opts)
		let bindingIsState = false

		if (opts.binding) {
			const v = opts.binding.target[opts.binding.key]
			if (isState(v)) {
				this.initialValue = v.value as LabeledOption<T>
				this.state = v as State<LabeledOption<T>>
				this.state.set(this.initialValue)
				bindingIsState = true
			} else {
				this.initialValue = toLabeledOption(opts.binding.target[opts.binding.key])
				this.state = state(this.initialValue)
				// Bind to the target if it's not already a State object.
			}
		} else {
			console.log(toLabeledOption(opts.value))
			const value = this.resolveState(opts.value)
			this.initialValue = toLabeledOption(opts.value)
			this.state = state(toLabeledOption(opts.value))
		}

		const container = create('div', {
			classes: ['fracgui-input-select-container'],
			parent: this.elements.content,
		})

		this.select = new Select<T>({
			container,
			options: opts.options,
			selected: this.initialValue,
			title: this.title,
		})

		this.elements.controllers = {
			container,
			select: this.select.elements,
		} as const satisfies SelectControllerElements<T>

		if (bindingIsState) {
			this.disposeCallbacks.add(
				this.state.subscribe(v => {
					this.#log.fn('setState').debug({ v, this: this })
					this.refresh()
				}),
			)
		} else {
			this.disposeCallbacks.add(
				this.state.subscribe(v => {
					this.#log.fn('setState').debug({ v, this: this })
					this.targetValue = v.value
				}),
			)
		}

		this.listen(this.elements.controllers.select.selected, 'change', this.set)

		// this.disposeCallbacks.add(this.state.subscribe(() => this.refresh()))
	}

	// export type LabeledOption<T> = { label: string; value: T }

	resolveState(v: T | LabeledOption<T> | State<T> | LabeledOption<State<T>>): State<T> {
		if (isState(v)) {
			return v
		}

		if (isLabeledOption(v)) {
			if (isState(v.value)) {
				return v.value
			}

			return state(v.value)
		}

		return state(v)
	}

	get targetObject() {
		// console.log(this.opts.binding?.target)
		return this.opts.binding?.target
	}

	get targetKey() {
		// console.log(this.opts.binding?.key)
		return this.opts.binding?.key
	}

	get targetValue(): T {
		// console.log(this.opts.binding?.target)
		return this.targetObject?.[this.targetKey as keyof typeof this.targetObject]
	}
	set targetValue(v: T) {
		if (typeof v === 'undefined') {
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
			// console.log({ to, tk, v })
			// console.log(`Setting target object key "${tk}" to value "${v}"`)
		}
	}

	// todo - Move this into the select controller.
	toggleDrag(e: KeyboardEvent) {
		if (e.metaKey || e.ctrlKey) {
			this.dragEnabled = true
		}
	}

	set = (v?: CustomEvent<LabeledOption<T>> | State<LabeledOption<T>>) => {
		this.#log.fn('setState').info({ v, this: this })

		if (!v || typeof v === 'undefined') {
			return
		}

		if (typeof v === 'object') {
			if ('detail' in v) {
				console.log(v)
				this.#log.fn('setState(v.detail)').debug(v.detail)
				if (isLabeledOption(v.detail)) {
					// this.state.set(v.detail.value) // todo - Use this once `state` is changed to `T` from `LabeledOption<T>`.
					this.state.set(v.detail)
					// this.callOnChange(v.detail)
				} else {
					this.state.set(v.detail)
					// this.callOnChange(v.detail)
				}
			} else if (isState(v)) {
				this.#log.fn('setState(v.value)').debug(v.value)
				this.state.set(v.value)
			}
		}

		this.refresh()
	}

	refresh = () => {
		const v = this.state.value
		this.#log.fn('refresh').info({ v, this: this })

		this.select.select(v as T, false)

		this.callOnChange(v) // todo - should this go in the state subscription?
	}

	dispose() {
		super.dispose()
	}
}
