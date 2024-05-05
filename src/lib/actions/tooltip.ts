import type { JavascriptStyleProperty } from '../css/types'
import type { ElementOrSelector } from '../utils/select'

import { EventManager } from '../utils/EventManager'
import { deepMerge } from '../utils/deepMerge'
import { styled } from '../decorators/styled'
import { tickLoop } from '../utils/loopTick'
import { entries } from '../utils/object'
import { create } from '../utils/create'
import { DEV } from 'esm-env'

type Selector = `#${string}` | `.${string}`
type Anchor = Element | Selector | 'mouse' | 'node' | null
type Anchors = { x: Anchor; y: Anchor }
type AnchorRect = DOMRect | { left: number; top: number; width: number; height: number }

/**
 * Options for the tooltip.
 */
export interface TooltipOptions {
	/**
	 * The text to display in the tooltip.  Can be a string, number, or a function that returns a string or number.
	 */
	text: string | (() => string)
	/**
	 * The placement of the tooltip relative to the element.  Can be `'top'`, `'bottom'`, `'left'`, or `'right'`.
	 */
	placement: 'top' | 'bottom' | 'left' | 'right'
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
	anchor: Anchor | Anchors
	/**
	 * Delay in milliseconds before the tooltip is shown.
	 * @defaultValue 250
	 */
	delay: number
	/**
	 * Delay in milliseconds before the tooltip is hidden.
	 * @defaultValue 0
	 */
	delayOut: number
	/**
	 * An optional x-axis offset (any valid css unit).
	 * @defaultValue '0%'
	 */
	offsetX: string
	/**
	 * An optional y-axis offset (any valid css unit).
	 * @defaultValue '0%'
	 */
	offsetY: string
	/**
	 * Custom style overrides for the tooltip element (all valid CSS properties are allowed).
	 * i.e. { padding: '4px 8px', color: 'var(--fg-a, #fff)' }
	 * @defaultValue undefined
	 */
	styles?: Partial<Record<JavascriptStyleProperty, string>>
	/**
	 * Animation in/out duration times / easing.
	 */
	animation: {
		/**
		 * The tooltip reveal animation duration in ms.
		 * @defaultValue 300
		 */
		duration: KeyframeAnimationOptions['duration']
		/**
		 * The tooltip hide animation duration in ms.
		 * @defaultValue 150
		 */
		durationOut: KeyframeAnimationOptions['duration']
		/**
		 * The tooltip reveal and hide animation easing.
		 * @defaultValue 'cubic-bezier(0.23, 1, 0.320, 1)'
		 */
		easing: KeyframeAnimationOptions['easing']
	}
	/**
	 * If specified, the container element for the tooltip.
	 * @defaultValue document.body
	 */
	parent?: HTMLElement
	/**
	 * Hides the tooltip on click if `true`.
	 * @defaultValue false
	 */
	hideOnClick: boolean
}

export const TOOLTIP_DEFAULTS: TooltipOptions = {
	text: '',
	placement: 'top',
	anchor: 'node',
	delay: 250,
	delayOut: 0,
	offsetX: '0%',
	offsetY: '0%',
	styles: {},
	animation: {
		duration: 300,
		durationOut: 150,
		easing: 'cubic-bezier(0.23, 1, 0.320, 1)',
	},
	hideOnClick: false,
}

@styled
export class Tooltip {
	/** The tooltip element itself. */
	element: HTMLDivElement
	/** The parent element of the tooltip. */
	parent: HTMLElement
	/** Whether the tooltip is currently showing. */
	showing = false

	opts: TooltipOptions

	#animPositions!: { from: string; to: string }

	#delayInTimer!: ReturnType<typeof setTimeout>
	#delayOutTimer!: ReturnType<typeof setTimeout>

	#evm = new EventManager()
	/** removeEventListener callbacks for listeners with particularly short lifecycles. */
	#tempListeners = new Set<() => void>()

