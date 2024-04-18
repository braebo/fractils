import type { ColorMode, InputColor } from '../../inputs/InputColor'

import { parseColorFormat } from '../../../color/color'
import { numberController } from '../number'
import { Controller } from '../Controller'
import { Select } from '../Select'

import { entries } from '../../../utils/object'
import { create } from '../../../utils/create'
import { Logger } from '../../../utils/logger'

export interface ColorComponentsOptions {
	container?: HTMLDivElement
	disabled: boolean
}

export const COLOR_PICKER_DEFAULTS = {
	disabled: false,
} as const satisfies ColorComponentsOptions

export type ColorComponentsElements = {
	container: HTMLDivElement
	title: HTMLDivElement
	select: Select<ColorMode>['elements']
	numbers: {
		a: HTMLInputElement
		b: HTMLInputElement
		c: HTMLInputElement
		d: HTMLInputElement
	}
	text: HTMLInputElement
}

export class ColorComponents extends Controller<ColorMode, ColorComponentsElements> {
	opts: ColorComponentsOptions
	element: HTMLDivElement
	elements: ColorComponentsElements
	select: Select<ColorMode>

	#mode: ColorMode
	/**
	 * Used to prevent inputs from being refreshed externally after they're updated internally.
	 */
	#locked = false

	#log = new Logger('ColorComponents', { fg: 'wheat' })

	constructor(
		public input: InputColor,
		options?: Partial<ColorComponentsOptions>,
	) {
		const opts = { ...COLOR_PICKER_DEFAULTS, ...options }
		super(opts)

		this.opts = opts
		this.#mode = input.mode

		const parent = opts.container ?? input.elements.controllers.container

		const componentsContainer = create('div', {
			classes: ['fracgui-input-color-components-container'],
			parent: parent,
		})
		this.element = componentsContainer

		const selectContainer = create('div', {
			classes: ['fracgui-input-color-components-select-container'],
			parent: componentsContainer,
		})

		this.select = new Select<ColorMode>({
			disabled: this.disabled,
			container: selectContainer,
			options: ['hex', 'hex8', 'rgba', 'hsla', 'hsva'],
		})
		this.select.onChange(v => {
			this.updateMode(v.value)
		})

		const numbersContainer = create('div', {
			classes: ['fracgui-input-color-components-numbers-container'],
			parent: componentsContainer,
		})

		const numbers = {
			a: numberController(this.input, this.input.opts, numbersContainer),
			b: numberController(this.input, this.input.opts, numbersContainer),
			c: numberController(this.input, this.input.opts, numbersContainer),
			d: numberController(this.input, this.input.opts, numbersContainer),
		}

		numbers.a.classList.add('a')
		numbers.b.classList.add('b')
		numbers.c.classList.add('c')
		numbers.d.classList.add('d')

		for (const [k, v] of entries(numbers)) {
			const update = () => {
				this[k] = +v.value
				this.input.set(this.color)
			}

			if (this.#modeType() === 'text') {
				v.classList.add('visible')
			}

			this.listen(v, 'input', update)
		}

		const text = create('input', {
			classes: [
				'fracgui-controller',
				'fracgui-controller-text',
				'fracgui-input-color-components-text',
			],
			parent: componentsContainer,
		})
		this.listen(text, 'change', (e: Event) => {
			let format = parseColorFormat((e.target as HTMLInputElement).value)
			if (!format) return

			// We need to make the first character lowercase to match the format names.
			format = format[0].toLowerCase() + format.slice(1)
			// @ts-ignore fuck off
			this.input.state.value[format] = (e.target as HTMLInputElement).value
			this.input.state.refresh()
			this.input.refresh()
		})

		if (this.#modeType() === 'text') {
			text.classList.add('visible')
		}

		this.elements = {
			container: componentsContainer,
			title: selectContainer,
			select: this.select.elements,
			numbers,
			text,
		}

		this.mode = this.#mode
	}

	get color() {
		return this.input.state.value
	}

	get mode() {
		return this.#mode
	}
	set mode(v: ColorMode) {
		this.#log.fn(`set mode`, v).debug()
		this.#mode = v

		this.select.selected = v
	}

