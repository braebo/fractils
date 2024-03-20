// import type { InputColor } from '../../inputs/InputColor'

// import { mapRange } from '../../../utils/mapRange'
// import { create } from '../../../utils/create'
// import { clamp } from '../../../utils/clamp'
// import { Controller } from '../Controller'

// export class ColorPicker extends Controller<InputColor> {
// 	declare elements: {
// 		container: HTMLDivElement
// 		canvas: HTMLCanvasElement
// 		cursor: HTMLDivElement
// 		hueSlider: HTMLInputElement
// 		alphaSlider: HTMLInputElement
// 	}

// 	#ctx: CanvasRenderingContext2D
// 	#height = 16 * 3
// 	#width = 256

// 	#gradientWhite!: CanvasGradient
// 	#gradientBlack!: CanvasGradient

// 	#dragging = false
// 	// #log = new Logger('ColorPicker', { fg: 'yellow' })

// 	constructor(public input: InputColor) {
// 		super(input)

// 		const container = create('div', {
// 			classes: ['fracgui-input-color-picker-container'],
// 			parent: input.elements.controllers.container,
// 		})

// 		const canvas = create('canvas', {
// 			classes: ['fracgui-input-color-picker-canvas'],
// 			parent: container,
// 			height: this.#height,
// 		})

// 		const cursor = create('div', {
// 			classes: ['fracgui-input-color-picker-cursor'],
// 			parent: container,
// 		})

// 		const hueSlider = create('input', {
// 			type: 'range',
// 			classes: ['fracgui-input-range', 'fracgui-input-color-picker-hue'],
// 			parent: container,
// 			min: '0',
// 			max: '359',
// 		})
// 		this.input.listen(hueSlider, 'input', this.#updateStateFromHue)

// 		const alphaSlider = create('input', {
// 			type: 'range',
// 			classes: ['fracgui-input-range', 'fracgui-input-color-picker-alpha'],
// 			parent: container,
// 			min: '0',
// 			max: '1',
// 			step: '0.01',
// 		})
// 		this.input.listen(alphaSlider, 'input', this.#updateAlpha)

// 		this.elements = {
// 			container,
// 			canvas,
// 			cursor,
// 			hueSlider,
// 			alphaSlider,
// 		}

// 		this.#ctx = canvas.getContext('2d')!

// 		this.canvas.width = this.#width
// 		this.refresh()

// 		this.input.listen(this.canvas, 'click', this.#onClick)
// 		this.input.listen(this.canvas, 'pointerdown', this.#onPointerDown)
// 		this.input.listen(window, 'pointermove', this.#onPointerMove, { passive: true })

// 		setTimeout(this.draw, 10)
// 		setTimeout(this.#setCursorFromColor, 20)
// 	}

// 	#lockCursorPosition = false

// 	refresh = () => {
// 		this.elements.hueSlider.value = String(this.hue)
// 		this.elements.alphaSlider.value = String(this.alpha)
// 		this.elements.alphaSlider.style.color = this.input.state.value.hexString

// 		this.#updateGradients()
// 		this.draw()

// 		if (this.#lockCursorPosition) {
// 			// Update the color only.
// 			this.elements.cursor.style.background = this.input.state.value.hexString
// 			this.#lockCursorPosition = false
// 		} else {
// 			this.#setCursorFromColor()
// 		}
// 	}

// 	#updateAlpha = (e: InputEvent) => {
// 		const alpha = Number((e.target as HTMLInputElement).value)
// 		const { h, s, l } = this.input.state.value.hsla
// 		this.input.state.value.hsla = { h, s, l, a: alpha }
// 		this.input.state.set(this.input.state.value)

// 		this.refresh()
// 	}

// 	/**
// 	 * A crude hack to set the cursor position from the color by looping
// 	 * through the canvas pixel by pixel and finding the closest match.
// 	 *
// 	 * @remarks Average run time is 2ms, which is longer than I'd like,
// 	 * but ok for now...
// 	 */
// 	#setCursorFromColor = () => {
// 		const { r, g, b } = this.input.state.value.rgba

// 		const { width, height } = this.canvas

// 		const imageData = this.#ctx.getImageData(0, 0, width, height)

// 		let closest = { x: 0, y: 0, diff: Number.MAX_VALUE }

// 		for (let x = 0; x < width; x++) {
// 			for (let y = 0; y < height; y++) {
// 				const i = (x + y * width) * 4

