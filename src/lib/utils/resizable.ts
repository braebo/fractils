import type { CSSLength } from './types'

import { localStorageStore } from './localStorageStore'
import { debounce } from './debounce'
import { get } from 'svelte/store'
import { logger } from './logger'
import { clamp } from './clamp'
import { getPx } from './getPx'
import { r, y, gr } from './l'
import type { Action } from 'svelte/action'

type Side = 'left' | 'right' | 'top' | 'bottom'

interface ResizeOptions {
	/**
	 * The side of the element to make draggable.  If not specified, all sides will be draggable.
	 * @default []
	 */
	sides?: Side[]
	/**
	 * The size of the resize handle in pixels.
	 * @default '5px'
	 */
	gutterSize?: number | string
	/**
	 * Minimum width in `px`, `rem`, `vw`, or `vh`.
	 * @default '100px'
	 */
	minWidth?: CSSLength
	/**
	 * Maximum width in `px`, `rem`, `vw`, or `vh`.
	 * @default '75vw'
	 */
	maxWidth?: CSSLength
	/**
	 * Minimum height in `px`, `rem`, `vw`, or `vh`.
	 * @default initial
	 */
	minHeight?: CSSLength
	/**
	 * Maximum height in `px`, `rem`, `vw`, or `vh`.
	 * @default initial*2
	 */
	maxHeight?: CSSLength
	onResize?: () => void
	/**
	 * Use a visible or invisible gutter.
	 * @default false
	 */
	visible?: boolean
	/**
	 * Gutter css color (if visible = `true`)
	 * @default '#1d1d1d'
	 */
	color?: string
	/**
	 * Persist width in local storage.
	 * @default false
	 */
	persistent?: boolean
	/**
	 * Border radius of the element.
	 * @default '0.25rem'
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

export const resize: Action<HTMLElement, ResizeOptions> = (node, options) => {
	const initialStyle = getComputedStyle(node)

	if (initialStyle.position.match(/absolute|fixed/)) {
		log(
			y('WARNING: node.style.position: ') + r(initialStyle.position),
			'\n\tNote that ' +
				gr('right') +
				' and ' +
				gr('top') +
				' resizing requires ' +
				gr('absolute') +
				' or ' +
				gr('fixed') +
				' positioning.',
			{ node, options, initialStyle },
		)
	}

	let activeGrabber: HTMLElement | null = null
	let grabbing = false

	const initialHeight = initialStyle.height as CSSLength

	const {
		// sides = [],
		sides = ['right', 'top', 'bottom'],
		gutterSize = 3,
		minWidth = '15px',
		maxWidth = '75vw',
		minHeight = initialHeight,
		maxHeight = (getPx(initialHeight) * 2 + 'px') as CSSLength,
		onResize = () => {},
		persistent = false,
		visible = false,
		// color = '#1d1d1d',
		color = 'var(--fg-d)',
		borderRadius = '0.5rem',
	} = options

	const size = localStorageStore(
		'fractils::resizable::size:' + node.id || Array.from(node.classList).join('_'),
		'300px',
	)

	const updateSize = debounce(() => {
		size.set(node.offsetWidth + 'px')
	}, 50)

	let maxW = 0
	let minW = 0
	let maxH = 0
	let minH = 0

	function updateClamps() {
		maxW = getPx(maxWidth, node.offsetParent?.clientWidth)
		minW = getPx(minWidth, node.offsetParent?.clientWidth)
		maxH = getPx(maxHeight, node.offsetParent?.clientHeight)
		minH = getPx(minHeight, node.offsetParent?.clientHeight)
	}

	updateClamps()

	node.style.width = clamp(getPx(initialStyle.width as CSSLength), minW, maxW) + 'px'
	node.style.height = clamp(getPx(initialStyle.height as CSSLength), minH, maxH) + 'px'

	log({
		initialHeight,
		initial: {
			maxWidth,
			minWidth,
			maxHeight,
			minHeight,
		},
		parsed: {
			maxW,
			minW,
			maxH,
			minH,
		},
	})

	// node.style.height = clampSize(parseFloat(initialStyle.height)) + 'px'
	// node.style.outline = '1px solid transparent'

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

	function createGrabber(side: Side) {
		if (!sides.includes(side)) return

		const grabber = document.createElement('div')
		grabber.classList.add('fractils-resize-grabber')
		grabber.classList.add('grabber-' + side)
		grabber.dataset.side = side
		node.appendChild(grabber)

		grabber.addEventListener('mousedown', onGrab)
		grabber.addEventListener('mouseover', onMouseOver)

		return grabber
	}

	const grabbers = {
		left: createGrabber('left'),
		right: createGrabber('right'),
		top: createGrabber('top'),
		bottom: createGrabber('bottom'),
	}

	if (persistent) {
		const persistentSize = get(size)
		node.style.width = persistentSize
	}

	function onMouseOver(e: MouseEvent) {
		if (grabbing) return
		const grabber = e.currentTarget as HTMLElement
		const { side } = grabber.dataset

		node.style.setProperty('border-' + side + '-color', color)
	}

	function onGrab(e: MouseEvent) {
		grabbing = true
		activeGrabber = e.currentTarget as HTMLElement

		activeGrabber.classList.add('grabbing')
		document.body.classList.add('grabbing')

		e.preventDefault()
		e.stopPropagation()

		document.addEventListener('mousemove', onMove)
		document.addEventListener('mouseup', onUp, { once: true })
	}

	function onMove(e: MouseEvent) {
		if (!activeGrabber) {
			console.error('No active grabber')
			return
		}

		updateClamps()

		const { side } = activeGrabber.dataset

		const rect = node.getBoundingClientRect()

		const { clientX } = e
		const { clientY } = e

		// const newWidth = right - clientX - 16
		// const newHeight = bottom - clientY

		switch (side) {
			case 'left': {
				node.style.width =
					clamp(rect.right - clientX, getPx(minWidth), getPx(maxWidth)) + 'px'
				break
			}
			case 'right': {
				const newWidth = clamp(clientX - rect.left, getPx(minWidth), getPx(maxWidth))
				node.style.width = newWidth + 'px'

				//? We need to offset the node's right position by the
				//? difference between the new width and the old width.
				const currentRight = parseFloat(node.style.right) || 0
				const newRight = currentRight + (rect.width - newWidth)
				node.style.right = newRight + 'px'
				break
			}
			case 'top': {
				const newHeight = clamp(rect.bottom - clientY, getPx(minHeight), getPx(maxHeight))
				node.style.height = newHeight + 'px'

				//? We need to offset the node's top position by the
				//? difference between the new height and the old height.
				const currentTop = parseFloat(node.style.top) || 0
				const newTop = currentTop + (rect.height - newHeight)
				node.style.top = newTop + 'px'
				break
			}
			case 'bottom': {
				node.style.height =
					clamp(clientY - rect.top, getPx(minHeight), getPx(maxHeight)) + 'px'
				break
			}
			default:
				throw new Error('Invalid side: ' + side)
		}

		onResize()

		updateSize()
	}

	// function clampSize(size: number) {
	// 	if (size < minWidthPx) return minWidthPx
	// 	if (maxWidthPx && size > maxWidthPx) return maxWidthPx
	// 	return size
	// }

	const onUp = () => {
		grabbing = false
		document.removeEventListener('mousemove', onMove)
		//? Remove the global cursor.
		document.body.classList.remove('grabbing')
		activeGrabber?.classList.remove('grabbing')
	}

	document.addEventListener('mouseup', onUp)

	// updateHeight()

	return {
		destroy: () => {
			document.removeEventListener('mousemove', onMove)
			document.removeEventListener('mouseup', onUp)

			grabbers.top?.removeEventListener('mousedown', onGrab)
			grabbers.right?.removeEventListener('mousedown', onGrab)
			grabbers.bottom?.removeEventListener('mousedown', onGrab)
			grabbers.left?.removeEventListener('mousedown', onGrab)
		},
	}
}
