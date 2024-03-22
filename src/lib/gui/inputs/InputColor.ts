import type { ColorComponentsElements } from '../controllers/color/ColorComponents'
import type { ColorPickerElements } from '../controllers/color/ColorPicker'
import type { ColorFormat } from '$lib/color/types/colorFormat'
import type { ElementMap, ValueOrBinding } from './Input'
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
	/** A color swatch that displays the current color and toggles the color-picker when clicked. */
	currentColor: {
		container: HTMLDivElement
		displayBackground: HTMLDivElement
		display: HTMLDivElement
		copyButton: CopyButton
	}
	/** The main input content body. */
	body: {
		container: HTMLDivElement
		/** All elements related to the color picker. */
		picker: ColorPickerElements
		/** Number controllers for rgb/hsl/hsv components. */
		components: ColorComponentsElements
	}
}

export type ColorInputOptions = {
	title: string
	mode: ColorMode
	expanded: boolean
} & ValueOrBinding<ColorFormat | Color>
//⌟

export const COLOR_INPUT_DEFAULTS: ColorInputOptions = {
	title: 'Color',
	value: '#FF0000FF',
	mode: 'hex',
	expanded: false,
} as const

export class InputColor extends Input<Color, ColorInputOptions, ColorControllerElements> {
	initialValue: Color
	/** The color picker controller. */
	picker: ColorPicker
	/** RGBA/HSLA/HSVA number component inputs */
	components: ColorComponents
	/** When true, the color picker is visible. */
	expanded: boolean

	#mode: ColorMode
	// #pickerHeight: number
	// #pickerHeight = '120px'
	#pickerHeight = '5.3rem'

	type = 'Color' as const

	#log = new Logger('InputColor', { fg: 'cyan' })

	constructor(options: Partial<ColorInputOptions>, folder: Folder) {
		const opts = { ...COLOR_INPUT_DEFAULTS, ...options } as ColorInputOptions
		super(opts, folder)

		this.opts = opts
		this.expanded = opts.expanded
		this.#mode = opts.mode

		this.#log.fn('constructor').info({ opts, this: this }).groupEnd()

		//? Initialize state.
		if (opts.binding) {
			this.initialValue = new Color(opts.binding.target[opts.binding.key])
			this.state = state(this.initialValue)

			this.disposeCallbacks.add(
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
		// this.#updateCurrentColorCopyButtonColor()

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

		this.state.subscribe(v => {
			this.refresh(v)
			this.callOnChange(v)
		})

		this.components.refresh()

		// Promise.resolve().then(() => {
		setTimeout(() => {
			this.expanded ? this.open() : this.close(0)
		}, 10)
		// })

		// //! TEST
		// setInterval(this.togglePicker, 1500)
	}

	setState(v: ColorFormat | Color) {
		// console.log(Color.isColor(v) ? v.hsva.s : v)
		if (isColor(v)) {
			this.state.set(new Color(v.hsva))
		} else {
			this.state.set(new Color(v))
		}
	}

	refresh = (v = this.state.value) => {
		// console.log('refresh', this.state.value.hex8String)
		this.elements.controllers.currentColor.display.style.backgroundColor = v.hex8String
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
		this.listen(display, 'click', this.togglePicker)

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

	#animOpts = {
		duration: 250,
		easing: 'cubic-bezier(0.23, 1, 0.32, 1)',
		fill: 'forwards',
	} satisfies KeyframeAnimationOptions

	get #pickerContainer() {
		return this.picker.elements.container
	}

	togglePicker = () => {
		if (!this.expanded) {
			this.open()
		} else {
			this.close()
		}
	}

	open = (height = this.#pickerHeight) => {
		this.expanded = true

		const opts = {
			...this.#animOpts,
			easing: 'cubic-bezier(.08,.38,0,0.92)',
			duration: this.#animOpts.duration,
		}

		this.#pickerContainer.animate(
			[
				{
					height: '0px',
					clipPath: 'inset(0 0 100% 0)',
				},
				{
					height: height,
					clipPath: 'inset(0 0 -50% 0)',
				},
			],
			opts,
		).onfinish = () => {
			this.#pickerContainer.style.overflow = 'visible'
		}
		this.#pickerContainer.classList.add('expanded')

		this.elements.container.style.height = `unset`
	}

	close = (duration = this.#animOpts.duration) => {
		this.expanded = false

		const opts = { ...this.#animOpts, duration }

		this.#pickerContainer.animate(
			[
				{ height: this.#pickerHeight, clipPath: 'inset(0 0 -100% 0)' },
				{ height: '0px', clipPath: 'inset(0 0 100% 0)' },
			],
			opts,
		)
		this.#pickerContainer.style.overflow = 'hidden'
		this.#pickerContainer.classList.remove('expanded')
	}

	dispose() {
		this.#log.fn('dispose').info({ this: this })
		this.picker.dispose()
		super.dispose()
	}
}
