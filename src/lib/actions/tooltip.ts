import type { ElementStyle } from '../color/css'

import { deepMerge } from '../utils/deepMerge'
import { trimCss } from '../utils/trimCss'
import { entries } from '../utils/object'
import { create } from '../utils/create'
import { DEV } from 'esm-env'

type Selector = `#${string}` | `.${string}`
type Anchor = Element | Selector | 'mouse' | 'node' | null
type Anchors = { x: Anchor; y: Anchor }
type AnchorRect = DOMRect | { left: number; top: number; width: number; height: number }

export interface TooltipOptions {
	/**
	 * The text to display in the tooltip.  Can be a string, number, or a function that returns a string or number.
	 */
	text: string | number | (() => string | number)
	/**
	 * The placement of the tooltip relative to the element.  Can be `'top'`, `'bottom'`, `'left'`, or `'right'`.
	 */
	placement?: 'top' | 'bottom' | 'left' | 'right'
	/**
	 * The element to which the tooltip is placed relative to.  Can be a selector,
	 * an element, or the string literal `'mouse'` to use the pointer position.
	 *
	 * Can also be an object with unique `x` and `y` anchors for each axis.
	 *
	 * By default, the node that the tooltip is attached to will be used as the anchor.
	 *
	 * @example { x: 'mouse', y: undefined }
	 */
	anchor?: Anchor | Anchors
	/**
	 * Delay in milliseconds before the tooltip is shown.
	 * @default 250
	 */
	delay?: number
	/**
	 * Delay in milliseconds before the tooltip is hidden.
	 * @default 0
	 */
	delayOut?: number
	/**
	 * An optional x-axis offset in pixels.
	 * @default 0
	 */
	offsetX?: number
	/**
	 * An optional y-axis offset in pixels.
	 * @default 0
	 */
	offsetY?: number
	/**
	 * Custom style overrides for the tooltip element (all valid CSS properties are allowed).
	 * @default { padding: '4px 8px', color: 'var(--fg-a, #fff)', backgroundColor: 'var(--bg-a, #000)', borderRadius: 'var(--radius-sm, 4px)', fontSize: 'var(--font-size-sm, 12px)', minWidth: '3rem', maxWidth: 'auto', minHeight: 'auto', maxHeight: 'auto', textAlign: 'center' }
	 */
	styles?: Partial<Record<ElementStyle, string>>
	/**
	 * Animation in/out duration times / easing.
	 */
	animation?: {
		/**
		 * The tooltip reveal animation duration in ms.
		 * @default 300
		 */
		duration?: KeyframeAnimationOptions['duration']
		/**
		 * The tooltip hide animation duration in ms.
		 * @default 150
		 */
		durationOut?: KeyframeAnimationOptions['duration']
		/**
		 * The tooltip reveal and hide animation easing.
		 * @default 'cubic-bezier(0.23, 1, 0.320, 1)'
		 */
		easing?: KeyframeAnimationOptions['easing']
	}

	/**
	 * If specified, the container element for the tooltip.
	 * @default document.body
	 */
	container?: Element | Document
}

const TOOLTIP_DEFAULTS: TooltipOptions = {
	text: '',
	placement: 'top',
	anchor: 'node',
	delay: 250,
	delayOut: 0,
	offsetX: 0,
	offsetY: 0,
	styles: {
		padding: '4px 8px',
		color: 'var(--fg-a, #fff)',
		backgroundColor: 'var(--bg-a, #000)',
		borderRadius: 'var(--radius-sm, 4px)',
		fontSize: 'var(--font-size-sm, 12px)',
		minWidth: '3rem',
		maxWidth: 'auto',
		minHeight: 'auto',
		maxHeight: 'auto',
		textAlign: 'center',
	},
	animation: {
		duration: 300,
		durationOut: 150,
		easing: 'cubic-bezier(0.23, 1, 0.320, 1)',
	},
}

export class Tooltip {
	opts: TooltipOptions

	/** The node that the tooltip is attached to. */
	node: HTMLElement
	/** The tooltip element itself. */
	element: HTMLDivElement
	/** Whether the tooltip is currently showing. */
	showing = false

	#delayInTimer!: ReturnType<typeof setTimeout>
	#delayOutTimer!: ReturnType<typeof setTimeout>

	constructor(node: HTMLElement, options?: TooltipOptions) {
		this.node = node

		const opts = deepMerge(TOOLTIP_DEFAULTS, options)
		this.opts = opts

		this.getText =
			typeof this.opts.text === 'function'
				? (this.opts.text as () => string | number)
				: ((() => this.opts.text) as () => string | number)

		this.element = create('div', {
			classes: ['fractils-tooltip'],
			parent: options?.container ?? document.getElementById('svelte') ?? document.body,
			innerText: String(this.getText()),
			cssText: trimCss(/*css*/ `{
				position: absolute;
				opacity: 0;
				pointer-events: none;
				transition: opacity 0.1s;
				z-index: 1000;
			}`),
		})

		for (const [key, value] of entries(this.opts.styles!)) {
			if (key && value) {
				this.element.style[key] = value
			}
		}

		this.listen(node, 'pointerenter', this.show)
		this.listen(node, 'pointerleave', this.hide)
		this.listen(node, 'pointermove', this.updatePosition)
	}

