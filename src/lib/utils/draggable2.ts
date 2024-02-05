import type { Action } from 'svelte/action'

import { isHTMLElement, isString } from './is'
import { bounceInOut, cubicOut, quintOut } from 'svelte/easing'
import { tweened } from 'svelte/motion'
import { select } from './select'
import { Logger } from './logger'
import { clamp } from './clamp'
import { state } from './state'

export type DragBoundsCoords = {
	/** Number of pixels from left of the document */
	left: number

	/** Number of pixels from top of the document */
	top: number

	/** Number of pixels from the right side of document */
	right: number

	/** Number of pixels from the bottom of the document */
	bottom: number
}

export type DragAxis = 'both' | 'x' | 'y' | 'none'

export type DragBounds = HTMLElement | Partial<DragBoundsCoords> | 'parent' | 'body' | (string & {})

export type DragEventData = {
	/** How much element moved from its original position horizontally */
	offsetX: number

	/** How much element moved from its original position vertically */
	offsetY: number

	/** The node on which the draggable is applied */
	rootNode: HTMLElement

	/** The element being dragged */
	currentNode: HTMLElement
}

interface DragEvents {
	'on:dragStart': (e: DragEventData) => void
}

type ElementsOrSelectors = string | HTMLElement | (string | HTMLElement)[] | undefined

export type DragOptions = {
	/**
	 * Optionally limit the drag area
	 *
	 * Accepts `parent` as prefixed value, and limits it to its parent.
	 *
	 * Or, you can specify any selector and it will be bound to that.
	 *
	 * **Note**: We don't check whether the selector is bigger than the node element.
	 * You yourself will have to make sure of that, or it may lead to strange behavior
	 *
	 * Or, finally, you can pass an object of type `{ top: number; right: number; bottom: number; left: number }`.
	 * These mimic the css `top`, `right`, `bottom` and `left`, in the sense that `bottom` starts from the bottom of the window, and `right` from right of window.
	 * If any of these properties are unspecified, they are assumed to be `0`.
	 */
	bounds: DragBounds | 'parent' | 'body'
	/**
	 * Axis on which the element can be dragged on. Valid values: `both`, `x`, `y`, `none`.
	 *
	 * - `both` - Element can move in any direction
	 * - `x` - Only horizontal movement possible
	 * - `y` - Only vertical movement possible
	 * - `none` - No movement at all
	 *
	 * @default 'both'
	 */
	axis: DragAxis
	/**
	 * Custom transform function. If provided, this function will be used to apply the DOM transformations to the root node to move it.
	 *
	 * You can return a string to apply to a `transform` property, or not return anything and apply your transformations using `rootNode.style.transform = VALUE`
	 *
	 * @default undefined
	 */
	transform?: ({
		offsetX,
		offsetY,
		rootNode,
	}: {
		offsetX: number
		offsetY: number
		rootNode: HTMLElement
	}) => string | undefined | void
	/**
	 * Applies `user-select: none` on `<body />` element when dragging,
	 * to prevent the irritating effect where dragging doesn't happen and the text is selected.
	 * Applied when dragging starts and removed when it stops.
	 *
	 * Can be disabled using this option
	 *
	 * @default true
	 */
	userSelectNone: boolean
	/**
	 * Ignores touch events with more than 1 touch.
	 * This helps when you have multiple elements on a canvas where you want to implement
	 * pinch-to-zoom behaviour.
	 *
	 * @default false
	 */
	ignoreMultitouch: boolean
	/**
	 * Disables dragging altogether.
	 *
	 * @default false
	 */
	disabled: boolean
	/**
	 * Applies a grid on the page to which the element snaps to when dragging, rather than the default continuous grid.
	 *
	 * `Note`: If you're programmatically creating the grid, do not set it to [0, 0] ever, that will stop drag at all. Set it to `undefined`.
	 *
	 * @default undefined
	 */
	grid: [number, number] | undefined
	/**
	 * Control the position manually with your own state
	 *
	 * By default, the element will be draggable by mouse/finger, and all options will work as default while dragging.
	 *
	 * But changing the `position` option will also move the draggable around. These parameters are reactive,
	 * so using Svelte's reactive variables as values for position will work like a charm.
	 *
	 * Note: If you set `disabled: true`, you'll still be able to move the draggable through state variables. Only the user interactions won't work
	 *
	 */
	position: { x: number; y: number }
	/**
	 * CSS Selector of an element or multiple elements inside the parent node(on which `use:draggable` is applied).
	 *
	 * Can be an element or elements too. If it is provided, Trying to drag inside the `cancel` element(s) will prevent dragging.
	 *
	 * @default undefined
	 */
	cancel: ElementsOrSelectors
	/**
	 * CSS Selector of an element or multiple elements inside the parent node(on which `use:draggable` is applied). Can be an element or elements too.
	 *
	 * If it is provided, Only clicking and dragging on this element will allow the parent to drag, anywhere else on the parent won't work.
	 *
	 * @default undefined
	 */
	handle: ElementsOrSelectors
	/**
	 * Element's or selectors which will act as collision obstacles for the draggable element.
	 */
	obstacles: ElementsOrSelectors
	/**
	 * Class to apply on the element on which `use:draggable` is applied.
	 * Note that if `handle` is provided, it will still apply class on the element to which this action is applied, **NOT** the handle
	 *
	 */
	defaultClass: string
	/**
	 * Class to apply on the element when it is dragging
	 *
	 * @default 'neodrag-dragging'
	 */
	defaultClassDragging: string
	/**
	 * Class to apply on the element if it has been dragged at least once.
	 *
	 * @default 'neodrag-dragged'
	 */
	defaultClassDragged: string
	/**
	 * Offsets your element to the position you specify in the very beginning.
	 * `x` and `y` should be in pixels
	 *
	 */
	defaultPosition: { x: number; y: number }
	/**
	 * Fires when dragging start
	 */
	onDragStart: (data: DragEventData) => void
	/**
	 * Fires when dragging is going on
	 */
	onDrag: (data: DragEventData) => void
	/**
	 * Fires when dragging ends
	 */
	onDragEnd: (data: DragEventData) => void
}

