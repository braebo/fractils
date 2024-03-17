import type { resizable } from '../actions/resizable'
import type { State } from '../utils/state'

import { debounce } from '../utils/debounce'
import { logger } from '../utils/logger'
import { state } from '../utils/state'
import { select } from './select'
import { clamp } from './clamp'
import { fn, gr } from './l'

type ElementsOrSelectors = string | HTMLElement | (string | HTMLElement)[] | undefined

/**
 * The sides of an element that can be resized by the {@link resizable} action.
 */
export type Side = 'top' | 'right' | 'bottom' | 'left'

/**
 * The corners of an element that can be resized by the {@link resizable} action.
 * @see {@link Side}
 */
export type Corner = 'top-left' | 'top-right' | 'bottom-right' | 'bottom-left'

/**
 * Options for the {@link resizable} action.
 */
export interface ResizableOptions {
	/**
	 * To only allow resizing on certain sides, specify them here.
	 * @default ['top', 'right', 'bottom', 'left']
	 */
	sides: Side[]

	/**
	 * To only allow resizing on certain corners, specify them here.
	 * @default ['top-left', 'top-right', 'bottom-right', 'bottom-left']
	 */
	corners: ('top-left' | 'top-right' | 'bottom-right' | 'bottom-left')[]

	/**
	 * The size of the resize handle in pixels.
	 * @default 6
	 */
	grabberSize: number | string

	/**
	 * Optional callback function that runs when the element is resized.
	 * @default () => void
	 */
	onResize: (size: { width: number; height: number }) => void

	/**
	 * If provided, the size of the element will be persisted
	 * to local storage under the specified key.
	 * @default undefined
	 */
	localStorageKey?: string

	/**
	 * Use a visible or invisible gutter.
	 * @default false
	 */
	visible: boolean

	/**
	 * Gutter css color (if visible = `true`)
	 * @default 'var(--fg-d, #1d1d1d)'
	 */
	color: string

	/**
	 * Border radius of the element.
	 * @default '0.5rem'
	 */
	borderRadius: string

	/**
	 * The element to use as the bounds for resizing.
	 * @default window['document']['documentElement']
	 */
	bounds: HTMLElement | (string & {})

	/**
	 * Element's or selectors which will act as collision obstacles for the draggable element.
	 */
	obstacles: ElementsOrSelectors

	/**
	 * Whether to apply different `cursor` values to grabbers.
	 */
	cursors: boolean

	/**
	 * The classnames to apply to the resize grabbers, used for styling.
	 * @default { default: 'resize-grabber', active: 'resize-grabbing' }
	 */
	classes: {
		/** @default 'resize-grabber' */
		default: string
		/** @default 'resize-grabbing' */
		active: string
	}
}

const RESIZABLE_DEFAULTS = {
	sides: ['top', 'right', 'bottom', 'left'],
	corners: ['top-left', 'top-right', 'bottom-right', 'bottom-left'],
	grabberSize: 6,
	onResize: () => {},
	localStorageKey: undefined,
	visible: false,
	color: 'var(--fg-d, #1d1d1d)',
	borderRadius: '50%',
	obstacles: undefined,
	cursors: true,
	classes: {
		default: 'resize-grabber',
		active: 'resize-grabbing',
	},
} as const satisfies Omit<ResizableOptions, 'bounds'>

const px = (size: number | string) => {
	if (typeof size === 'number') return `${size}px`
	else return size
}

/**
 * Makes an element resizable by dragging its edges.  For the
 * svelte-action version, see {@link resizable}.
 *
 * @param node - The element to make resizable.
 * @param options - {@link ResizableOptions}
 *
 * @example Basic
 * ```ts
 * import { Resizable } from 'fractils'
 *
 * const node = document.createElement('div')
 * new Resizable(node)
 * ```
 *
 * @example Advanced
 * ```ts
 * import { Resizable } from 'fractils'
 *
 * const node = document.createElement('div')
 * new Resizable(node, {
 * 	sides: ['left', 'bottom'],
 * 	grabberSize: 3,
 * 	onResize: () => console.log('resized'),
 * 	localStorageKey: 'resizableL::size',
 * 	visible: false,
 * 	color: 'var(--fg-d)',
 * 	borderRadius: '0.5rem',
 * })
 * ```
 */
