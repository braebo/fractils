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

	#h: string
	#s: number
	#l: number
	#a: number

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
			max: '360',
		})
		this.input.listen(hueSlider, 'input', this.#updateHue)

		this.elements = {
			container,
			canvas,
			cursor,
			hueSlider,
		}

		this.#ctx = canvas.getContext('2d')!

		console.log(this.input.state.value.hex)
		console.log(this.input.state.value.hsla)

		const { h, s, l, a } = this.input.state.value.hsla
		this.#h = `hsl(${h}, 100%, 50%)`
		this.#s = s
		this.#l = l
		this.#a = a

		this.#updateGradients()

		this.input.listen(this.canvas, 'click', this.#onClick)
		this.input.listen(this.canvas, 'pointerdown', this.#onPointerDown)
		this.input.listen(window, 'pointermove', this.#onPointerMove, { passive: true })

		setTimeout(this.draw, 10)
	}

	get hue() {
		return this.#h
	}
	set hue(v: string) {
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

	#updateGradients() {
		this.#gradientWhite = this.#ctx.createLinearGradient(1, 0, this.canvas.width - 1, 0)
		this.#gradientWhite.addColorStop(0, 'rgba(255,255,255,1)')
		this.#gradientWhite.addColorStop(1, 'rgba(255,255,255,0)')

		this.#gradientBlack = this.#ctx.createLinearGradient(0, 1, 0, this.canvas.height - 2)
		this.#gradientBlack.addColorStop(0, 'rgba(0,0,0,0)')
		this.#gradientBlack.addColorStop(1, 'rgba(0,0,0,1)')
	}

	draw = () => {
		this.fill(this.#h)
		this.fill(this.#gradientWhite)
		this.fill(this.#gradientBlack)
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

		this.drawCursor(x, y)
	}

	#updateHue = (e: InputEvent) => {
		const hue = Number((e.target as HTMLInputElement).value)
		this.hue = `hsl(${hue}, 100%, 50%)`
		const rgba = this.input.state.value.hueToRGBA(hue)
		this.input.state.value.rgba = rgba
		this.input.state.set(this.input.state.value)
		this.draw()
	}

	get canvas() {
		return this.elements.canvas
	}

	get hex() {
		return this.input.state.value.hex
	}

	update() {
		// TODO
	}

	drawCursor = (x: number, y: number) => {
		this.elements.cursor.style.transform = `translate(${x}px, ${y}px)`
	}
}