// 				const _r = imageData.data[i]
// 				const _g = imageData.data[i + 1]
// 				const _b = imageData.data[i + 2]

// 				const diff = Math.sqrt((r - _r) ** 2 + (g - _g) ** 2 + (b - _b) ** 2)

// 				if (diff < closest.diff) {
// 					closest = { x, y, diff }
// 				}
// 			}
// 		}

// 		// this.#drawCursor(closest.x, closest.y)

// 		const rect = this.canvas.getBoundingClientRect()
// 		const relativeX = mapRange(closest.x, 0, width, 0, rect.width)
// 		const relativeY = mapRange(closest.y, 0, height, 0, rect.height)

// 		this.#drawCursor(relativeX, relativeY)
// 	}

// 	get canvas() {
// 		return this.elements.canvas
// 	}

// 	get hue() {
// 		return this.input.state.value.hsla.h
// 	}

// 	get saturation() {
// 		return this.input.state.value.hsla.s
// 	}

// 	get lightness() {
// 		return this.input.state.value.hsla.l
// 	}

// 	get alpha() {
// 		return this.input.state.value.hsla.a
// 	}

// 	fill(style: string | CanvasGradient) {
// 		this.#ctx.fillStyle = style
// 		this.#ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
// 	}

// 	draw = () => {
// 		this.fill(`hsl(${this.hue}, 100%, 50%)`)
// 		this.fill(this.#gradientWhite)
// 		this.fill(this.#gradientBlack)
// 	}

// 	#updateGradients() {
// 		this.#gradientWhite = this.#ctx.createLinearGradient(0, 0, this.canvas.width, 0)
// 		this.#gradientWhite.addColorStop(0, 'rgba(255,255,255,1)')
// 		this.#gradientWhite.addColorStop(1, 'rgba(255,255,255,0)')

// 		this.#gradientBlack = this.#ctx.createLinearGradient(0, 0, 0, this.canvas.height)
// 		this.#gradientBlack.addColorStop(0, 'rgba(0,0,0,0)')
// 		this.#gradientBlack.addColorStop(1, 'rgba(0,0,0,1)')
// 	}

// 	//· Pointer Events ···································································¬

// 	#onPointerDown = (e: PointerEvent) => {
// 		this.#dragging = true
// 		this.#updateFromMousePosition(e)

// 		addEventListener('pointerup', this.#onPointerUp, { once: true })
// 	}

// 	#onPointerMove = (e: PointerEvent) => {
// 		if (this.#dragging) {
// 			this.#updateFromMousePosition(e)
// 		}
// 	}

// 	#onPointerUp = () => {
// 		this.#dragging = false
// 	}

// 	#onClick = (e: PointerEvent) => {
// 		this.#updateFromMousePosition(e)
// 		this.#dragging = false
// 	}

// 	#updateFromMousePosition(e: PointerEvent) {
// 		const { left, top, width, height } = this.canvas.getBoundingClientRect()
// 		const x = clamp(e.clientX - left, 0, width - 1)
// 		const y = clamp(e.clientY - top, 0, height - 1)

// 		const relativeX = mapRange(x, 0, width, 0, this.canvas.width)
// 		const relativeY = mapRange(y, 0, height, 0, this.canvas.height)

// 		const imageData = this.#ctx.getImageData(relativeX, relativeY, 1, 1).data

// 		const selection = {
// 			r: imageData[0],
// 			g: imageData[1],
// 			b: imageData[2],
// 			a: imageData[3] / 255,
// 		}

// 		this.input.state.value.rgba = selection
// 		this.input.state.set(this.input.state.value)

// 		this.#drawCursor(x, y)
// 	}
// 	//⌟

// 	#updateStateFromHue = (e: InputEvent) => {
// 		this.#lockCursorPosition = true

// 		const hue = Number((e.target as HTMLInputElement).value)

// 		const { s, l, a } = this.input.state.value.hsla
// 		this.input.state.value.hsla = { h: hue, s, l, a }
// 		this.input.state.set(this.input.state.value)

// 		this.draw()
// 	}

// 	#drawCursor = (x: number, y: number) => {
// 		this.elements.cursor.style.transform = `translate(${x}px, ${y}px)`
// 		this.elements.cursor.style.background = this.input.state.value.hexString
// 	}
// }
