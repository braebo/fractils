import type { InputColor } from '../inputs/Color'

import { create } from '../../utils/create'
import { Controller } from './Controller'
import { clamp } from '$lib/utils/clamp'
import { mapRange } from '$lib/utils/mapRange'

export class ColorPicker extends Controller<InputColor> {
	declare elements: {
		container: HTMLDivElement
		canvas: HTMLCanvasElement
		cursor: HTMLDivElement
		hueSlider: HTMLInputElement
	}

	#ctx: CanvasRenderingContext2D
	#height = 16 * 3

	#h!: number
	#s!: number
	#l!: number
	#a!: number

	#gradientWhite!: CanvasGradient
	#gradientBlack!: CanvasGradient

	#dragging = false

	constructor(input: InputColor) {
		super(input)

		const container = create<HTMLDivElement>('div', {
			classes: ['gui-input-color-picker-container'],
			parent: input.elements.controllers.container,
		})

		const canvas = create<HTMLCanvasElement>('canvas', {
			classes: ['gui-input-color-picker-canvas'],
			parent: container,
			height: this.#height,
		})

		const cursor = create<HTMLDivElement>('div', {
			classes: ['gui-input-color-picker-cursor'],
			parent: container,
		})

		const hueSlider = create<HTMLInputElement>('input', {
			type: 'range',
			classes: ['gui-input-range', 'gui-input-color-picker-hue'],
			parent: container,
			min: '0',
			max: '359',
		})
		this.input.listen(hueSlider, 'input', this.#updateStateFromHue)

		this.elements = {
			container,
			canvas,
			cursor,
			hueSlider,
		}

		this.#ctx = canvas.getContext('2d')!

		this.#updateHSLA()

		this.#updateGradients()

		this.input.listen(this.canvas, 'click', this.#onClick)
		this.input.listen(this.canvas, 'pointerdown', this.#onPointerDown)
		this.input.listen(window, 'pointermove', this.#onPointerMove, { passive: true })

		setTimeout(this.draw, 10)
		setTimeout(this.setCursorFromColor, 20)
	}

	setCursorFromColor = () => {
		const rect = this.canvas.getBoundingClientRect()
		const width = rect.width
		const height = rect.height

		// Normalize HSL values between 0 and 1
		const h = this.#h / 360
		const s = this.#s
		const l = this.#l

		// Calculate x position (saturation)
		const x = s * width

		// Calculate y position (lightness)
		// Y is at the bottom if lightness is 0, at the top if lightness is 1, and in the middle if saturation is 0
		let y = height * (1 - l)
		if (s === 0) {
			y = height / 2
		} else if (l === 1) {
			y = 0
		}

		this.drawCursor(x, y)
	}

	get canvas() {
		return this.elements.canvas
	}

	get hue() {
		return this.#h
	}
	set hue(v: number) {
		this.#h = v
		this.draw()
	}

	get saturation() {
		return this.#s
	}
	set saturation(v: number) {
		this.#s = v
		this.draw()
	}

	get lightness() {
		return this.#l
	}
	set lightness(v: number) {
		this.#l = v
		this.draw()
	}

	get alpha() {
		return this.#a
	}
	set alpha(v: number) {
		this.#a = v
		this.draw()
	}

	fill(style: string | CanvasGradient) {
		this.#ctx.fillStyle = style
		this.#ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
	}

	draw = () => {
		this.fill(`hsl(${this.#h}, 100%, 50%)`)
		this.fill(this.#gradientWhite)
		this.fill(this.#gradientBlack)
	}

	#updateHSLA() {
		const { h, s, l, a } = this.input.state.value.hsla

		this.#h = h
		this.#s = s
		this.#l = l
		this.#a = a
	}

	#updateGradients() {
		this.#gradientWhite = this.#ctx.createLinearGradient(1, 0, this.canvas.width - 1, 0)
		this.#gradientWhite.addColorStop(0, 'rgba(255,255,255,1)')
		this.#gradientWhite.addColorStop(1, 'rgba(255,255,255,0)')

		this.#gradientBlack = this.#ctx.createLinearGradient(0, 1, 0, this.canvas.height - 2)
		this.#gradientBlack.addColorStop(0, 'rgba(0,0,0,0)')
		this.#gradientBlack.addColorStop(1, 'rgba(0,0,0,1)')
	}

	#onPointerDown = (e: PointerEvent) => {
		this.#dragging = true
		this.#updateFromMousePosition(e)

		addEventListener('pointerup', this.#onPointerUp, { once: true })
	}

	#onPointerMove = (e: PointerEvent) => {
		if (this.#dragging) {
			this.#updateFromMousePosition(e)
		}
	}

	#onPointerUp = () => {
		this.#dragging = false
	}

	#onClick = (e: MouseEvent) => {
		this.#updateFromMousePosition(e)
		this.#dragging = false
	}

	#updateFromMousePosition(e: MouseEvent) {
		const { left, top, width, height } = this.canvas.getBoundingClientRect()
		const x = clamp(e.clientX - left, 0, width - 1)
		const y = clamp(e.clientY - top, 0, height - 1)

		const relativeX = mapRange(x, 0, width, 0, this.canvas.width)
		const relativeY = mapRange(y, 0, height, 0, this.canvas.height)

		const imageData = this.#ctx.getImageData(relativeX, relativeY, 1, 1).data

		const selection = {
			r: imageData[0],
			g: imageData[1],
			b: imageData[2],
			a: imageData[3] / 255,
		}

		this.input.state.value.rgba = selection
		this.input.state.set(this.input.state.value)

		this.#updateHSLA()

		this.drawCursor(x, y)
	}

	#updateStateFromHue = (e: InputEvent) => {
		const hue = Number((e.target as HTMLInputElement).value)
		this.#h = hue

		const { s, l, a } = this.input.state.value.hsla
		this.input.state.value.hsla = { h: hue, s, l, a }
		this.input.state.set(this.input.state.value)

		this.draw()
	}

	drawCursor = (x: number, y: number) => {
		this.elements.cursor.style.transform = `translate(${x}px, ${y}px)`
	}
}
