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
	sides?: Side[]

	/**
	 * To only allow resizing on certain corners, specify them here.
	 * @default ['top-left', 'top-right', 'bottom-right', 'bottom-left']
	 */
	corners?: ('top-left' | 'top-right' | 'bottom-right' | 'bottom-left')[]

	/**
	 * The size of the resize handle in pixels.
	 * @default 3
	 */
	grabberSize?: number | string

	/**
	 * Optional callback function that runs when the element is resized.
	 * @default () => void
	 */
	onResize?: (size: { width: number; height: number }) => void

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
	visible?: boolean

	/**
	 * Gutter css color (if visible = `true`)
	 * @default 'var(--fg-d, #1d1d1d)'
	 */
	color?: string

	/**
	 * Border radius of the element.
	 * @default '0.5rem'
	 */
	borderRadius?: string

	/**
	 * The element to use as the bounds for resizing.
	 * @default window['document']['documentElement']
	 */
	bounds?: HTMLElement | (string & {})

	/**
	 * Element's or selectors which will act as collision obstacles for the draggable element.
	 */
	obstacles?: ElementsOrSelectors
}

const RESIZABLE_DEFAULTS = {
	sides: ['top', 'right', 'bottom', 'left'],
	corners: ['top-left', 'top-right', 'bottom-right', 'bottom-left'],
	grabberSize: 6,
	onResize: () => {},
	localStorageKey: undefined,
	visible: false,
	color: 'var(--fg-d, #1d1d1d)',
	borderRadius: '0.25rem',
	obstacles: undefined,
} as const satisfies ResizableOptions

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

	sides!: Side[]
	corners!: Corner[]
	color!: string
	visible!: boolean
	borderRadius!: string
	grabberSize!: string | number
	onResize!: (size: { width: number; height: number }) => void
	bounds: HTMLElement
	obstacleEls: HTMLElement[]

	size: State<{ width: number; height: number }>
	localStorageKey?: string

	#grabbing = false
	#activeGrabber: HTMLElement | null = null
	#listeners: (() => void)[] = []
	#cleanupGrabListener: (() => void) | null = null
	#useLeftInset = false
	#cornerGrabberSize: number

	#log: ReturnType<typeof logger>

	constructor(
		public node: HTMLElement,
		options?: ResizableOptions,
	) {
		const opts = Object.assign({}, RESIZABLE_DEFAULTS, options)
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

		const { left } = node.style
		this.#useLeftInset = typeof parseFloat(left) !== 'number' && !isNaN(parseFloat(left))

		//? Load size from local storage.
		if (this.localStorageKey) {
			const { width, height } = this.size.get()
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
		for (const side of this.sides) {
			const grabber = document.createElement('div')
			grabber.classList.add('fractils-resize-grabber')
			grabber.classList.add('grabber-' + side)
			grabber.dataset.side = side
			grabber.style.setProperty('opacity', this.opts.visible ? '1' : '0')
			this.node.appendChild(grabber)

			grabber.addEventListener('pointerdown', this.onGrab)
			this.#listeners.push(() => grabber.removeEventListener('pointerdown', this.onGrab))
		}

		for (const corner of this.corners) {
			const grabber = document.createElement('div')
			grabber.classList.add('fractils-resize-grabber')
			grabber.classList.add('grabber-' + corner)
			grabber.dataset.side = corner
			this.node.appendChild(grabber)

			grabber.addEventListener('pointerdown', this.onGrab)
			this.#listeners.push(() => grabber.removeEventListener('pointerdown', this.onGrab))
		}
	}

	onGrab = (e: PointerEvent) => {
		this.#grabbing = true
		this.#activeGrabber = e.currentTarget as HTMLElement

		this.#activeGrabber.classList.add('grabbing')
		document.body.classList.add('grabbing')

		e.preventDefault()
		e.stopPropagation()

		this.#cleanupGrabListener?.()
		document.addEventListener('pointermove', this.onMove)
		this.#cleanupGrabListener = () => document.removeEventListener('pointermove', this.onMove)

		// This doesn't need to be cleaned up because it's a `once` listener.
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
		const { minWidth, maxWidth } = window.getComputedStyle(this.node)

		let deltaX = x - left
		if (deltaX === 0) return this

		for (const obstacle of this.obstacleEls) {
			const o = obstacle.getBoundingClientRect()
			// too high || too low || on the other side || unreachable with delta
			if (top > o.bottom || bottom < o.top || left < o.right || left + deltaX >= o.right)
				continue
			deltaX = Math.max(deltaX, o.right - left)
		}
		const min = +minWidth || 25
		const max = Math.min(this.boundsRect.width, +maxWidth || Infinity)
		const newWidth = clamp(width - deltaX, min, max)
		if (newWidth === min) deltaX = width - newWidth
		this.translateX += deltaX

		this.node.style.setProperty('translate', `${this.translateX}px ${this.translateY}px`)
		this.node.style.width = `${newWidth}px`

		return this
	}

	resizeRight = (x: number) => {
		const { width, top, right, bottom } = this.node.getBoundingClientRect()
		const { minWidth, maxWidth } = window.getComputedStyle(this.node)

		let deltaX = x - right
		if (deltaX === 0) return this

		for (const obstacle of this.obstacleEls) {
			const o = obstacle.getBoundingClientRect()
			// too high || too low || already passed || unreachable with delta
			if (top > o.bottom || bottom < o.top || right > o.left || right + deltaX <= o.left)
				continue
			deltaX = Math.min(deltaX, o.left - right)
		}
		const min = +minWidth || 25
		const max = Math.min(this.boundsRect.width, +maxWidth || Infinity)
		const newWidth = clamp(width + deltaX, min, max)

		this.node.style.width = `${newWidth}px`

		return this
	}

	resizeTop = (y: number) => {
		const { height, top, right, left } = this.node.getBoundingClientRect()
		const { minHeight, maxHeight } = window.getComputedStyle(this.node)

		let deltaY = y - top
		if (deltaY === 0) return this

		for (const obstacle of this.obstacleEls) {
			const o = obstacle.getBoundingClientRect()
			// too high || too low || on the other side || unreachable with delta
			if (left > o.right || right < o.left || top < o.bottom || top + deltaY >= o.bottom)
				continue
			deltaY = Math.max(deltaY, o.bottom - top)
		}
		const min = +minHeight || 25
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
		const { minHeight, maxHeight } = window.getComputedStyle(this.node)

		let deltaY = y - bottom
		if (deltaY === 0) return this

		for (const obstacle of this.obstacleEls) {
			const o = obstacle.getBoundingClientRect()
			// too high || too low || on the other side || unreachable with delta
			if (left > o.right || right < o.left || bottom > o.top || bottom + deltaY <= o.top)
				continue
			deltaY = Math.min(deltaY, o.top - bottom)
		}
		const min = +minHeight || 25
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

		const x = clamp(e.clientX, bounds.left, bounds.left + bounds.width)
		const y = clamp(e.clientY, bounds.top, bounds.top + bounds.height)

		const { side } = this.#activeGrabber.dataset
		this.#log(fn('onMove'), side)

		switch (side) {
			case 'top-left':
				this.resizeTop(y)
				this.resizeLeft(x)
				break

			case 'top-right':
				this.resizeTop(y)
				this.resizeRight(x)
				break

			case 'bottom-right':
				this.resizeBottom(y)
				this.resizeRight(x)
				break

			case 'bottom-left':
				this.resizeBottom(y)
				this.resizeLeft(x)
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
		this.#grabbing = false
		this.#cleanupGrabListener?.()
		document.body.classList.remove('grabbing')
		this.#activeGrabber?.classList.remove('grabbing')
	}

	/**
	 * Creates the global stylesheet (but only once).
	 */
	generateGlobalCSS() {
		let css = /*css*/ `
			.grabbing * {
				cursor: grabbing !important;
			}

			.fractils-resize-grabber {
				position: absolute;
				display: flex;

				padding: ${px(this.grabberSize)};
				
				border-radius: ${this.borderRadius} !important;

				transition: opacity 0.15s;
			}
			
			.fractils-resize-grabber:hover {
				opacity: 0.33 !important;
			}

			.grabbing.fractils-resize-grabber {
				opacity: 0.66;
			}
		`

		if (this.sides.includes('top'))
			css += /*css*/ `
			.grabber-top {
				cursor: ns-resize;
				top: 0;
				left: 0;

				width: 100%;
				height: ${this.grabberSize}px;

				background: linear-gradient(to bottom, ${this.color} 0%, ${this.color} 10%, transparent 33%, transparent 100%);
			}
		`
		if (this.sides.includes('right'))
			css += /*css*/ `
			.grabber-right {
				cursor: ew-resize;
				right: 0;
				top: 0;

				width: ${this.grabberSize}px;
				height: 100%;

				background: linear-gradient(to left, ${this.color} 0%, ${this.color} 10%, transparent 33%, transparent 100%);
			}
		`
		if (this.sides.includes('bottom'))
			css += /*css*/ `
			.grabber-bottom {
				cursor: ns-resize;
				bottom: 0;
				left: 0;

				width: 100%;
				height: ${this.grabberSize}px;

				background: linear-gradient(to top, ${this.color} 0%, ${this.color} 10%, transparent 33%, transparent 100%);
			}
		`
		if (this.sides.includes('left'))
			css += /*css*/ `
				.grabber-left {
					cursor: ew-resize;
					left: 0;
					top: 0;

					width: ${this.grabberSize}px;
					height: 100%;

					background: linear-gradient(to right, ${this.color} 0%, ${this.color} 10%, transparent 33%, transparent 100%);
				}
			`

		const cSize = this.#cornerGrabberSize * 2
		const cOffset = -2

		if (this.corners.includes('top-left')) {
			css += /*css*/ `
				.grabber-top-left {
					cursor: nwse-resize;
					top: ${cOffset}px;
					left: ${cOffset}px;

					width: ${cSize}px;
					height: ${cSize}px;

					background: linear-gradient(to bottom right, ${this.color} 0%, ${this.color} 10%, transparent 33%, transparent 100%);
				}
			`
		}
		if (this.corners.includes('top-right')) {
			css += /*css*/ `
				.grabber-top-right {
					cursor: nesw-resize;
					top: ${cOffset}px;
					right: ${cOffset}px;

					width: ${cSize}px;
					height: ${cSize}px;

					background: linear-gradient(to bottom left, ${this.color} 0%, ${this.color} 10%, transparent 33%, transparent 100%);
				}
			`
		}
		if (this.corners.includes('bottom-left')) {
			css += /*css*/ `
				.grabber-bottom-left {
					cursor: nesw-resize;
					bottom: ${cOffset}px;
					left: ${cOffset}px;

					width: ${cSize}px;
					height: ${cSize}px;

					background: linear-gradient(to top right, ${this.color} 0%, ${this.color} 10%, transparent 33%, transparent 100%);
				}
			`
		}
		if (this.corners.includes('bottom-right')) {
			css += /*css*/ `
				.grabber-bottom-right {
					cursor: nwse-resize;
					bottom: ${cOffset}px;
					right: ${cOffset}px;

					width: ${cSize}px;
					height: ${cSize}px;

					background: linear-gradient(to top left, ${this.color} 0%, ${this.color} 10%, transparent 33%, transparent 100%);
				}
			`
		}

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
