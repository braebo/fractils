import type { ElementMap } from '../inputs/Input'

import { EventManager } from '../../utils/EventManager'
import { toFn } from '../shared/toFn'

export abstract class Controller<TValue, TElements extends ElementMap = ElementMap> {
	#evm = new EventManager()

	/**
	 * All elements created by the controller.
	 */
	abstract elements: TElements
	/**
	 * Usually the 'container' element for the controller if it has one.
	 * Otherwise, the main element of the controller if there's only one.
	 */
	abstract element: Element

	/**
	 * Whether the controller is disabled.  A function can be used to
	 * dynamically determine the disabled state.
	 */
	#disabled: () => boolean

	/**
	 * Whether the controller has been disposed.
	 */
	#disposed = false

	constructor(
		opts: Record<string, any> & {
			disabled: boolean | (() => boolean)
		},
	) {
		this.#disabled = toFn(opts.disabled)
	}

	get disabled(): boolean {
		return this.#disabled()
	}
	set disabled(v: boolean | (() => boolean)) {
		this.#disabled = toFn(v)
		this.#disabled() ? this.disable() : this.enable()
	}

	get disposed() {
		return this.#disposed
	}

	abstract refresh: () => this

	listen = this.#evm.listen.bind(this.#evm)

	enable() {
		this.#disabled = toFn(false)
	}
	disable() {
		this.#disabled = toFn(true)
	}

	#onChangeListeners = new Set<(...args: any[]) => void>()
	onChange(cb: (value: TValue) => void) {
		this.#onChangeListeners.add(cb)
		return this
	}
	callOnChange = (value: TValue) => {
		this.element.dispatchEvent(new CustomEvent('change', { detail: value }))
		for (const cb of this.#onChangeListeners) {
			cb(value)
		}
		return this
	}

	dispose() {
		this.#disposed = true
		this.#onChangeListeners.clear()
		this.#evm.dispose()
	}
}
