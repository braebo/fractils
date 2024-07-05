import type { ColorComponentsElements } from '../controllers/color/ColorComponents'
import type { ColorPickerElements } from '../controllers/color/ColorPicker'
import type { ElementMap, InputOptions, InputPreset } from './Input'
import type { ColorFormat } from '../../color/types/colorFormat'
import type { State } from '../../utils/state'
import type { Folder } from '../Folder'

import { ColorComponents } from '../controllers/color/ColorComponents'
import { ColorPicker } from '../controllers/color/ColorPicker'
import { Color, isColor } from '../../color/color'
import { CopyButton } from '../shared/CopyButton'
import { create } from '../../utils/create'
import { Logger } from '../../utils/logger'
import { state } from '../../utils/state'
import { Input } from './Input'

export type ColorMode = (typeof COLOR_MODES)[number]

export const COLOR_MODES = [
	'rgba',
	'rgbaString',
	'hsla',
	'hslaString',
	'hsva',
	'hsvaString',
	'hex',
	'hex8',
	'array',
] as const

export interface ColorControllerElements extends ElementMap<ColorPicker> {
	container: HTMLDivElement
	/**
	 * A color swatch that displays the current color and toggles the color-picker when clicked.
	 */
	currentColor: {
		container: HTMLDivElement
		displayBackground: HTMLDivElement
		display: HTMLDivElement
		copyButton: CopyButton
	}
	/**
	 * The main input content body.
	 */
	body: {
		container: HTMLDivElement
		/**
		 * All elements related to the color picker.
		 */
		picker: ColorPickerElements
		/**
		 * Number controllers for rgb/hsl/hsv components.
		 */
		components: ColorComponentsElements
	}
}

export type ColorInputOptions = {
	__type?: 'ColorInputOptions'
	mode?: ColorMode
	expanded?: boolean
	onChange?: (value: Color) => void
} & InputOptions<ColorFormat | Color>
//⌟

export const COLOR_INPUT_DEFAULTS = {
	__type: 'ColorInputOptions' as const,
	value: '#FF0000FF',
	mode: 'hex',
	expanded: false,
} as const satisfies ColorInputOptions

export class InputColor extends Input<Color, ColorInputOptions, ColorControllerElements> {
	readonly __type = 'InputColor' as const
	initialValue: Color
	state: State<Color>
	/**
	 * The color picker instance.
	 */
	picker: ColorPicker
	/**
	 * RGBA/HSLA/HSVA number component inputs.
	 */
	components: ColorComponents
	/**
	 * When `true`, the color picker is visible.
	 */
	expanded: boolean

	private _mode: ColorMode
	get mode() {
		return this._mode
	}
	set mode(v: ColorMode) {
		this._mode = v
		this.components.mode = v
	}

	private _log: Logger

	constructor(options: Partial<ColorInputOptions>, folder: Folder) {
		const opts = Object.assign({}, COLOR_INPUT_DEFAULTS, options, {
			__type: 'ColorInputOptions' as const,
		})
		super(opts, folder)

		this.expanded = opts.expanded
		this._mode = opts.mode
		this._log = new Logger(`InputColor ${opts.title}`, { fg: 'cyan' })
		this._log.fn('constructor').debug({ opts, this: this }).groupEnd()

		//? Initialize state.
		if (opts.binding) {
			this.initialValue = new Color(opts.binding.target[opts.binding.key])
			this.state = state(this.initialValue.clone())

			this._evm.add(
				this.state.subscribe(v => {
					opts.binding!.target[opts.binding!.key] = v
				}),
			)
		} else {
			this.initialValue = new Color(opts.value)
			this.state = state(this.initialValue.clone())
		}

		//? Elements.
		const container = create('div', {
			classes: ['fracgui-input-color-container'],
			parent: this.elements.content,
		})
		this.elements.controllers.container = container

		//- Current Color
		this.elements.controllers.currentColor = this._createCurrentColor(container)

		//- Body
		const body = create('div', {
			classes: ['fracgui-input-color-body'],
			parent: container,
		})

		//- Color Picker
		this.picker = new ColorPicker(this, { container: body })

		//- Components
		this.components = new ColorComponents(this, { container: body })

		this.elements.controllers.body = {
			container: body,
			picker: this.picker.elements,
			components: this.components.elements,
		}

		this._dirty = () => this.state.value.hex !== this.initialValue.hex

		setTimeout(() => {
			this.expanded ? this.open() : this.close(0)
		}, 10)

		this._emit('change')
		this.refresh()

		this.picker.on('pointerdown', this._lock)
		this.picker.on('pointerup', this._unlock)
	}

	set(v: ColorFormat | Color) {
		if (isColor(v)) {
			this.commit({
				to: v.rgba,
				from: this.state.value.rgba,
				setter: v => {
					this.state.value.set(v)
					this.state.refresh()
					this.refresh()
				},
			})
			this.state.set(new Color(v.rgba))
		} else {
			const newColor = new Color(v)
			this.commit({
				to: newColor.rgba,
				from: this.state.value.rgba,
				setter: v => {
					this.state.value.set(v)
					this.state.refresh()
					this.refresh()
				},
			})
			this.state.set(newColor)
		}

		const newValue = this.state.value

		this._log.fn('set').debug({ v, newValue, this: this })

		this._emit('change', newValue)
		this.refresh(newValue)

		return this
	}

