import type { resizable } from '../actions/resizable'
import type { State } from '../utils/state'

import { debounce } from '../utils/debounce'
import { logger } from '../utils/logger'
import { state } from '../utils/state'
import { clamp } from './clamp'
import { fn, gr } from './l'

/**
 * The sides of an element that can be resized by the {@link resizable} action.
 */
export type Side = 'top' | 'right' | 'bottom' | 'left'

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
}

const RESIZABLE_DEFAULTS = {
	sides: ['top', 'right', 'bottom', 'left'],
	grabberSize: 6,
	onResize: () => {},
	localStorageKey: undefined,
	visible: false,
	color: 'var(--fg-d, #1d1d1d)',
	borderRadius: '0.25rem',
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
export class Resizable implements Omit<ResizableOptions, 'size'> {
	static initialized = false

	sides!: Side[]
	color!: string
	visible!: boolean
	borderRadius!: string
	grabberSize!: string | number
	onResize!: (size: { width: number; height: number }) => void

	size: State<{ width: number; height: number }>
	localStorageKey?: string

	#grabbing = false
	#activeGrabber: HTMLElement | null = null
	#listeners: (() => void)[] = []
	#cleanupGrabListener: (() => void) | null = null
	#useLeftInset = false

	#log: ReturnType<typeof logger>

	constructor(
		public node: HTMLElement,
		options: ResizableOptions,
	) {
		const opts = Object.assign({}, RESIZABLE_DEFAULTS, options)
		Object.assign(this, opts)

		const label = this.localStorageKey ? gr(':' + this.localStorageKey) : ''
		this.#log = logger('resizable' + label, {
			fg: 'GreenYellow',
			deferred: false,
		})
		this.#log(fn('constructor'), { opts, this: this })

		// resizable(node, options)
		if (!Resizable.initialized) {
			Resizable.initialized = true
			this.generateGlobalCSS()
		}

		const { offsetWidth: width, offsetHeight: height } = node

		this.size = state({ width, height }, { key: this.localStorageKey })

		//? Figure out if the left inset is undefined.

		const { left } = node.style
		this.#useLeftInset = !parseFloat(left)
		this.#log({ left, parsedLeft: parseFloat(left), useLeftInset: this.#useLeftInset })

		//? Load size from local storage.

		if (this.localStorageKey) {
			const { width, height } = this.size.get()
			node.style.width = width + 'px'
			node.style.height = height + 'px'
			node.dispatchEvent(new CustomEvent('resize'))
		}

		this.createGrabbers()
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
			this.node.appendChild(grabber)

			grabber.addEventListener('mousedown', this.onGrab)
			this.#listeners.push(() => grabber.removeEventListener('mousedown', this.onGrab))

			grabber.addEventListener('mouseover', this.onMouseOver)
			this.#listeners.push(() => grabber.removeEventListener('mouseover', this.onMouseOver))
		}
	}

	onMouseOver = (e: MouseEvent) => {
		if (this.#grabbing) return
		const grabber = e.currentTarget as HTMLElement
		const { side } = grabber.dataset

		this.node.style.setProperty('border-' + side + '-color', this.color)
	}

	onGrab = (e: MouseEvent) => {
		this.#grabbing = true
		this.#activeGrabber = e.currentTarget as HTMLElement

		this.#activeGrabber.classList.add('grabbing')
		document.body.classList.add('grabbing')

		e.preventDefault()
		e.stopPropagation()

		this.#cleanupGrabListener?.()
		document.addEventListener('mousemove', this.onMove)
		this.#cleanupGrabListener = () => document.removeEventListener('mousemove', this.onMove)

		// This doesn't need to be cleaned up because it's a `once` listener.
		document.addEventListener('mouseup', this.onUp, { once: true })
	}

	/**
	 * This is where all the resizing logic happens.
	 */
	onMove = (e: MouseEvent) => {
		if (!this.#activeGrabber) {
			console.error('No active grabber')
			return
		}

		const { side } = this.#activeGrabber.dataset

		const rect = this.node.getBoundingClientRect()

		const { left, minWidth, maxWidth } = window.getComputedStyle(this.node)

		switch (side) {
			case 'left': {
				const min = parseFloat(minWidth) || 0
				const max = parseFloat(maxWidth) || Infinity
				const newWidth = clamp(rect.width - e.movementX, min, max)

				this.node.style.width = newWidth + 'px'

				// If the left inset is undefined, then the left position will
				// be set to the new left value to keep the element in place.
				if (this.#useLeftInset) {
					const currentLeft = parseFloat(left) || 0
					const newLeft = currentLeft + (rect.width - newWidth)
					this.node.style.left = newLeft + 'px'
				}
				break
			}
			case 'right': {
				const newWidth = rect.width + e.movementX
				this.node.style.width = newWidth + 'px'

				const currentRight = parseFloat(this.node.style.right) || 0
				const newRight = currentRight + (rect.width - newWidth)
				this.node.style.right = newRight + 'px'
				break
			}
			case 'top': {
				const newHeight = rect.height - e.movementY
				this.node.style.height = newHeight + 'px'

				const currentTop = parseFloat(this.node.style.top) || 0
				const newTop = currentTop + (rect.height - newHeight)
				this.node.style.top = newTop + 'px'
				break
			}
			case 'bottom': {
				this.node.style.height = rect.height + e.movementY + 'px'
				break
			}
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

	//? Create global stylesheet (but only once).

	generateGlobalCSS() {
		let css = /*css*/ `
			.grabbing * {
				cursor: grabbing !important;
			}

			.fractils-resize-grabber {
				position: absolute;
				display: flex;
				/* flex-grow: 1; */

				padding: ${px(this.grabberSize)};
				
				opacity: ${this.visible ? 1 : 0};
				border-radius: ${this.borderRadius} !important;

				transition: opacity 0.15s;
			}
			
			.fractils-resize-grabber:hover {
				opacity: 0.33;
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

		const styleEl = document.createElement('style')
		styleEl.innerHTML = css

		document.head.appendChild(styleEl)
		this.#log('Initialized global styles.')
	}

	destroy() {
		for (const cleanup of this.#listeners) {
			cleanup()
		}
		this.#cleanupGrabListener?.()
	}
}
