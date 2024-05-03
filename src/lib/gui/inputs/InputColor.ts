import type { ColorComponentsElements } from '../controllers/color/ColorComponents'
import type { ColorPickerElements } from '../controllers/color/ColorPicker'
import type { ElementMap, InputOptions, InputPreset } from './Input'
import type { ColorFormat } from '../../color/types/colorFormat'
import type { Folder } from '../Folder'

import { ColorComponents } from '../controllers/color/ColorComponents'
import { ColorPicker } from '../controllers/color/ColorPicker'
import { Color, isColor } from '../../color/color'
import { CopyButton } from '../shared/CopyButton'
import { create } from '../../utils/create'
import { Logger } from '../../utils/logger'
import { state, type State } from '../../utils/state'
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
	type?: 'Color'
	mode: ColorMode
	expanded: boolean
	onChange?: (value: Color) => void
} & InputOptions<ColorFormat | Color>
//⌟

export const COLOR_INPUT_DEFAULTS: ColorInputOptions = {
	type: 'Color' as const,
	title: '',
	value: '#FF0000FF',
	mode: 'hex',
	expanded: false,
} as const

export class InputColor extends Input<Color, ColorInputOptions, ColorControllerElements> {
	readonly type = 'Color' as const
	initialValue: Color
	state: State<Color>
	events = ['change']
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

	#mode: ColorMode
	get mode() {
		return this.#mode
	}
	set mode(v: ColorMode) {
		this.#mode = v
		this.components.mode = v
	}

	#log: Logger

	constructor(options: Partial<ColorInputOptions>, folder: Folder) {
		const opts = Object.assign({}, COLOR_INPUT_DEFAULTS, options, {
			type: 'Color' as const,
		})
		super(opts, folder)

		this.expanded = opts.expanded
		this.#mode = opts.mode
		this.#log = new Logger(`InputColor:${opts.title}`, { fg: 'cyan' })
		this.#log.fn('constructor').debug({ opts, this: this }).groupEnd()

		//? Initialize state.
		if (opts.binding) {
			this.initialValue = new Color(opts.binding.target[opts.binding.key])
			this.state = state(this.initialValue)

			this.evm.add(
				this.state.subscribe(v => {
					opts.binding!.target[opts.binding!.key] = v
				}),
			)
		} else {
			this.initialValue = new Color(opts.value)
			this.state = state(this.initialValue)
		}

		//? Elements.
		const container = create('div', {
			classes: ['fracgui-input-color-container'],
			parent: this.elements.content,
		})
		this.elements.controllers.container = container

		//- Current Color
		this.elements.controllers.currentColor = this.#createCurrentColor(container)

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

		this.state.subscribe(_v => {
			// this.callOnChange(v)
			// if (first) return first = false
			// throw new Error('Do not set state directly')
			// throw new Error('Do not set state directly')
		})

		// this.components.refresh()

		setTimeout(() => {
			this.expanded ? this.open() : this.close(0)
		}, 10)

		this._emit('change')
		this.refresh()

		this.listen(this.picker.element, 'onPointerDown', this.#lock.bind(this))
		this.listen(this.picker.element, 'onPointerUp', this.#unlock.bind(this))
	}

	/**
	 * Prevents the range slider from registering undo history commits while dragging,
	 * storing the initial value on pointerdown for the eventual commit in #unlock.
	 */
	#lock() {
		this.lock(this.state.value.rgba)
	}
	/**
	 * Saves the commit stored in #lock on pointerup.
	 */
	#unlock() {
		this.unlock({
			input: this,
			to: this.state.value.rgba,
			setter: v => {
				this.state.value.set(v)
				this.state.refresh()
			},
		})
		// this.refresh()
	}

	set(v: ColorFormat | Color) {
		if (isColor(v)) {
			this.commit({
				to: v.rgba as any,
				from: this.state.value.rgba as any,
				setter: v => {
					this.state.value.set(v)
					this.state.refresh()
				},
			})
			this.state.set(new Color(v.hsva))
		} else {
			const newColor = new Color(v)
			this.commit({
				to: newColor.rgba as any,
				from: this.state.value.rgba as any,
				setter: v => {
					this.state.value.set(v)
					this.state.refresh()
				},
			})
			this.state.set(newColor)
		}

		const newValue = this.state.value

		this._emit('change', newValue)
		this.refresh(newValue)
		return this
	}

	refresh = (v = this.state.value) => {
		this.elements.controllers.currentColor.display.style.backgroundColor = v.hex8String
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

	#createCurrentColor(parent: HTMLDivElement) {
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
		this.evm.listen(display, 'click', this.togglePicker)

		const copyButton = new CopyButton(
			container,
			() => {
				return this.state.value.hex8String
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

	get #pickerContainer() {
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

		const pickerAnim = this.#pickerContainer.animate(
			[
				{ height: '0px', clipPath: 'inset(0 0 100% 0)' },
				{ height: InputColor.#pickerHeight, clipPath: 'inset(0 0 -50% 0)' },
			],
			{ duration: 200, easing: 'cubic-bezier(.08,.38,0,0.92)', fill: 'forwards' },
		)

		const containerAnim = this.elements.container.animate(
			{ maxHeight: '100px', height: '100px' },
			{ duration: 200, easing: 'cubic-bezier(.08,.38,0,0.92)', fill: 'forwards' },
		)

		this.#pickerContainer.style.overflow = 'visible'
		this.#pickerContainer.classList.add('expanded')

		await Promise.all([pickerAnim.finished, containerAnim.finished])
		pickerAnim.commitStyles()
		containerAnim.commitStyles()
	}

	close = async (duration = 300) => {
		this.expanded = false

		delete this.elements.container.dataset['search_height']

		const pickerAnim = this.#pickerContainer.animate(
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
		)

		this.#pickerContainer.style.overflow = 'hidden'
		this.#pickerContainer.classList.remove('expanded')

		await Promise.all([pickerAnim.finished, containerAnim.finished])
		pickerAnim.commitStyles()
		containerAnim.commitStyles()
	}
	//⌟

	//· Super Overrides ···································································¬

	protected dirtyCheck() {
		return this.state.value.hex8String !== this.initialValue.hex8String
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
		return super.save({ value: this.state.value.hex8String })
	}

	load(json: string | InputPreset<ColorInputOptions>) {
		const { value } = typeof json === 'string' ? JSON.parse(json) : json
		this.set(new Color(value))
	}
	//⌟

	dispose() {
		this.#log.fn('dispose').debug({ this: this })
		this.picker.dispose()
		super.dispose()
	}
}