	updateMode = (v = this.mode) => {
		this.#log.fn(`updateMode`, v).debug()
		this.#mode = v
		if (this.#modeType() === 'text') {
			this.elements.text.classList.add('visible')
			for (const [, v] of entries(this.elements.numbers)) {
				v.classList.remove('visible')
			}
			this.#refreshText()
		} else {
			this.elements.text.classList.remove('visible')
			for (const [, v] of entries(this.elements.numbers)) {
				v.classList.add('visible')
			}

			if (this.mode === 'rgba') {
				this.#setProps(this.elements.numbers.a, { min: 0, max: 255, step: 1 })
				this.#setProps(this.elements.numbers.b, { min: 0, max: 255, step: 1 })
				this.#setProps(this.elements.numbers.c, { min: 0, max: 255, step: 1 })
				this.#setProps(this.elements.numbers.d, { min: 0, max: 1, step: 0.01 })
			}

			if (['hsla', 'hsva'].includes(this.mode)) {
				this.#setProps(this.elements.numbers.a, { min: 0, max: 360, step: 1 })
				this.#setProps(this.elements.numbers.b, { min: 0, max: 100, step: 1 })
				this.#setProps(this.elements.numbers.c, { min: 0, max: 100, step: 1 })
				this.#setProps(this.elements.numbers.d, { min: 0, max: 1, step: 0.01 })
			}

			this.elements.select.selected.innerHTML = [...v]
				.map((c, i) => `<span class="${['a', 'b', 'c', 'd'][i]}">${c}</span>`)
				.join('')
		}

		this.refresh()
	}

	#setProps = (el: HTMLInputElement, props: { min: number; max: number; step: number }) => {
		this.#log.fn(`#setProps`, el, props).debug()
		for (const [k, v] of entries(props)) {
			el[k] = String(v)
		}
	}

	get a() {
		return this.mode === 'rgba' ? this.color.rgba.r : this.color.hsla.h
	}
	set a(v: number) {
		if (this.mode === 'rgba') {
			this.color.red = v
		} else {
			this.color.hue = v
		}
		this.#locked = true
		this.input.state.refresh()
	}

	get b() {
		return this.mode === 'rgba' ? this.color.rgba.g : this.color.hsla.s
	}
	set b(v: number) {
		if (this.mode === 'rgba') {
			this.color.green = v
		} else {
			this.color.saturation = v
		}
		this.#locked = true
		this.input.state.refresh()
	}

	get c() {
		switch (this.mode) {
			case 'rgba':
				return this.color.blue
			case 'hsla':
				return this.color.lightness
			case 'hsva':
			default:
				return this.color.value
		}
	}
	set c(v: number) {
		if (this.mode === 'rgba') {
			this.color.blue = v
		} else if (this.mode === 'hsla') {
			this.color.lightness = v
		} else if (this.mode === 'hsva') {
			this.color.value = v
		}
		this.#locked = true
		this.input.state.refresh()
	}

	get d() {
		return this.color.alpha
	}
	set d(v: number) {
		this.color.alpha = v
		this.#locked = true
		this.input.state.refresh()
	}

	#modeType(): 'text' | 'numbers' {
		if (['rgba', 'hsla', 'hsva'].includes(this.mode)) {
			return 'numbers'
		}

		return 'text'
	}

	#refreshText = () => {
		this.elements.text.value =
			// @ts-ignore fuck off
			this.color[this.mode.startsWith('hex') ? this.mode + 'String' : this.mode]
	}

	#lastColor: string | undefined
	#lastMode: ColorMode | undefined

	/**
	 * Updates the UI to reflect the current state of the source color.
	 */
	refresh = () => {
		this.#log.fn('refresh').debug()
		const color = this.input.state.value.hex8String
		const mode = this.mode
		if (this.#lastColor === color && mode === this.#lastMode) {
			return this
		}

		this.#lastColor = color
		this.#lastMode = mode

		if (this.#locked) {
			this.#locked = false
			return this
		}

		if (this.#modeType() === 'text') {
			this.#refreshText()
		} else {
			this.elements.numbers.a.value = String(this.a)
			this.elements.numbers.b.value = String(this.b)
			this.elements.numbers.c.value = String(this.c)
			this.elements.numbers.d.value = String(this.d)
		}

		return this
	}

	disable() {
		super.disable()
		this.select.disable()
		this.elements.text.disabled = true
		for (const [, v] of entries(this.elements.numbers)) {
			v.disabled = true
		}
		return this
	}

	enable() {
		super.enable()
		this.select.enable()
		this.elements.text.disabled = false
		for (const [, v] of entries(this.elements.numbers)) {
			v.disabled = false
		}
		return this
	}

	dispose() {
		this.elements.title.remove()
		this.elements.numbers.a.remove()
		this.elements.numbers.b.remove()
		this.elements.numbers.c.remove()
		this.elements.container.remove()
		this.elements.text.remove()
		this.select.dispose()
		super.dispose()
	}
}