const DEFAULT_CLASSES = {
	MAIN: 'fractils-draggable',
	DRAGGING: 'fractils-dragging',
	DRAGGED: 'fractils-dragged',
}

const DRAG_DEFAULTS = {
	bounds: 'body',
	axis: 'both',
	userSelectNone: true,
	ignoreMultitouch: false,
	disabled: false,
	grid: undefined,
	position: { x: 0, y: 0 },
	cancel: undefined,
	handle: undefined,
	obstacles: undefined,
	defaultClass: DEFAULT_CLASSES.MAIN,
	defaultClassDragging: DEFAULT_CLASSES.DRAGGING,
	defaultClassDragged: DEFAULT_CLASSES.DRAGGED,
	defaultPosition: { x: 0, y: 0 },
	onDragStart: () => {},
	onDrag: () => {},
	onDragEnd: () => {},
	transform: undefined,
} as const satisfies DragOptions

export class Draggable {
	static initialized = false
	opts: DragOptions

	active = false
	disabled = false

	clickOffsetX = 0
	clickOffsetY = 0

	clientToNodeOffsetX = 0
	clientToNodeOffsetY = 0

	/**
	 * The internal
	 */
	currentRect = {
		top: 0,
		right: 0,
		left: 0,
		bottom: 0,
	}

	defaultPosition = { x: 0, y: 0 }

	bodyOriginalUserSelectVal = ''

	computedBounds: DragBoundsCoords | undefined

	handleEls: HTMLElement[]
	cancelEls: HTMLElement[]
	obstacleEls: HTMLElement[]

	currentlyDraggedEl!: HTMLElement
	tween = tweened(
		{ x: 0, y: 0 },
		{
			duration: 100,
			easing: cubicOut,
		},
	)

	#log: Logger
	/** Cleanup functions (removeEventLister / unsubscribe) */
	#listeners = new Set<() => void>()
	debugStore = state({ x: 0, colliding: null })