	refresh = (v = this.state.value) => {
		this._log.fn('refresh').debug({ v, this: this })

		this.elements.controllers.currentColor.display.style.backgroundColor = v.hex

		this.picker.refresh()
		this.components.refresh()
		super.refresh()

		return this
	}

	//· Getters & Setters ········································································¬

	get aTitle() {
		return this.mode === 'rgba' ? 'r' : 'h'
	}
	get bTitle() {
		return this.mode === 'rgba' ? 'g' : 's'
	}
	get cTitle() {
		return this.mode === 'rgba' ? 'b' : this.mode === 'hsla' ? 'l' : 'v'
	}
	get dTitle() {
		return 'a'
	}
	//⌟

	private _createCurrentColor(parent: HTMLDivElement) {
		const container = create('div', {
			classes: ['fracgui-input-color-current-color-container'],
			parent,
		})

		const displayBackground = create('div', {
			classes: ['fracgui-input-color-current-color-background'],
			parent: container,
		})

		const display = create('div', {
			classes: ['fracgui-input-color-current-color-display'],
			parent: displayBackground,
		})
		this._evm.listen(display, 'click', this.togglePicker)

		const copyButton = new CopyButton(
			container,
			() => {
				return this.state.value.hex
			},
			'Copy Hex',
		)

		return {
			container,
			displayBackground,
			display,
			copyButton,
		}
	}

	//· Open/Close ···············································································¬

	static readonly #pickerHeight = '75px'

	private get _pickerContainer(): HTMLDivElement | undefined {
		return this.picker.elements.container
	}

	togglePicker = async () => {
		if (!this.expanded) {
			await this.open()
		} else {
			await this.close()
		}
	}

	open = async () => {
		this.expanded = true

		this.elements.container.dataset['search_height'] = '100px'

		const pickerAnim = this._pickerContainer?.animate(
			[
				{ height: '0px', clipPath: 'inset(0 0 100% 0)' },
				{ height: InputColor.#pickerHeight, clipPath: 'inset(0 0 -50% 0)' },
			],
			{ duration: 200, easing: 'cubic-bezier(.08,.38,0,0.92)', fill: 'forwards' },
		)

		const containerAnim = this.elements.container.animate(
			{ maxHeight: '100px', height: '100px' },
			{ duration: 200, easing: 'cubic-bezier(.08,.38,0,0.92)', fill: 'forwards' },
		) as Animation | undefined

		this._pickerContainer?.style.setProperty('overflow', 'visible')
		this._pickerContainer?.classList.add('expanded')

		await Promise.all([pickerAnim?.finished, containerAnim?.finished])
		if (this._pickerContainer && document.contains(this._pickerContainer)) {
			pickerAnim?.commitStyles()
		}
		if (this.elements.container && document.contains(this.elements.container)) {
			containerAnim?.commitStyles()
		}
	}

	close = async (duration = 300) => {
		this.expanded = false

		delete this.elements.container.dataset['search_height']

		const pickerAnim = this._pickerContainer?.animate(
			[
				{ height: InputColor.#pickerHeight, clipPath: 'inset(0 0 -100% 0)' },
				{ height: '0px', clipPath: 'inset(0 0 100% 0)' },
			],
			{ duration: duration, easing: 'cubic-bezier(.13,.09,.02,.96)', fill: 'forwards' },
		)
		const containerAnim = this.elements.container.animate(
			{
				minHeight: 'var(--fracgui-input_height)',
				maxHeight: 'var(--fracgui-input_height)',
				height: 'var(--fracgui-input_height)',
			},
			{ duration: duration, easing: 'cubic-bezier(.13,.09,.02,.96)', fill: 'forwards' },
		) as Animation | undefined

		this._pickerContainer?.style.setProperty('overflow', 'hidden')
		this._pickerContainer?.classList.remove('expanded')

		await Promise.all([pickerAnim?.finished, containerAnim?.finished])

		if (this._pickerContainer && document.contains(this._pickerContainer)) {
			pickerAnim?.commitStyles()
		}
		if (this.elements.container && document.contains(this.elements.container)) {
			containerAnim?.commitStyles()
		}
	}
	//⌟

	//· Super Overrides ··········································································¬

	/**
	 * Prevents the range slider from registering undo history commits while dragging on the
	 * canvas, storing the initial value on pointerdown for the eventual commit in {@link unlock}.
	 */
	private _lock = () => {
		// console.log('lock', 'from:' + chalk.hex(this.state.value.hex)(this.state.value.rgbaString))
		this.lock(this.state.value.rgba)
	}
	/**
	 * Saves the commit stored in #lock on pointerup.
	 */
	private _unlock = () => {
		this.unlock({
			target: this,
			to: this.state.value.rgba,
			setter: v => {
				this.state.value.set(v)
				this.state.refresh()
				this._emit('change', this.state.value)
				this.refresh()
			},
		})
	}

	enable() {
		this.picker.enable()
		super.enable()
		return this
	}

	disable() {
		this.picker.disable()
		super.disable()
		return this
	}

	save() {
		return super.save({ value: this.state.value.hex })
	}

	load(json: string | InputPreset<ColorInputOptions>) {
		const data = typeof json === 'string' ? JSON.parse(json) : json
		this.id = data.presetId
		this.disabled = data.disabled
		this.hidden = data.hidden
		this.initialValue = new Color(data.value)
		this.set(this.initialValue.clone())
	}
	//⌟

	dispose() {
		this._log.fn('dispose').debug({ this: this })
		this.picker.dispose()
		super.dispose()
	}
}