export class Resizable implements Omit<ResizableOptions, 'size' | 'obstacles'> {
	static initialized = false
	opts: ResizableOptions

	sides!: ResizableOptions['sides']
	corners!: ResizableOptions['corners']
	color!: ResizableOptions['color']
	visible!: ResizableOptions['visible']
	borderRadius!: ResizableOptions['borderRadius']
	grabberSize!: ResizableOptions['grabberSize']
	onResize!: ResizableOptions['onResize']
	cursors!: ResizableOptions['cursors']
	classes!: ResizableOptions['classes']

	bounds: HTMLElement
	obstacleEls: HTMLElement[]
	size: State<{ width: number; height: number }>
	localStorageKey?: string

	#activeGrabber: HTMLElement | null = null
	#listeners: (() => void)[] = []
	#cleanupGrabListener: (() => void) | null = null
	#cornerGrabberSize: number

	#log: ReturnType<typeof logger>

	constructor(
		public node: HTMLElement,
		options?: Partial<ResizableOptions>,
	) {
		const opts = Object.assign({}, RESIZABLE_DEFAULTS, options) as ResizableOptions
		// const opts = { ...RESIZABLE_DEFAULTS, ...options }
		Object.assign(this, opts)
		this.opts = opts

		const label = this.localStorageKey ? gr(':' + this.localStorageKey) : ''
		this.#log = logger('resizable' + label, {
			fg: 'GreenYellow',
			deferred: false,
		})
		this.#log(fn('constructor'), { opts, this: this })

		this.node.classList.add('fractils-resizable')

		this.#cornerGrabberSize = +this.grabberSize * 3

		this.bounds = select(opts.bounds)[0] ?? globalThis.document?.documentElement
		this.obstacleEls = select(opts.obstacles)

		if (!Resizable.initialized) {
			Resizable.initialized = true
			this.generateGlobalCSS()
		}

		const { offsetWidth: width, offsetHeight: height } = node

		this.size = state({ width, height }, { key: this.localStorageKey })

		//? Load size from local storage.
		if (this.localStorageKey) {
			const { width, height } = this.size.value
			node.style.width = width + 'px'
			node.style.height = height + 'px'
			node.dispatchEvent(new CustomEvent('resize'))
		}

		this.createGrabbers()

		if (+this.node.style.minWidth > this.boundsRect.width) {
			console.error('Min width is greater than bounds width.')
			return
		}
	}

	get boundsRect() {
		return this.bounds.getBoundingClientRect()
	}

	saveSize = debounce(() => {
		this.size.set({
			width: this.node.offsetWidth,
			height: this.node.offsetHeight,
		})
	}, 50)

	//? Create resize grabbers.

	createGrabbers() {
		for (const [side, type] of [
			...this.sides.map((s) => [s, 'side']),
			...this.corners.map((c) => [c, 'corner']),
		]) {
			const grabber = document.createElement('div')
			grabber.classList.add(this.opts.classes.default)
			grabber.classList.add(this.opts.classes.default + '-' + type)
			grabber.classList.add(this.opts.classes.default + '-' + side)
			grabber.dataset.side = side
			// grabber.style.setProperty('opacity', this.opts.visible ? '1' : '0')

			grabber.addEventListener('pointerdown', this.onGrab)
			this.#listeners.push(() => grabber.removeEventListener('pointerdown', this.onGrab))

			this.node.appendChild(grabber)
		}
	}

	clickOffset = { x: 0, y: 0 }

	onGrab = (e: PointerEvent) => {
		this.#activeGrabber = e.currentTarget as HTMLElement

		this.#activeGrabber.classList.add(this.classes.active)
		document.body.classList.add(this.classes.active)

		const side = this.#activeGrabber.dataset.side
		if (side!.match(/top/)) this.clickOffset.y = e.clientY - this.rect.top
		if (side!.match(/bottom/)) this.clickOffset.y = e.clientY - this.rect.bottom
		if (side!.match(/left/)) this.clickOffset.x = e.clientX - this.rect.left
		if (side!.match(/right/)) this.clickOffset.x = e.clientX - this.rect.right

		e.preventDefault()
		e.stopPropagation()

		this.#cleanupGrabListener?.()
		document.addEventListener('pointermove', this.onMove)
		this.#cleanupGrabListener = () => document.removeEventListener('pointermove', this.onMove)

		this.node.dispatchEvent(new CustomEvent('grab', { detail: { side } }))

		document.addEventListener('pointerup', this.onUp, { once: true })
	}

	get translateX() {
		return +this.node.dataset.translateX! || 0
	}
	set translateX(v: number) {
		this.node.dataset.translateX = String(v)
	}

	get translateY() {
		return +this.node.dataset.translateY! || 0
	}
	set translateY(v: number) {
		this.node.dataset.translateY = String(v)
	}

	get rect() {
		return this.node.getBoundingClientRect()
	}

	resizeLeft = (x: number) => {
		const { width, top, bottom, left } = this.node.getBoundingClientRect()
		const { minWidth, maxWidth, paddingLeft, paddingRight, borderLeftWidth, borderRightWidth } =
			window.getComputedStyle(this.node)

		let deltaX = x - left
		if (deltaX === 0) return this

		for (const obstacle of this.obstacleEls) {
			const o = obstacle.getBoundingClientRect()
			// too high || too low || opposite side || opposite direction
			if (top > o.bottom || bottom < o.top || left < o.right || left + deltaX >= o.right)
				continue
			deltaX = Math.max(deltaX, o.right - left)
		}

		const borderBox =
			parseFloat(paddingLeft) +
			parseFloat(paddingRight) +
			parseFloat(borderLeftWidth) +
			parseFloat(borderRightWidth)
		const min = Math.max((parseFloat(minWidth) || 0) + borderBox, 25)
		const max = Math.min(this.boundsRect.width, +maxWidth || Infinity)
		const newWidth = clamp(width - deltaX, min, max)

		// console.log('borderBox', borderBox)
		// console.log('minWidth', minWidth)
		// console.log('min', min)
		// console.log('max', max)
		// console.log('newWidth', newWidth)

		if (newWidth === min) deltaX = width - newWidth
		this.translateX += deltaX

		this.node.style.setProperty('translate', `${this.translateX}px ${this.translateY}px`)
		this.node.style.width = `${newWidth}px`

		return this
	}

	resizeRight = (x: number) => {
		const { width, top, right, bottom } = this.node.getBoundingClientRect()
		const { minWidth, maxWidth, paddingLeft, paddingRight, borderLeftWidth, borderRightWidth } =
			window.getComputedStyle(this.node)

		let deltaX = x - right
		if (deltaX === 0) return this

		for (const obstacle of this.obstacleEls) {
			const o = obstacle.getBoundingClientRect()
			// too high || too low || already passed || unreachable with delta
			if (top > o.bottom || bottom < o.top || right > o.left || right + deltaX <= o.left)
				continue
			deltaX = Math.min(deltaX, o.left - right)
		}

		const borderBox =
			parseFloat(paddingLeft) +
			parseFloat(paddingRight) +
			parseFloat(borderLeftWidth) +
			parseFloat(borderRightWidth)
		const min = Math.max((parseFloat(minWidth) || 0) + borderBox, 25)
		const max = Math.min(this.boundsRect.width, +maxWidth || Infinity)
		const newWidth = clamp(width + deltaX, min, max)

		this.node.style.width = `${newWidth}px`

		return this
	}

	resizeTop = (y: number) => {
		const { height, top, right, left } = this.node.getBoundingClientRect()
		const {
			minHeight,
			maxHeight,
			paddingTop,
			paddingBottom,
			borderTopWidth,
			borderBottomWidth,
		} = window.getComputedStyle(this.node)

		let deltaY = y - top
		if (deltaY === 0) return this

		for (const obstacle of this.obstacleEls) {
			const o = obstacle.getBoundingClientRect()
			// too high || too low || opposite side || opposite direction
			if (left > o.right || right < o.left || top < o.bottom || top + deltaY >= o.bottom)
				continue
			deltaY = Math.max(deltaY, o.bottom - top)
		}

		const borderBox =
			parseFloat(paddingTop) +
			parseFloat(paddingBottom) +
			parseFloat(borderTopWidth) +
			parseFloat(borderBottomWidth)
		const min = Math.max((parseFloat(minHeight) || 0) + borderBox, 25)
		const max = Math.min(this.boundsRect.height, +maxHeight || Infinity)
		const newHeight = clamp(height - deltaY, min, max)

		if (newHeight === min) deltaY = height - newHeight

		this.translateY += deltaY

		this.node.style.setProperty('translate', `${this.translateX}px ${this.translateY}px`)
		this.node.style.height = `${newHeight}px`

		return this
	}

	resizeBottom = (y: number) => {
		const { height, right, left, bottom } = this.node.getBoundingClientRect()
		const {
			minHeight,
			maxHeight,
			paddingTop,
			paddingBottom,
			borderTopWidth,
			borderBottomWidth,
		} = window.getComputedStyle(this.node)

		let deltaY = y - bottom
		if (deltaY === 0) return this

		for (const obstacle of this.obstacleEls) {
			const o = obstacle.getBoundingClientRect()
			// too high || too low || on the other side || unreachable with delta
			if (left > o.right || right < o.left || bottom > o.top || bottom + deltaY <= o.top)
				continue
			deltaY = Math.min(deltaY, o.top - bottom)
		}

		const borderBox =
			parseFloat(paddingTop) +
			parseFloat(paddingBottom) +
			parseFloat(borderTopWidth) +
			parseFloat(borderBottomWidth)
		const min = Math.max((parseFloat(minHeight) || 0) + borderBox, 25)
		const max = Math.min(this.boundsRect.height, +maxHeight || Infinity)
		const newHeight = clamp(height + deltaY, min, max)

		this.node.style.height = `${newHeight}px`

		return this
	}

	/**
	 * This is where all the resizing logic happens.
	 */
	onMove = (e: PointerEvent) => {
		if (!this.#activeGrabber) {
			console.error('No active grabber')
			return
		}

		const bounds = this.boundsRect

		const x = clamp(e.clientX, bounds.left, bounds.left + bounds.width) - this.clickOffset.x
		const y = clamp(e.clientY, bounds.top, bounds.top + bounds.height) - this.clickOffset.y

		const { side } = this.#activeGrabber.dataset
		this.#log(fn('onMove'), side)

		switch (side) {
			case 'top-left':
				this.resizeTop(y).resizeLeft(x)
				break
			case 'top-right':
				this.resizeTop(y).resizeRight(x)
				break
			case 'bottom-right':
				this.resizeBottom(y).resizeRight(x)
				break
			case 'bottom-left':
				this.resizeBottom(y).resizeLeft(x)
				break
			case 'top':
				this.resizeTop(y)
				break
			case 'right':
				this.resizeRight(x)
				break
			case 'bottom':
				this.resizeBottom(y)
				break
			case 'left':
				this.resizeLeft(x)
				break
		}

		this.node.dispatchEvent(new CustomEvent('resize'))

		if (this.localStorageKey) this.saveSize()

		this.onResize({
			width: this.node.offsetWidth,
			height: this.node.offsetHeight,
		})
	}

	onUp = () => {
		this.#cleanupGrabListener?.()
		document.body.classList.remove(this.classes.active)
		this.#activeGrabber?.classList.remove(this.classes.active)

		this.node.dispatchEvent(new CustomEvent('release'))
	}

	/**
	 * Creates the global stylesheet (but only once).
	 */
	generateGlobalCSS() {
		let css = /*css*/ `
			
			.resize-grabber {
				position: absolute;
				display: flex;

				padding: ${px(this.grabberSize)};

				opacity: ${this.opts.visible ? 1 : 0};
				border-radius: ${this.borderRadius} !important;
				border-radius: inherit;

				transition: opacity 0.1s;
			}
			
			.fractils-resizable:not(.fractils-grabbing) .resize-grabber:hover {
				opacity: 0.5;
			}

			.resize-grabber:active {
				opacity: 0.75;
			}
		`

		if (this.opts.cursors) {
			css += /*css*/ `
				.resize-grabbing *, .resize-grabber:active {
					cursor: grabbing !important;
				}
			`
		}

		const cursor = (v: string) =>
			!this.opts.cursors
				? ''
				: `
				cursor: ${v};`

		const offset = -this.grabberSize
		const gradient = `transparent 35%, ${this.color} 40%, ${this.color} 50%, transparent 60%, transparent 100%`
		const lengthPrcnt = 98

		if (this.sides.includes('top'))
			css += /*css*/ `
			.${this.classes.default}-top {
				${cursor('ns-resize')}
				top: ${offset}px;
				left: ${50 - lengthPrcnt * 0.5}%;

				width: ${lengthPrcnt}%;
				height: ${this.grabberSize}px;

				background: linear-gradient(to bottom, ${gradient});
			}
		`
		if (this.sides.includes('right'))
			css += /*css*/ `
			.${this.classes.default}-right {
				${cursor('ew-resize')}
				right: ${offset}px;
				top: ${50 - lengthPrcnt * 0.5}%;

				width: ${this.grabberSize}px;
				height: ${lengthPrcnt}%;

				background: linear-gradient(to left, ${gradient});
			}
		`
		if (this.sides.includes('bottom'))
			css += /*css*/ `
			.${this.classes.default}-bottom {
				${cursor('ns-resize')}
				bottom: ${offset}px;
				left: ${50 - lengthPrcnt * 0.5}%;

				width: ${lengthPrcnt}%;
				height: ${this.grabberSize}px;

				background: linear-gradient(to top, ${gradient});
			}
		`
		if (this.sides.includes('left'))
			css += /*css*/ `
				.${this.classes.default}-left {
					${cursor('ew-resize')}
					left: ${offset}px;
					top: ${50 - lengthPrcnt * 0.5}%;

					width: ${this.grabberSize}px;
					height: ${lengthPrcnt}%;

					background: linear-gradient(to right, ${gradient});
				}
			`

		css += `.fractils-grabbing .resize-grabber {cursor: default}`

		const cSize = this.#cornerGrabberSize
		const cScale = 3
		const cOffset = -6
		const cPadding = 20

		const opposites = {
			'top-left': `${100 - cPadding}% ${100 - cPadding}%`,
			'top-right': `${cPadding}% ${100 - cPadding}%`,
			'bottom-left': `${100 - cPadding}% ${cPadding}%`,
			'bottom-right': `${cPadding}% ${cPadding}%`,
		} as const

		const corner = (corner: Corner, cursorValue: string) => {
			if (!this.corners.includes(corner)) return

			const classname = `${this.classes.default}-${corner}`
			const sides = corner.replace(this.classes.default, '').split('-')

			css += `
				.${classname} {${cursor(cursorValue)}
					${sides[0]}: ${cOffset / cScale}px;
					${sides[1]}: ${cOffset / cScale}px;
					width: ${cSize}px;
					height: ${cSize}px;
				}
				.${classname}::after {
					content: '';
					scale: ${cScale};
					width: 100%;
					height: 100%;
					background: radial-gradient(farthest-corner at ${opposites[corner]}, transparent 50%, ${this.color} 100%);
					border-radius: 15%;
				}
			`
		}

		corner('top-left', 'nwse-resize')
		corner('top-right', 'nesw-resize')
		corner('bottom-left', 'nesw-resize')
		corner('bottom-right', 'nwse-resize')

		const styleEl = document.createElement('style')
		styleEl.innerHTML = css

		document.head.appendChild(styleEl)
		this.#log('Initialized global styles.')
	}

	dispose() {
		for (const cleanup of this.#listeners) {
			cleanup()
		}
		this.#cleanupGrabListener?.()
	}
}