	getText: () => string | number
	get text() {
		return this.getText()
	}
	set text(text: string | number) {
		this.getText = () => text
		this.element.innerText = String(text)
	}

	#listeners = new Set<() => void>()
	listen = (node: HTMLElement, event: string, cb: (...args: any[]) => void) => {
		node.addEventListener(event, cb)
		this.#listeners.add(() => this.node.removeEventListener(event, cb))
	}

	show = (delay = this.opts.delay) => {
		if (this.showing) return
		clearTimeout(this.#delayInTimer)
		clearTimeout(this.#delayOutTimer)

		this.#delayInTimer = setTimeout(() => {
			this.showing = true
			this.element.animate(
				[
					{ opacity: '0', transform: 'translateY(4px)' },
					{ opacity: '1', transform: 'translateY(0)' },
				],
				{
					duration: this.opts.animation!.duration,
					easing: this.opts.animation!.easing,
					fill: 'forwards',
				},
			)
		}, delay)
	}

	hide = () => {
		clearTimeout(this.#delayInTimer)
		clearTimeout(this.#delayOutTimer)

		this.#delayOutTimer = setTimeout(() => {
			if (this.showing) {
				this.showing = false
				this.element.animate(
					[
						{ opacity: '1', transform: 'translateY(0)' },
						{ opacity: '0', transform: 'translateY(4px)' },
					],
					{
						duration: this.opts.animation!.durationOut,
						easing: this.opts.animation!.easing,
						fill: 'forwards',
					},
				)
			}
		}, this.opts.delayOut)
	}

	updatePosition = (e: PointerEvent) => {
		const tooltipRect = this.element.getBoundingClientRect()

		this.element.innerText = String(this.getText())

		const anchor = this.getAnchorRects(e)

		let left = 0
		let top = 0

		const baseOffset = 4

		this.element.classList.add('fractils-tooltip-' + this.opts.placement)

		switch (this.opts.placement) {
			case 'top':
				left = anchor.x.left + window.scrollX + anchor.x.width / 2 - tooltipRect.width / 2
				top = anchor.y.top + window.scrollY - tooltipRect.height - baseOffset
				break
			case 'bottom':
				left = anchor.x.left + window.scrollX + anchor.x.width / 2 - tooltipRect.width / 2
				top = anchor.y.top + window.scrollY + anchor.y.height + baseOffset
				break
			case 'left':
				left = anchor.x.left + window.scrollX - tooltipRect.width - baseOffset
				top = anchor.y.top + window.scrollY + anchor.y.height / 2 - tooltipRect.height / 2
				break
			case 'right':
				left = anchor.x.left + window.scrollX + anchor.x.width + baseOffset
				top = anchor.y.top + window.scrollY + anchor.y.height / 2 - tooltipRect.height / 2
				break
		}

		this.element.style.left = `${left + this.opts.offsetX!}px`
		this.element.style.top = `${top + this.opts.offsetY!}px`
	}

	getAnchorRects = (
		e: PointerEvent,
	): {
		x: AnchorRect
		y: AnchorRect
	} => {
		const getRect = <Alt extends string = never>(
			anchor: TooltipOptions['anchor'],
		): AnchorRect | Alt => {
			if (!anchor) return this.node.getBoundingClientRect()

			switch (typeof anchor) {
				case 'string': {
					switch (anchor) {
						case 'node': {
							return this.node.getBoundingClientRect()
						}
						case 'mouse': {
							return {
								left: e.clientX + window.scrollX,
								top: e.clientY + window.scrollY,
								width: 0,
								height: 0,
							}
						}
						default: {
							const el = document.querySelector(anchor)

							if (el) {
								return el.getBoundingClientRect()
							} else {
								console.error('Tooltip anchor not found:', anchor)
								return this.node.getBoundingClientRect()
							}
						}
					}
				}
				case 'object': {
					// Unique x and y anchors.
					if (anchor && 'x' in anchor && 'y' in anchor) {
						return 'separate' as Alt
					} else if (anchor instanceof HTMLElement) {
						return anchor.getBoundingClientRect()
					}
				}
				default: {
					if (DEV) console.warn('Invalid tooltip anchor:', anchor)
					return this.node.getBoundingClientRect()
				}
			}
		}

		const rect = getRect<'separate'>(this.opts.anchor)

		if (rect === 'separate') {
			const x = getRect((this.opts.anchor as Anchors).x)
			const y = getRect((this.opts.anchor as Anchors).y)

			return { x, y }
		}

		return { x: rect, y: rect }
	}

	dispose() {
		for (const removeCb of this.#listeners) {
			removeCb()
		}
		this.element.remove()
	}
}

export const tooltip = (node: HTMLElement, options?: TooltipOptions) => {
	const tt = new Tooltip(node, options)

	return {
		destroy() {
			tt.dispose()
		},
	}
}
