// Box methods from irojs: https://github.com/jaames/iro.js

import { Color, type ColorValue } from '../../../color/color'
import { tooltip } from '../../../actions/tooltip'

export type LayoutDirection = 'vertical' | 'horizontal' | ''

export type WheelDirection = 'clockwise' | 'anticlockwise' | ''

export interface ColorPickerOptions {
	/**
	 * The initial color of the color picker.  Can be any valid {@link ColorValue}.
	 * @default '#fff'
	 */
	color: ColorValue
	/**
	 * The container element for the color picker.
	 */
	container?: HTMLElement
	/**
	 * An array of color swatches.
	 */
	swatches: ColorValue[]
	/**
	 * The radius of the color picker handle (the little circle
	 * that moves around the color picker) in pixels.
	 * @default 10
	 */
	handleSize: number
	// width: number
	// height: number
	// padding: number
	// layoutDirection: LayoutDirection
	// borderColor: string
	// borderWidth: number
	// handleRadius: number
	// handleProps: any
	// wheelLightness: boolean
	// wheelAngle: number
	// wheelDirection: WheelDirection
	// sliderMargin: number
	// activeHandleRadius?: number
	// handleSvg?: string
	// sliderSize?: number
	// boxHeight?: number
}

export const COLOR_PICKER_DEFAULTS: ColorPickerOptions = {
	color: '#fff',
	swatches: [],
	handleSize: 10,
	container: undefined,
	// width: 300,
	// height: 300,
	// padding: 6,
	// layoutDirection: 'vertical',
	// borderColor: '#fff',
	// borderWidth: 0,
	// handleRadius: 8,
	// handleProps: { x: 0, y: 0 },
	// wheelLightness: true,
	// wheelAngle: 0,
	// wheelDirection: 'anticlockwise',
	// sliderMargin: 12,
	// activeHandleRadius: null,
	// handleSvg: null,
	// sliderSize: null,
	// boxHeight: null,
}

// export function cssBorderStyles(props: ColorPickerOptions) {
// 	return {
// 		boxSizing: 'border-box',
// 		border: `${props.borderWidth}px solid ${props.borderColor}`,
// 	}
// }

import type { InputColor } from '../../inputs/InputColor'

import { create } from '../../../utils/create'
import { clamp } from '../../../utils/clamp'
import { Controller } from '../Controller'

type ColorPickerElements = {
	container: HTMLDivElement
	canvas: HTMLCanvasElement
	cursor: HTMLDivElement
	hueSlider: HTMLInputElement
	alphaSlider: HTMLInputElement
}

export class ColorPicker extends Controller<InputColor, ColorPickerElements> {
	opts: ColorPickerOptions
	elements: ColorPickerElements

	#ctx: CanvasRenderingContext2D
	#height = 16 * 3
	#width = 256

	#gradientWhite!: CanvasGradient
	#gradientBlack!: CanvasGradient

	#dragging = false
	// #log = new Logger('ColorPicker', { fg: 'yellow' })