	constructor(
		/** The node that the tooltip is attached to. */
		public node: HTMLElement,
		options?: Partial<TooltipOptions>,
	) {
		const opts = deepMerge([TOOLTIP_DEFAULTS, options])
		this.opts = opts

		this.placement = opts.placement

		this.getText =
			typeof this.opts.text === 'function'
				? (this.opts.text as () => string)
				: ((() => this.opts.text) as () => string)

		this.parent = options?.parent ?? document.getElementById('svelte') ?? document.body

		this.element = create('div', {
			classes: ['fractils-tooltip'],
			innerHTML: String(this.getText()),
			// styles: this.opts.styles,
			styles: options?.styles,
		})

		for (const [key, value] of entries(opts.styles!)) {
			if (key && value) {
				this.element.style.setProperty(key, value)
			}
		}

		this.#evm.listen(node, 'pointerenter', this.show.bind(this))
		this.#evm.listen(node, 'pointerleave', this.hide.bind(this))
		this.#evm.listen(node, 'pointermove', this.updatePosition.bind(this))
		this.#evm.listen(node, 'click', () => {
			if (opts.hideOnClick) this.hide()
			else this.refresh()
		})
	}

	refresh() {
		this.text = this.text
		setTimeout(() => this.updatePosition(), 0)
		this.#maybeWatchAnchor()
		clearTimeout(this.#delayInTimer)
		clearTimeout(this.#delayOutTimer)
	}

	getText: () => string
	/**
	 * The text to display in the tooltip.  Assigning a new value will update the tooltip text.
	 */
	get text() {
		return this.getText()
	}
	set text(text: string) {
		this.element.innerHTML = String(text)
	}

	get placement() {
		return this.opts.placement
	}
	set placement(v) {
		this.opts.placement = v
		switch (v) {
			case 'top':
				this.#animPositions = { from: 'translateY(4px)', to: 'translateY(0)' }
				break
			case 'bottom':
				this.#animPositions = { from: 'translateY(-4px)', to: 'translateY(0)' }
				break
			case 'left':
				this.#animPositions = { from: 'translateX(4px)', to: 'translateX(0)' }
				break
			case 'right':
				this.#animPositions = { from: 'translateX(-4px)', to: 'translateX(0)' }
		}
	}

	get offsetX() {
		return this.opts.offsetX!
	}
	set offsetX(v) {
		this.opts.offsetX = v
		this.updatePosition()
	}

	get offsetY() {
		return this.opts.offsetY!
	}
	set offsetY(v) {
		this.opts.offsetY = v
		this.updatePosition()
	}

	show() {
		if (this.showing) return
		clearTimeout(this.#delayInTimer)
		clearTimeout(this.#delayOutTimer)

		this.#delayInTimer = setTimeout(async () => {
			this.parent.appendChild(this.element)
			this.showing = true
			this.element.animate(
				[
					{ opacity: '0', transform: this.#animPositions.from },
					{ opacity: '1', transform: this.#animPositions.to },
				],
				{
					duration: this.opts.animation!.duration,
					easing: this.opts.animation!.easing,
					fill: 'forwards',
				},
			)
			this.updatePosition()
			this.#maybeWatchAnchor()
		}, this.opts.delay)
	}

	hide() {
		clearTimeout(this.#delayInTimer)
		clearTimeout(this.#delayOutTimer)

		this.#delayOutTimer = setTimeout(async () => {
			if (this.showing) {
				this.showing = false
				await this.element.animate(
					[
						{ opacity: '1', transform: this.#animPositions.to },
						{ opacity: '0', transform: this.#animPositions.from },
					],
					{
						duration: this.opts.animation!.durationOut,
						easing: this.opts.animation!.easing,
						fill: 'forwards',
					},
				).finished
				this.remove()
			}
		}, this.opts.delayOut)
	}

	mounted = false
	appent() {
		if (this.mounted) return
		this.mounted = true
		this.parent.appendChild(this.element)
	}
	remove() {
		if (!this.mounted) return
		this.mounted = false
		this.parent.removeChild(this.element)
	}

	updatePosition(e?: PointerEvent) {
		const tooltipRect = this.element.getBoundingClientRect()

		this.text = this.text

		if (e?.type === 'pointermove') {
			this.#mouse = {
				x: e.clientX,
				y: e.clientY,
			}
		}

		// todo - can we safely "cache" the anchor?
		const anchor = this.#getAnchorRects()

		let left = 0
		let top = 0

		const baseOffset = 4

		this.element.classList.add('fractils-tooltip-' + this.placement)

		switch (this.placement) {
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

		const parentRect = this.parent.getBoundingClientRect()

		this.element.style.left = `calc(${left - parentRect.left}px + ${this.opts.offsetX!})`
		this.element.style.top = `calc(${top - parentRect.top}px + ${this.opts.offsetY!})`
	}

	// todo - mobile touch events support?
	#mouse = { x: 0, y: 0 }

	#getAnchorRects(): {
		x: AnchorRect
		y: AnchorRect
	} {
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
								left: this.#mouse.x + window.scrollX,
								top: this.#mouse.y + window.scrollY,
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
					} else {
						if (DEV) console.warn('Invalid tooltip anchor:', anchor)
						return this.node.getBoundingClientRect()
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

	/**
	 * Determines if the tooltip should watch any anchors for movement.
	 */
	#maybeWatchAnchor() {
		const maybeWatch = (el: ElementOrSelector | null) => {
			if (!el) return

			const anchor =
				el instanceof HTMLElement
					? el
					: this.node.querySelector(el) ?? document.querySelector(el)

			const watchAnchor = () => {
				if (anchor) {
					this.#watch(anchor as HTMLElement)
				}
			}

			if (anchor) {
				anchor.removeEventListener('transitionrun', watchAnchor)
				anchor.addEventListener('transitionrun', watchAnchor, { once: true })
				this.#tempListeners.add(() =>
					anchor.removeEventListener('transitionrun', watchAnchor),
				)
			}
		}

		const getAnchor = (anchor: Anchor) => {
			if (anchor instanceof HTMLElement) {
				return anchor as HTMLElement
			} else if (typeof anchor === 'string') {
				return anchor === 'node' ? this.node : anchor === 'mouse' ? null : anchor
			}
			return null
		}

		if (
			this.opts.anchor &&
			typeof this.opts.anchor === 'object' &&
			'x' in this.opts.anchor &&
			'y' in this.opts.anchor
		) {
			const anchorX = getAnchor(this.opts.anchor.x)
			const anchorY = getAnchor(this.opts.anchor.y)

			if (anchorX === anchorY) {
				maybeWatch(anchorX)
			} else {
				maybeWatch(anchorX)
				maybeWatch(anchorY)
			}
		} else {
			maybeWatch(getAnchor(this.opts.anchor))
		}
	}

	#watchingAnchor = false
	#watchingFinished = false
	#watchTimeout: ReturnType<typeof setTimeout> | undefined = undefined
	/**
	 * Keeps the tooltip position in sync with the anchor when an anchor's
	 * transform is in transition while the tooltip is showing.
	 * @todo - watch animation events too?
	 */
	#watch(el: HTMLElement) {
		if (this.#watchingAnchor) {
			return
		}
		this.#watchingFinished = false
		this.#watchingAnchor = true

		const complete = () => {
			this.#watchingFinished = true
			this.#watchingAnchor = false
			this.element.style.transitionDuration = '0.1s'
			if (timeout) el.removeEventListener('transitionend', timeout)
		}

		const timeout = () => {
			if (this.#watchingFinished) return
			complete()
		}

		if (!this.showing) {
			complete()
			return
		}

		clearTimeout(this.#watchTimeout)
		this.#watchTimeout = setTimeout(() => {
			if (!this.#watchingFinished) {
				complete()
			}
		}, 500)

		el.removeEventListener('transitionend', timeout)
		el.addEventListener('transitionend', timeout)

		if (!this.#watchingFinished) {
			this.node.style.transitionDuration = '0s'

			tickLoop(() => {
				if (!this.#watchingFinished) {
					this.updatePosition()
				} else {
					return true
				}
			})
		}
	}

	dispose() {
		if (this.#watchTimeout) {
			clearTimeout(this.#watchTimeout)
		}

		for (const listener of this.#tempListeners) {
			listener()
		}
		this.#tempListeners.clear()

		this.#evm.dispose()
		this.element.remove()
	}

	/**
	 * A default style for the tooltip element.
	 */
	static style = /*css*/ `
		.fractils-tooltip {
			position: absolute;
			
			min-width: 3rem;
			max-width: auto;
			min-height: auto;
			max-height: auto;
			padding: 4px 8px;
			
			opacity: 0;
			color: var(--fg-a, #fff);
			background-color: var(--bg-a, #000);
			border-radius: var(--radius-sm, 4px);
			box-shadow: var(--shadow, 0rem 0.0313rem 0.0469rem hsl(var(--shadow-color) / 0.02),
			0rem 0.125rem 0.0938rem hsl(var(--shadow-color) / 0.02),
			0rem 0.1563rem 0.125rem hsl(var(--shadow-color) / 0.025),
			0rem 0.1875rem 0.1875rem hsl(var(--shadow-color) / 0.05),
			0rem 0.3125rem 0.3125rem hsl(var(--shadow-color) / 0.05),
			0rem 0.4375rem 0.625rem hsl(var(--shadow-color) / 0.075));
			
			text-align: center;
			font-size: var(--font-size-sm, 12px);

			z-index: 1000;
			pointer-events: none;
			transition: opacity 0.1s;
		}
		
		.fractils-tooltip .fractils-hotkey {
			filter: contrast(1.1);
			background: var(--fractils-hotkey_background, #1118);
			background: var(--fractils-hotkey_background, rgba(var(--bg-c-rgb), 0.66));
			color: var(--fractils-hotkey_color, var(--fg-a, #fff));
			padding: 0px 3px;
			border-radius: 2px;
			box-shadow: 0 0 2px rgba(0, 0, 0, 0.33);
		}

		:root[theme='dark'] .fractils-tooltip .fractils-hotkey {
			background: var(--fractils-hotkey_background, rgba(var(--bg-d-rgb), 1));
		}
	`
}

/**
 * A wrapper function that creates a new {@link Tooltip} instance and returns
 * an object with `update` and `destroy` methods for svelte-action compatibility.
 *
 * @example Vanilla
 * ```js
 * import { tooltip } from 'lib/actions/tooltip'
 *
 * const el = document.querySelector('div')
 * const tip = tooltip(el, { text: 'Hello, world!', placement: 'top' })
 * ```
 *
 * @example Svelte
 * ```svelte
 * <script>
 * 	import { tooltip } from 'lib/actions/tooltip'
 * </script>
 *
 * <div use:tooltip={{ text: 'Hello, world!', placement: 'top' }}>
 * 	Hover me!
 * </div>
 * ```
 */
export const tooltip = (node: HTMLElement, options?: Partial<TooltipOptions>) => {
	const tt = new Tooltip(node, options)

	return {
		update(opts: TooltipOptions) {
			// todo - We're not actually triggering any updates here...
			Object.assign(tt.opts, opts)
		},
		destroy() {
			tt.dispose()
		},
	}
}
