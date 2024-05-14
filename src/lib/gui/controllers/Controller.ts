import type { ElementMap } from '../inputs/Input'

import { EventManager } from '../../utils/EventManager'
import { toFn } from '../../utils/toFn'

export abstract class Controller<
	TValue,
	TElements extends ElementMap = ElementMap,
	TEvents extends Record<string, any> = { change: TValue; refresh: void },
> {
	abstract _evm: EventManager<TEvents>

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
	 * Whether the controller has been disposed.
	 */
	disposed = false

	private _disabled: () => boolean
	/**
	 * Whether the controller is disabled.  A function can be used to
	 * dynamically determine the disabled state.
	 */
	get disabled(): boolean {
		return this._disabled()
	}
	set disabled(v: boolean | (() => boolean)) {
		this._disabled = typeof v === 'function' ? v : () => v
		this._disabled() ? this.disable() : this.enable()
	}

	constructor(
		opts: Record<string, any> & {
			disabled: boolean | (() => boolean)
		},
	) {
		this._disabled = toFn(opts.disabled)
	}

	get on() {
		return this._evm.on
	}
	get listen() {
		return this._evm.on
	}
	get emit() {
		return this._evm.emit
	}

	enable() {
		this.disabled = false
	}
	disable() {
		this.disabled = false
	}

	abstract refresh: () => this

	dispose() {
		this.disposed = true
		this._evm.dispose()
	}
}
