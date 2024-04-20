import type { ElementMap, InputOptions } from './Input'
import type { Tooltip } from '../../actions/tooltip'
import type { Folder } from '../Folder'

// import { switchController } from '../controllers/switch'
import { Logger } from '../../utils/logger'
import { create } from '../../utils/create'
import { state } from '../../utils/state'
import { Input } from './Input'

export type SwitchInputOptions = {
	title: string
	/** Text to display in various parts of the switch. */
	labels?: {
		/** Text to display when the state is `true` */
		true: {
			/**
			 * Represents the `true` state, i.e. `'on' | 'active' | 'enabled'`
			 * @default 'On'
			 */
			state?: string
			/**
			 * Represents, i.e. `'turn on' | 'activate' | 'enable'`.
			 * Displayed on the tooltip when the switch is `false`.
			 * @default 'Enable'
			 */
			verb?: string
		}
		/** Text to display when the state is `false` */
		false: {
			/**
			 * Represents the `false` state, i.e. `'off' | 'inactive' | 'disabled'`
			 * @default 'Off'
			 */
			state?: string
			/**
			 * Represents the action, i.e. `'turn off' | 'deactivate' | 'disable'`.
			 * Displayed on the tooltip when the switch is `true`.
			 * @default 'Disable'
			 */
			verb?: string
		}
	}
} & InputOptions<boolean>

export const SWITCH_INPUT_DEFAULTS: SwitchInputOptions = {
	title: '',
	value: true,
	labels: {
		true: {
			state: 'On',
			verb: 'Enable',
		},
		false: {
			state: 'Off',
			verb: 'Disable',
		},
	},
} as const

export interface SwitchInputElements extends ElementMap {
	container: HTMLElement
	input: HTMLButtonElement & { tooltip: Tooltip }
	thumb: HTMLDivElement
}

export class InputSwitch extends Input<boolean, SwitchInputOptions, SwitchInputElements> {
	type = 'Switch' as const
	initialValue: boolean
	#log = new Logger('InputBoolean', { fg: 'cyan' })

	constructor(options: Partial<SwitchInputOptions>, folder: Folder) {
		const opts = { ...SWITCH_INPUT_DEFAULTS, ...options }
		super(opts, folder)

		this.opts = opts
		this.#log.fn('constructor').debug({ opts, this: this })

		if (opts.binding) {
			// Bind the state to the target object.
			this.initialValue = opts.binding.target[opts.binding.key]
			this.state = state(!!this.initialValue)

			this.evm.add(
				this.state.subscribe(v => {
					opts.binding!.target[opts.binding!.key] = v
				}),
			)
		} else {
			// Create a new observable state.
			this.initialValue = opts.value!
			this.state = state(!!opts.value!)
		}

		// console.log(this.state)
		// console.log(this.state.value)

		//- Container
		const container = create('div', {
			classes: ['fracgui-input-switch-container'],
			parent: this.elements.content,
		})

		//- Switch Button
		const input = create('button', {
			classes: ['fracgui-controller', 'fracgui-controller-switch'],
			parent: container,
			tooltip: {
				text: () => {
					return (
						(this.state.value ? opts.labels?.true.verb : opts.labels?.false.verb) || ''
					)
				},
				anchor: '.fracgui-controller-switch-thumb',
			},
		})
		const thumb = create('div', {
			classes: ['fracgui-controller-switch-thumb'],
			parent: input,
			// innerText: '.',
		})

		this.elements.controllers = {
			container,
			input,
			thumb,
		} as const satisfies SwitchInputElements

		this.evm.listen(this.elements.controllers.input, 'click', () => this.set())
		this.evm.add(this.state.subscribe(this.refresh.bind(this)))
	}

	set = (v = !this.state.value) => {
		this.#log.fn('set').info({ v, this: this })

		if (typeof v === 'boolean') {
			this.state.set(v)
		} else {
			throw new Error(
				`InputBoolean.set() received an invalid value: ${JSON.stringify(v)} (${typeof v})`,
			)
		}
	}

	refresh = (v = this.state.value) => {
		this.#log.fn('refresh').info({ v, this: this })
		if (this.disabled) return this

		this.elements.controllers.input.classList.toggle('active', v)
		this.elements.controllers.input?.tooltip?.refresh()

		this.callOnChange(v) // todo - should this go in the state subscription?

		return this
	}

	enable() {
		this.elements.controllers.input.disabled = false
		this.disabled = false
		return this
	}
	disable() {
		this.elements.controllers.input.disabled = true
		this.disabled = true
		return this
	}

	dispose() {
		super.dispose()
	}
}