	constructor(
		public node: HTMLElement,
		options?: Partial<DragOptions>,
	) {
		this.opts = { ...DRAG_DEFAULTS, ...options }

		this.#log = new Logger('draggable:' + this.node.classList[0], {
			fg: 'SkyBlue',
			deferred: false,
		})
		this.#log.fn('constructor').info({ opts: this.opts, this: this })

		this.node.classList.add(this.opts.defaultClass)

		//this.currentRect = this.node.getBoundingClientRect()

		this.translateX = this.opts.position
			? this.opts.position.x ?? 0
			: this.opts.defaultPosition.x
		this.translateY = this.opts.position
			? this.opts.position.y ?? 0
			: this.opts.defaultPosition.y

		this.defaultPosition = {
			x: this.node.offsetLeft,
			y: this.node.offsetTop,
		}

		// On mobile, touch can become extremely janky without it
		this.#setStyle(node, 'touch-action', 'none')

		this.handleEls = this.opts.handle ? select(this.opts.handle, this.node) : [this.node]
		this.cancelEls = select(this.opts.cancel, this.node)
		this.obstacleEls = select(this.opts.obstacles, document.body)

		this.node.addEventListener('pointerdown', this.dragStart, false)
		this.#listeners.add(() => {
			this.node.removeEventListener('pointerdown', this.dragStart, false)
		})

		addEventListener('pointerup', this.dragEnd, false)
		this.#listeners.add(() => {
			removeEventListener('pointerup', this.dragEnd, false)
		})

		addEventListener('pointermove', this.drag, false)
		this.#listeners.add(() => {
			removeEventListener('pointermove', this.drag, false)
		})

		addEventListener('resize', this.resize)
		this.#listeners.add(() => {
			removeEventListener('resize', this.resize)
		})

		this.#listeners.add(
			this.tween.subscribe((newValue) => {
				const { x, y } = newValue
				this.node.style.setProperty('translate', `${x}px ${y}px 1px`)
			}),
		)
	}

	resize = () => {
		this.computedBounds = this.#computeBoundRect(this.opts.bounds, this.node)

		const bounds = this.computedBounds!

		const { right, bottom } = this.node.getBoundingClientRect()

		let x = this.translateX
		let y = this.translateY

		const xdiff = right - bounds.right
		if (xdiff > 0) x -= xdiff

		const ydiff = bottom - bounds.bottom
		if (ydiff > 0) y -= ydiff

		if (x !== this.translateX || y !== this.translateY) {
			this.updatePosition(x, y)
		}
	}

	get nodeRect() {
		return this.node.getBoundingClientRect()
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

	get canMoveInX() {
		return /(both|x)/.test(this.opts.axis)
	}
	get canMoveInY() {
		return /(both|y)/.test(this.opts.axis)
	}

	get eventData(): DragEventData {
		return {
			offsetX: this.translateX,
			offsetY: this.translateY,
			rootNode: this.node,
			currentNode: this.currentlyDraggedEl,
		}
	}

	get isControlled() {
		return !!this.opts.position
	}

	get bounds() {
		return this.opts.bounds
	}

	dragStart = (e: PointerEvent) => {
		if (this.disabled) return

		if (e.button === 2) return

		if (this.opts.ignoreMultitouch && !e.isPrimary) return

		e.stopPropagation()

		// Recompute bounds
		this.computedBounds = this.#computeBoundRect(this.opts.bounds, this.node)

		// Error handling
		if (
			isString(this.opts.handle) &&
			isString(this.opts.cancel) &&
			this.opts.handle === this.opts.cancel
		) {
			throw new Error("`handle` selector can't be same as `cancel` selector")
		}

		if (this.#cancelElementContains(this.cancelEls, this.handleEls)) {
			throw new Error(
				"Element being dragged can't be a child of the element on which `cancel` is applied",
			)
		}

		const eventTarget = e.composedPath()[0] as HTMLElement

		if (
			!this.handleEls.some(
				(el) => el.contains(eventTarget) || el.shadowRoot?.contains(eventTarget),
			)
		) {
			this.#log.error('Not a handle element, returning')
			this.#log.debug({ handleEls: this.handleEls, eventTarget })
			return
		}

		// Make sure it's not a cancel element.
		if (this.#cancelElementContains(this.cancelEls, [eventTarget])) {
			return
		}

		this.#log.fn('dragStart').info()

		this.currentlyDraggedEl =
			this.handleEls.length === 1
				? this.node
				: this.handleEls.find((el) => el.contains(eventTarget))!

		this.active = true

		if (this.opts.userSelectNone) {
			// Apply user-select: none on body to prevent misbehavior
			this.bodyOriginalUserSelectVal = document.body.style.userSelect
			document.body.style.userSelect = 'none'
		}

		// Dispatch custom event
		this.#fireSvelteDragStartEvent()

		if (this.canMoveInX) this.clickOffsetX = e.clientX - this.translateX
		if (this.canMoveInY) this.clickOffsetY = e.clientY - this.translateY

		const { top, right, bottom, left } = this.node.getBoundingClientRect()
		this.currentRect = {
			top,
			right,
			bottom,
			left,
		}

		// Only the bounds uses these properties at the moment,
		// may open up in the future if others need it
		if (this.computedBounds) {
			this.clientToNodeOffsetX = e.clientX - this.nodeRect.left
			this.clientToNodeOffsetY = e.clientY - this.nodeRect.top
		}

		this.tween.set({
			x: this.translateX,
			y: this.translateY,
		}, {
			duration: 0
		})
	}

	drag = (e: PointerEvent) => {
		if (!this.active) return

		e.preventDefault()

		this.updatePosition(e.clientX, e.clientY)
	}

	updatePosition = (finalX: number, finalY: number) => {
		this.computedBounds = this.#computeBoundRect(this.opts.bounds, this.node)

		// Apply class defaultClassDragging
		this.node.classList.add(this.opts.defaultClassDragging)

		// Get final values for clamping

		if (this.computedBounds) {
			// Client position is limited to this virtual boundary to prevent node going out of bounds
			const virtualClientBounds: DragBoundsCoords = {
				left: this.computedBounds.left + this.clientToNodeOffsetX,
				top: this.computedBounds.top + this.clientToNodeOffsetY,
				right: this.computedBounds.right + this.clientToNodeOffsetX - this.nodeRect.width,
				bottom:
					this.computedBounds.bottom + this.clientToNodeOffsetY - this.nodeRect.height,
			}

			finalX = clamp(finalX, virtualClientBounds.left, virtualClientBounds.right)
			finalY = clamp(finalY, virtualClientBounds.top, virtualClientBounds.bottom)
		}

		const newX = Math.round(finalX - this.clickOffsetX)
		const newY = Math.round(finalY - this.clickOffsetY)

		this.#fireSvelteDragEvent()

		this.tryTranslate(newX, newY)
	}

	dragEnd = () => {
		if (!this.active) return

		this.computedBounds = this.#computeBoundRect(this.opts.bounds, this.node)

		// Apply class defaultClassDragged
		this.node.classList.remove(this.opts.defaultClassDragging)
		this.node.classList.add(this.opts.defaultClassDragged)

		if (this.opts.userSelectNone) {
			document.body.style.userSelect = this.bodyOriginalUserSelectVal
		}

		this.#fireSvelteDragEndEvent()

		if (this.canMoveInX) this.clickOffsetX = this.translateX
		if (this.canMoveInY) this.clickOffsetY = this.translateY

		this.active = false
	}

	tryTranslate(xPos: number, yPos: number) {
		// const rect = this.node.getBoundingClientRect()

		let targetX = this.translateX
		let targetY = this.translateY

		if (this.canMoveInX) {
			targetX = xPos
			const distanceToObstacle = this.collisionCheckX(targetX)

			if (distanceToObstacle !== null) {
				targetX = this.translateX + distanceToObstacle
			}
		}

		if (this.canMoveInY) {
			targetY = yPos
			const distanceToObstacle = this.collisionCheckY(targetY)

			if (distanceToObstacle !== null) {
				targetY = this.translateY + distanceToObstacle
			}
		}

		if (typeof this.opts.transform === 'undefined') {
			// this.node.style.setProperty('translate', `${targetX}px ${targetY}px 1px`)
			this.tween.set({ x: targetX, y: targetY })
		} else {
			// Call transform function if provided
			const transformCalled = this.opts.transform?.({
				offsetX: targetX,
				offsetY: targetY,
				rootNode: this.node,
			})

			if (isString(transformCalled)) {
				// this.#setStyle(this.node, 'translate', transformCalled)
				const [x, y] = transformCalled.split(' ')
				this.tween.set({ x: +x, y: +y })
			}
		}

		const deltaX = targetX - this.translateX
		const deltaY = targetY - this.translateY

		this.currentRect.left += deltaX
		this.currentRect.right += deltaX
		this.currentRect.top += deltaY
		this.currentRect.bottom += deltaY

		this.translateX = targetX
		this.translateY = targetY
	}

	collisionCheckX(xOffset: number): number | null {
		const { top, bottom, left, right } = this.currentRect

		const change = xOffset - this.translateX

		let closestDistance: number | undefined = undefined

		for (const obstacle of this.obstacleEls) {
			const o = obstacle.getBoundingClientRect()

			if (top > o.bottom || bottom < o.top) continue

			const rightToLeft = left > o.right && left + change - 1 < o.right
			const leftToRight = right < o.left && right + change + 1 > o.left

			if (rightToLeft) {
				closestDistance ??= -Infinity
				closestDistance = Math.max(closestDistance, Math.abs(o.right) - Math.abs(left) + 1)
			} else if (leftToRight) {
				closestDistance ??= Infinity
				closestDistance = Math.min(closestDistance, Math.abs(o.left) - Math.abs(right) - 1)
			}
		}

		return closestDistance ?? null
	}

	collisionCheckY(yOffset: number): number | null {
		const { top, bottom, left, right } = this.currentRect

		const change = yOffset - this.translateY

		let closestDistance: number | undefined = undefined

		for (const obstacle of this.obstacleEls) {
			const o = obstacle.getBoundingClientRect()

			if (left > o.right || right < o.left) continue

			const bottomToTop = top > o.bottom && top + change - 1 < o.bottom
			const topToBottom = bottom < o.top && bottom + change + 1 > o.top

			if (bottomToTop) {
				closestDistance ??= -Infinity
				closestDistance = Math.max(closestDistance, Math.abs(o.bottom) - Math.abs(top) + 1)
			} else if (topToBottom) {
				closestDistance ??= Infinity
				closestDistance = Math.min(closestDistance, Math.abs(o.top) - Math.abs(bottom) - 1)
			}
		}

		return closestDistance ?? null
	}

	update = (options: Partial<DragOptions>) => {
		// Update all the values that need to be changed
		this.opts.axis = options.axis || 'both'
		this.disabled = options.disabled ?? false
		this.opts.ignoreMultitouch = options.ignoreMultitouch ?? false
		this.opts.handle = options.handle
		this.opts.bounds = options.bounds!
		this.opts.cancel = options.cancel
		this.opts.userSelectNone = options.userSelectNone ?? true
		this.opts.grid = options.grid
		this.opts.transform = options.transform!

		const dragged = this.node.classList.contains(this.opts.defaultClassDragged)

		this.node.classList.remove(this.opts.defaultClass, this.opts.defaultClassDragged)

		this.opts.defaultClass = options.defaultClass ?? DEFAULT_CLASSES.MAIN
		this.opts.defaultClassDragging = options.defaultClassDragging ?? DEFAULT_CLASSES.DRAGGING
		this.opts.defaultClassDragged = options.defaultClassDragged ?? DEFAULT_CLASSES.DRAGGED

		this.node.classList.add(this.opts.defaultClass)

		if (dragged) this.node.classList.add(this.opts.defaultClass)

		if (this.isControlled) {
			this.translateX = options.position?.x ?? this.translateX
			this.translateY = options.position?.y ?? this.translateY

			this.tryTranslate(this.translateX, this.translateY)
		}
	}

	#computeBoundRect = (bounds: DragOptions['bounds'], rootNode: HTMLElement) => {
		if (bounds === undefined) return

		if (isHTMLElement(bounds)) return bounds.getBoundingClientRect()

		if (typeof bounds === 'object') {
			// we have the left right etc

			const { top = 0, left = 0, right = 0, bottom = 0 } = bounds

			const computedRight = window.innerWidth - right
			const computedBottom = window.innerHeight - bottom

			return { top, right: computedRight, bottom: computedBottom, left }
		}

		// It's a string
		if (bounds === 'parent') return (<HTMLElement>rootNode.parentNode).getBoundingClientRect()

		const node = document.querySelector<HTMLElement>(<string>bounds)
		if (node === null)
			throw new Error("The selector provided for bound doesn't exists in the document.")

		return node.getBoundingClientRect()
	}

	#setStyle = (el: HTMLElement, style: string, value: string) =>
		el.style.setProperty(style, value)

	#cancelElementContains = (cancelElements: HTMLElement[], dragElements: HTMLElement[]) =>
		cancelElements.some((cancelEl) => dragElements.some((el) => cancelEl.contains(el)))

	#callEvent = (eventName: 'dragstart' | 'drag' | 'dragend', fn: typeof this.opts.onDrag) => {
		const data = this.eventData
		this.node.dispatchEvent(new CustomEvent(eventName, { detail: data }))
		fn?.(data)
	}

	#fireSvelteDragStartEvent = () => {
		this.#callEvent('dragstart', this.opts.onDragStart)
	}

	#fireSvelteDragEndEvent = () => {
		this.#callEvent('dragend', this.opts.onDragEnd)
	}

	#fireSvelteDragEvent = () => {
		this.#callEvent('drag', this.opts.onDrag)
	}

	dispose() {
		this.node.removeEventListener('pointerdown', this.dragStart, false)
		removeEventListener('pointerup', this.dragEnd, false)
		removeEventListener('pointermove', this.drag, false)
		removeEventListener('resize', this.resize)
	}
}

export const draggable: Action<HTMLElement, Partial<DragOptions> | undefined, DragEvents> = (
	node: HTMLElement,
	options?: Partial<DragOptions>,
) => {
	const d = new Draggable(node, options ?? {})

	return {
		destroy: () => {
			d.dispose()
		},
		update: (options: Partial<DragOptions> | undefined) => {
			// Update all the values that need to be changed
			if (options) d.update(options)
		},
	}
}
