import type { Action } from 'svelte/action'

import { localStorageStore } from './localStorageStore'
import { debounce } from './debounce'
import { get } from 'svelte/store'
import { logger } from './logger'

/**
 * The sides of an element that can be resized by the {@link resize} action.
 */
export type Side = 'top' | 'right' | 'bottom' | 'left'

/**
 * Options for the {@link resize} action.
 */
interface ResizeOptions {
	/**
	 * To only allow resizing on certain sides, specify them here.
	 * @default ['top', 'right', 'bottom', 'left']
	 */
	sides?: Side[]
	/**
	 * The size of the resize handle in pixels.
	 * @default 3
	 */
	gutterSize?: number | string
	/**
	 * Optional callback function that runs when the element is resized.
	 * @default () => void
	 */
	onResize?: () => void
	/**
	 * Persist width in local storage.
	 * @default false
	 */
	persistent?: boolean
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

const debug = true

const log = logger('resizable', { fg: 'GreenYellow', browser: debug, deferred: false })

const px = (size: number | string) => {
	if (typeof size === 'number') return `${size}px`
	else return size
}

let globalStylesSet = false

/**
 * Makes an element resizable by dragging its edges.
 *
 * @param node - The element to make resizable.
 * @param options - {@link ResizeOptions}
 *
 * @example Basic
 * ```svelte
 * <div use:resize> Resize Me </div>
 * ```
 *
 * @example Kitchen Sink
 * ```svelte
 * <div use:resize={{
 * 	sides: ['left', 'bottom'],
 * 	gutterSize: 3,
 * 	onResize: () => console.log('resized'),
 * 	persistent: false,
 * 	visible: false,
 * 	color: 'var(--fg-d)',
 * 	borderRadius: '0.5rem',
 * }} />
 * ```
 */
export const resize: Action<HTMLElement, ResizeOptions> = (node, options) => {
	const initialStyle = getComputedStyle(node)

	let activeGrabber: HTMLElement | null = null
	let grabbing = false

	const {
		sides = ['top', 'right', 'bottom', 'left'],
		gutterSize = 3,
		onResize = () => {},
		persistent = false,
		visible = false,
		color = 'var(--fg-d, #1d1d1d)',
		borderRadius = '0.25rem',
	} = options

	const size = localStorageStore(
		'fractils::resizable::size:' + Array.from(node.classList).join('_'),
		// todo - `size` store should be { width, height } instead of just width.
		node.offsetWidth,
	)

	//? Save/Load size from local storage.

	const saveSize = debounce(() => {
		size.set(node.offsetWidth)
	}, 50)

	if (persistent) {
		node.style.width = get(size) + 'px'
	}

	//? Create global stylesheet (but only once).

	function globalStyles() {
		if (globalStylesSet) return

		let css = /*css*/ `
			.grabbing {
				cursor: grabbing !important;
			}

			.fractils-resize-grabber {
				position: absolute;
				display: flex;
				flex-grow: 1;

				padding: ${px(gutterSize)};
				
				opacity: ${visible ? 1 : 0};
				border-radius: ${borderRadius} !important;

				transition: opacity 0.15s;
			}
			
			.fractils-resize-grabber:hover {
				opacity: 0.33;
			}

			.grabbing.fractils-resize-grabber {
				opacity: 0.66;
			}
		`

		if (sides.includes('top'))
			css += /*css*/ `
			.grabber-top {
				cursor: ns-resize;
				top: 0;
				
				width: 100%;
				height: ${gutterSize}px;
				
				background: linear-gradient(to bottom, ${color} 0%, ${color} 10%, transparent 33%, transparent 100%);
			}
		`
		if (sides.includes('right'))
			css += /*css*/ `
			.grabber-right {
				cursor: ew-resize;
				right: 0;
				top: 0;
				
				width: ${gutterSize}px;
				height: 100%;
				
				background: linear-gradient(to left, ${color} 0%, ${color} 10%, transparent 33%, transparent 100%);
			}
		`
		if (sides.includes('bottom'))
			css += /*css*/ `
			.grabber-bottom {
				cursor: ns-resize;
				bottom: 0;
				
				width: 100%;
				height: ${gutterSize}px;
				
				background: linear-gradient(to top, ${color} 0%, ${color} 10%, transparent 33%, transparent 100%);
			}
		`
		if (sides.includes('left'))
			css += /*css*/ `
				.grabber-left {
					cursor: ew-resize;
					left: 0;
					top: 0;
		
					width: ${gutterSize}px;
					height: 100%;
		
					background: linear-gradient(to right, ${color} 0%, ${color} 10%, transparent 33%, transparent 100%);
				}
			`

		const styleEl = document.createElement('style')
		styleEl.innerHTML = css

		if (globalStylesSet) return
		globalStylesSet = true

		document.head.appendChild(styleEl)
		log('Applied global styles.')
	}

	globalStyles()

	//? Create resize grabbers.

	/** Stores `removeEventListener` functions for cleanup. */
	const listeners = [] as (() => void)[]

	for (const side of sides) {
		const grabber = document.createElement('div')
		grabber.classList.add('fractils-resize-grabber')
		grabber.classList.add('grabber-' + side)
		grabber.dataset.side = side
		node.appendChild(grabber)

		grabber.addEventListener('mousedown', onGrab)
		listeners.push(() => grabber.removeEventListener('mousedown', onGrab))

		grabber.addEventListener('mouseover', onMouseOver)
		listeners.push(() => grabber.removeEventListener('mouseover', onMouseOver))
	}

	function onMouseOver(e: MouseEvent) {
		if (grabbing) return
		const grabber = e.currentTarget as HTMLElement
		const { side } = grabber.dataset

		node.style.setProperty('border-' + side + '-color', color)
	}

	let cleanupGrabListener: (() => void) | null = null

	function onGrab(e: MouseEvent) {
		grabbing = true
		activeGrabber = e.currentTarget as HTMLElement

		activeGrabber.classList.add('grabbing')
		document.body.classList.add('grabbing')

		e.preventDefault()
		e.stopPropagation()

		cleanupGrabListener?.()
		document.addEventListener('mousemove', onMove)
		cleanupGrabListener = () => document.removeEventListener('mousemove', onMove)

		// This doesn't need to be cleaned up because it's a `once` listener.
		document.addEventListener('mouseup', onUp, { once: true })
	}

	/**
	 * This is where all the resizing logic happens.
	 */
	function onMove(e: MouseEvent) {
		if (!activeGrabber) {
			console.error('No active grabber')
			return
		}

		const { side } = activeGrabber.dataset

		const rect = node.getBoundingClientRect()

		switch (side) {
			case 'left': {
				node.style.width = rect.width - e.movementX + 'px'
				break
			}
			case 'right': {
				const newWidth = rect.width + e.movementX
				node.style.width = newWidth + 'px'

				const currentRight = parseFloat(node.style.right) || 0
				const newRight = currentRight + (rect.width - newWidth)
				node.style.right = newRight + 'px'
				break
			}
			case 'top': {
				const newHeight = rect.height - e.movementY
				node.style.height = newHeight + 'px'

				const currentTop = parseFloat(node.style.top) || 0
				const newTop = currentTop + (rect.height - newHeight)
				node.style.top = newTop + 'px'
				break
			}
			case 'bottom': {
				node.style.height = rect.height + e.movementY + 'px'
				break
			}
		}

		saveSize()

		onResize()
	}

	const onUp = () => {
		grabbing = false
		cleanupGrabListener?.()
		document.body.classList.remove('grabbing')
		activeGrabber?.classList.remove('grabbing')
	}

	return {
		destroy: () => {
			for (const cleanup of listeners) {
				cleanup()
			}
			cleanupGrabListener?.()
		},
	}
}
