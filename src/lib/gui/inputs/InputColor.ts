import type { ColorComponentsElements } from '../controllers/color/Components'
import type { ColorPickerElements } from '../controllers/color/ColorPicker'
import type { ColorFormat } from '$lib/color/types/colorFormat'
import type { ElementMap, InputOptions } from './Input'
import type { Folder } from '../Folder'

import { ColorComponents } from '../controllers/color/Components'
import { ColorPicker } from '../controllers/color/ColorPicker'
import { create } from '../../utils/create'
import { Logger } from '../../utils/logger'
import { Color } from '../../color/color'
import { state } from '../../utils/state'
import { Input } from './Input'

export type ColorMode =
	| 'rgba'
	| 'rgbaString'
	| 'hsla'
	| 'hslaString'
	| 'hsva'
	| 'hsvaString'
	| 'hex'
	| 'array'

export interface LabeledRangeElements extends ElementMap {
	container: HTMLDivElement
	title: HTMLDivElement
	input: HTMLInputElement
}

export interface ColorSliderElements extends ElementMap {
	container: HTMLDivElement
	/** `rgba.r` or `hsla.h */
	a: LabeledRangeElements
	/** `rgba.g` or `hsla.s */
	b: LabeledRangeElements
	/** `rgba.b` or `hsla.l */
	c: LabeledRangeElements
	/** `rgba.a` or `hsla.a */
	d: LabeledRangeElements
}

export interface ColorControllerElements extends ElementMap<ColorPicker> {
	container: HTMLDivElement
	/**
	 * A clickable swatch that displays the current color and toggles the color picker.
	 */
	currentColor: {
		container: HTMLDivElement
		display: HTMLDivElement
	}
	/**
	 * The main input content body.
	 */
	body: {
		container: HTMLDivElement
		/** All elements related to the color picker. */
		picker: ColorPickerElements
		/** Number controllers for rgb/hsl/hsv components. */
		components: ColorComponentsElements
	}
}

export interface ColorInputOptions extends InputOptions {
	value: ColorFormat | Color
	mode: ColorMode
}
//⌟

export const COLOR_INPUT_DEFAULTS: ColorInputOptions = {
	view: 'Color',
	title: 'Color',
	value: '#FF0000FF',
	mode: 'hex',
} as const

export class InputColor extends Input<Color, ColorInputOptions, ColorControllerElements> {
	#mode: ColorMode

	/**
	 * When true, the color picker is visible.
	 */
	expanded = true

	picker: ColorPicker
	components: ColorComponents

	#pickerHeight: number
	#log = new Logger('InputColor', { fg: 'cyan' })

	constructor(options: Partial<ColorInputOptions>, folder: Folder) {
		const opts = { ...COLOR_INPUT_DEFAULTS, ...options }
		super(opts, folder)

		this.opts = opts
		this.#mode = opts.mode

		this.#log.fn('constructor').info({ opts, this: this }).groupEnd()

		// Initialize state.
		if (opts.binding) {
			this.initialValue = new Color(opts.binding.target[opts.binding.key])
			this.state = state(this.initialValue)

			this.disposeCallbacks.add(
				this.state.subscribe((v) => {
					opts.binding!.target[opts.binding!.key] = v
				}),
			)
		} else {
			this.initialValue = new Color(opts.value)
			this.state = state(this.initialValue)
		}

		const container = create<HTMLDivElement>('div', {
			classes: ['fracgui-input-color-container'],
			parent: this.elements.content,
		})
		this.elements.controllers.container = container

		//- Current Color
		this.elements.controllers.currentColor = this.#createCurrentColor(container)

		//- Body
		const body = create<HTMLDivElement>('div', {
			classes: ['fracgui-input-color-body'],
			parent: container,
		})

		//- Color Picker
		this.picker = new ColorPicker(this, { container: body })
		// Should picker toggling be moved to the picker itself?
		this.#pickerHeight ||= this.picker.elements.container.clientHeight

		//- Components
		this.components = new ColorComponents(this, { container: body })

		this.elements.controllers.body = {
			container: body,
			picker: this.picker.elements,
			components: this.components.elements,
		}

		this.state.subscribe((v) => {
			this.refresh()
			this.callOnChange()
		})

		this.components.refresh()

		// //! TEST
		// setInterval(this.togglePicker, 1500)
	}

	setState(v: ColorFormat | Color) {
		// console.log(Color.isColor(v) ? v.hsva.s : v)
		if (Color.isColor(v)) {
			this.state.set(new Color(v.hsva))
		} else {
			this.state.set(new Color(v))
		}
	}

	refresh = () => {
		// console.log('refresh', this.state.value.hex8String)
		this.elements.controllers.currentColor.display.style.backgroundColor =
			this.state.value.hex8String
		this.picker.refresh()
		this.components.refresh()
	}

	//· Getters & Setters ····················································¬

	get mode() {
		return this.#mode
	}
	set mode(v: ColorMode) {
		this.#mode = v
		this.components.mode = v
	}

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
		const container = create<HTMLDivElement>('div', {
			classes: ['fracgui-input-color-current-color-container'],
			parent,
		})

		const display = create<HTMLDivElement>('div', {
			classes: ['fracgui-input-color-current-color-display'],
			parent: container,
		})

		this.listen(display, 'click', this.togglePicker)

		return {
			container,
			display,
		}
	}

	#animOpts: KeyframeAnimationOptions = {
		duration: 500,
		easing: 'cubic-bezier(0.23, 1, 0.32, 1)',
		fill: 'forwards',
	}

	get #pickerContainer() {
		return this.picker.elements.container
	}

	togglePicker = () => {
		this.#pickerHeight ||= this.picker.elements.container.clientHeight

		this.#log
			.fn('togglePicker')
			.info({ expanded: this.expanded, pickerHeight: this.#pickerHeight })

		if (!this.expanded) {
			this.openPicker()
		} else {
			this.closePicker()
		}
	}

	openPicker = (height = this.#pickerHeight + 'px') => {
		this.#pickerContainer.animate({ height }, this.#animOpts).onfinish = () => {
			this.#pickerContainer.style.overflow = 'visible'
		}

		this.expanded = true
		this.#pickerContainer.classList.add('expanded')
	}

	closePicker = () => {
		this.#pickerContainer.animate(
			[{ height: this.#pickerHeight + 'px' }, { height: 0 }],
			this.#animOpts,
		)
		this.#pickerContainer.style.overflow = 'hidden'

		this.expanded = false
		this.#pickerContainer.classList.remove('expanded')
	}

	dispose() {
		this.#log.fn('dispose').info({ this: this })
		this.picker.dispose()
		super.dispose()
	}
}