	constructor(input: InputColor, options?: Partial<ColorPickerOptions>) {
		const opts = { ...COLOR_PICKER_DEFAULTS, ...options }
		super(input)

		this.opts = opts

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

		const alphaSlider = create<HTMLInputElement>('input', {
			type: 'range',
			classes: ['gui-input-range', 'gui-input-color-picker-alpha'],
			parent: container,
			min: '0',
			max: '1',
			step: '0.01',
		})
		this.input.listen(alphaSlider, 'input', this.#updateAlpha)

		tooltip(alphaSlider, {
			text: () => this.input.state.value.alpha,
			placement: 'top',
			offsetX: 0,
			anchor: {
				x: 'mouse',
				y: alphaSlider.querySelector('#thumb'),
			},
		})

		this.elements = {
			container,
			canvas,
			cursor,
			hueSlider,
			alphaSlider,
		}

		this.#ctx = canvas.getContext('2d')!

		this.canvas.width = this.#width
		this.refresh()

		this.input.listen(this.canvas, 'click', this.#onClick)
		this.input.listen(this.canvas, 'pointerdown', this.#onPointerDown)
		this.input.listen(window, 'pointermove', this.#onPointerMove, { passive: true })

		this.#updateGradients()
		setTimeout(this.draw, 10)
		setTimeout(this.#updateHandlePosition, 20)
	}

	#lockCursorPosition = false

	refresh = () => {
		this.elements.hueSlider.value = String(this.hue)
		this.elements.alphaSlider.value = String(this.alpha)
		this.elements.alphaSlider.style.color = this.input.state.value.hexString

		// this.#updateGradients()
		this.draw()

		if (this.#lockCursorPosition) {
			// Update the color only.
			this.elements.cursor.style.background = this.input.state.value.hexString
			this.#lockCursorPosition = false
		} else {
			// this.#setCursorFromColor(this.input.state.value.hsv.s, this.input.state.value.hsv.v)
			this.#updateHandlePosition()
		}
	}

	#updateAlpha = (e: InputEvent) => {
		const alpha = Number((e.target as HTMLInputElement).value)

		this.input.state.value.alpha = alpha
		this.input.state.refresh()
	}

	// /**
	//  * A crude hack to set the cursor position from the color by looping
	//  * through the canvas pixel by pixel and finding the closest match.
	//  *
	//  * @remarks Average run time is 2ms, which is longer than I'd like,
	//  * but ok for now...
	//  */
	// #setCursorFromColor = () => {
	// 	const { r, g, b } = this.input.state.value.rgba

	// 	const { width, height } = this.canvas

	// 	const imageData = this.#ctx.getImageData(0, 0, width, height)

	// 	let closest = { x: 0, y: 0, diff: Number.MAX_VALUE }

	// 	for (let x = 0; x < width; x++) {
	// 		for (let y = 0; y < height; y++) {
	// 			const i = (x + y * width) * 4

	// 			const _r = imageData.data[i]
	// 			const _g = imageData.data[i + 1]
	// 			const _b = imageData.data[i + 2]

	// 			const diff = Math.sqrt((r - _r) ** 2 + (g - _g) ** 2 + (b - _b) ** 2)

	// 			if (diff < closest.diff) {
	// 				closest = { x, y, diff }
	// 			}
	// 		}
	// 	}

	// 	// this.#drawCursor(closest.x, closest.y)

	// 	const rect = this.canvas.getBoundingClientRect()
	// 	const relativeX = mapRange(closest.x, 0, width, 0, rect.width)
	// 	const relativeY = mapRange(closest.y, 0, height, 0, rect.height)

	// 	this.#drawCursor(relativeX, relativeY)
	// }

	/**
	 * @desc Get the current box value from user input
	 * @param props - box props
	 * @param x - global input x position
	 * @param y - global input y position
	 */
	#getColorAtCoords = (x: number, y: number) => {
		const { width, height } = this.canvas.getBoundingClientRect()

		const radius = this.opts.handleSize / 2 - 0.5

		const handleStart = radius
		const handleRangeX = width - radius * 2
		const handleRangeY = height - radius * 2
		const percentX = ((x - handleStart) / handleRangeX) * 100
		const percentY = ((y - handleStart) / handleRangeY) * 100

		return {
			s: Math.max(0, Math.min(percentX, 100)),
			v: Math.max(0, Math.min(100 - percentY, 100)),
		}
	}

	get canvas() {
		return this.elements.canvas
	}

	get hue() {
		return this.input.state.value.hsla.h
	}

	get saturation() {
		return this.input.state.value.hsla.s
	}

	get lightness() {
		return this.input.state.value.hsla.l
	}

	get alpha() {
		return this.input.state.value.hsla.a
	}

	fill(style: string | CanvasGradient) {
		this.#ctx.fillStyle = style
		this.#ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
	}

	draw = () => {
		this.fill(`hsl(${this.hue}, 100%, 50%)`)
		this.fill(this.#gradientWhite)
		this.fill(this.#gradientBlack)
	}

	#updateGradients() {
		this.#gradientWhite = this.#ctx.createLinearGradient(0, 0, this.canvas.width, 0)
		this.#gradientWhite.addColorStop(0, 'rgba(255,255,255,1)')
		this.#gradientWhite.addColorStop(1, 'rgba(255,255,255,0)')

		this.#gradientBlack = this.#ctx.createLinearGradient(0, 0, 0, this.canvas.height)
		this.#gradientBlack.addColorStop(0, 'rgba(0,0,0,0)')
		this.#gradientBlack.addColorStop(1, 'rgba(0,0,0,1)')
	}

	//· Pointer Events ···································································¬

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

	#onClick = (e: PointerEvent) => {
		this.#updateFromMousePosition(e)
		this.#dragging = false
	}

	#updateFromMousePosition(e: PointerEvent) {
		const { left, top, width, height } = this.canvas.getBoundingClientRect()
		const x = clamp(e.clientX - left, 0, width)
		const y = clamp(e.clientY - top, 0, height)

		const { s, v } = this.#getColorAtCoords(x, y)
		this.input.state.value.hsv = { h: this.hue, s, v }
		this.input.state.set(this.input.state.value)

		this.#drawCursor(this.#getHandlePosition(this.input.state.value))
	}
	//⌟

	#updateHandlePosition = (color = this.input.state.value) => {
		this.#drawCursor(this.#getHandlePosition(color))
	}

	/**
	 * Get the current handle position for a given color.
	 */
	#getHandlePosition = (color: Color) => {
		const { width, height } = this.canvas.getBoundingClientRect()

		const hsv = color.hsv
		const radius = this.opts.handleSize / 2 - 0.5
		const handleRangeX = width - radius * 2
		const handleRangeY = height - radius * 2

		return {
			x: radius + (hsv.s / 100) * handleRangeX,
			y: radius + (handleRangeY - (hsv.v / 100) * handleRangeY),
		}
	}

	#updateStateFromHue = (e: InputEvent) => {
		this.#lockCursorPosition = true

		const hue = Number((e.target as HTMLInputElement).value)

		const { s, l, a } = this.input.state.value.hsla
		this.input.state.value.hsla = { h: hue, s, l, a }
		this.input.state.set(this.input.state.value)

		this.draw()
	}

	#drawCursor = (coords: { x: number; y: number }) => {
		this.elements.cursor.style.transform = `translate(${coords.x}px, ${coords.y}px)`
		this.elements.cursor.style.background = this.input.state.value.hexString
	}
}
