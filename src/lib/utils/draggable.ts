import type { ElementsOrSelectors } from './select'
import type { Action } from 'svelte/action'

import { cancelClassFound } from '../internal/cancelClassFound'
import { isDefined, isHTMLElement, isString } from './is'
import { EventManager } from './EventManager'
import { cubicOut } from 'svelte/easing'
import { tweened } from 'svelte/motion'
import { select } from './select'
import { Logger } from './logger'
import { clamp } from './clamp'
import { DEV } from 'esm-env'

/**
 * Represents a dom element's bounding rectangle.
 */
export type VirtualRect = {
	left: number
	top: number
	right: number
	bottom: number
}

/**
 * Represents the bounds to which the draggable element is limited to.
 */
export type DragBounds =
	| (string & {})
	| HTMLElement
	| 'parent'
	| 'body'
	| false
	| Partial<VirtualRect>

/**
 * Data passed to listeners of the {@link DragOptions.onDragStart|onDragStart},
 * {@link DragOptions.onDrag|onDrag}, {@link DragOptions.onDragEnd|onDragEnd}, and
 * {@link DragOptions.onCollision|onCollision} events.
 */
export type DragEventData = {
	/**
	 * The node on which the draggable is applied
	 */
	rootNode: HTMLElement

	/**
	 * Total horizontal movement from the node's original position.
	 */
	x: number

	/**
	 * Total vertical movement from the node's original position.
	 */
	y: number

	/**
	 * The complete event object.
	 */
	eventTarget: EventTarget
}

export type DragOptions = {
	/**
	 * The boundary to which the draggable element is limited to.
	 *
	 * Valid values:
	 *
	 * - `undefined` - defaults to `document.documentElement`
	 * - An `HTMLElement` or query selector string, _i.e. `.container` or `#container`_
	 * - `'parent'` - the element's {@link HTMLElement.offsetParent|offsetParent}
	 * - `'body'` - `document.body`
	 * - `false` - no boundary
	 * - `{ top: number, right: number, bottom: number, left: number }` - A custom {@link VirtualRect rect} relative to the viewport.
	 *
	 * **Note**: Make sure the bounds is smaller than the node's min size. [? ? ?]
	 * @default 'parent'
	 */
	bounds: DragBounds

	/**
	 * Axis on which the element can be dragged on.
	 * - `both` - Element can move in any direction
	 * - `x` - Only horizontal movement possible
	 * - `y` - Only vertical movement possible
	 * - `none` - No movement at all
	 * @default 'both'
	 */
	axis: 'both' | 'x' | 'y' | 'none'

	/**
	 * Custom transform function. If provided, this function will be used to
	 * apply the DOM transformations to the root node to move it.
	 *
	 * You can return a {@link https://developer.mozilla.org/docs/Web/CSS/transform | transform} property
	 * return nothing to apply your own transformations via
	 * {@link https://developer.mozilla.org/docs/Web/CSS/transform | node.style.transform}
	 * @default undefined
	 */
	transform?: (data: DragEventData) => { x: number; y: number } | void | undefined

	/**
	 * Applies `user-select: none` to the `<body />` element when dragging. `false` disables it.
	 * @default true
	 */
	userSelectNone: boolean

	/**
	 * Ignore touch events with more than 1 touch. Helpful for preserving pinch-to-zoom behavior on a pages with multiple draggable's.
	 * @default false
	 */
	ignoreMultitouch: boolean

	/**
	 * Disables dragging altogether.
	 * @default false
	 */
	disabled: boolean

	/**
	 * Control the position manually with your own state. These parameters are reactive,
	 * and will update the draggable element's position automagically upon reassignment.
	 * @default { x: 0, y: 0 }
	 */
	position: { x: number; y: number }

	/**
	 * An element or selector (or any combination of the two) for element(s) inside
	 * the parent node upon which dragging should be disabled when clicked.
	 * @default undefined
	 */
	cancel: ElementsOrSelectors

	/**
	 * CSS Selector of an element or multiple elements inside the parent node on
	 * which `use:draggable` is applied).  If provided, only clicking and dragging
	 * handles will activate dragging.
	 *
	 * @default undefined
	 */
	handle: ElementsOrSelectors

	/**
	 * Element's or selectors which will act as collision obstacles for the draggable element.
	 */
	obstacles: ElementsOrSelectors

	classes: {
		/**
		 * Class to apply on the element on which `use:draggable` is applied.
		 *
		 * __Note:__ If `handle` is provided, this class will still be applied
		 * to the draggable element itself, __NOT__ the handle element.
		 * @default 'fractils-draggable'
		 */
		default: string
		/**
		 * Class to apply on the element when it is dragging.
		 * @default 'fractils-dragging'
		 */
		dragging: string
		/**
		 * Class to apply on the element if it has been dragged at least once.
		 * @default 'fractils-dragged'
		 */
		dragged: string
		/**
		 * Elements with this class will disable dragging when clicked.
		 * @default 'fractils-cancel'
		 */
		cancel: string
	}

	/**
	 * Applies a base offset to the target element's default position.
	 * @default { x: 0, y: 0 }
	 */
	defaultPosition: { x: number; y: number }

	/**
	 * Fires on `pointerdown` for the element / valid handle elements.
	 */
	onDragStart: (data: DragEventData) => void

	/**
	 * Fires on `pointermove` while dragging.
	 */
	onDrag: (data: DragEventData) => void

	/**
	 * Fires on `pointerup`.
	 */
	onDragEnd: (data: DragEventData) => void

	/**
	 * Fires when the element collides with an obstacle.
	 */
	onCollision: (data: { x: number; y: number }) => void

	/**
	 * Tween options for the drag animation.
	 * @default { duration: 100, easing: cubicOut }
	 * @see https://svelte.dev/docs#tweened
	 * @remarks The animation is subtle, and most noticeable when the
	 * draggable element is moved a long distance very suddenly.
	 */
	tween: {
		/**
		 * Duration of the tween in milliseconds - 0 to disable.
		 * @default 100
		 */
		duration?: number
		easing?: (t: number) => number
	}
}

const DEFAULT_CLASSES = {
	default: 'fractils-draggable',
	dragging: 'fractils-dragging',
	dragged: 'fractils-dragged',
	cancel: 'fractils-cancel',
} as const

const DRAG_DEFAULTS = {
	bounds: 'parent',
	axis: 'both',
	userSelectNone: true,
	ignoreMultitouch: false,
	disabled: false,
	position: { x: 0, y: 0 },
	cancel: undefined,
	handle: undefined,
	obstacles: undefined,
	classes: DEFAULT_CLASSES,
	defaultPosition: { x: 0, y: 0 },
	onDragStart: () => {},
	onDrag: () => {},
	onDragEnd: () => {},
	onCollision: () => {},
	transform: undefined,
	tween: {
		duration: 100,
		easing: cubicOut,
	},
} as const satisfies DragOptions

/**
 * Make an element draggable.  Supports touch, mouse, and pointer events,
 * and has options for bounds / obstacle collision detection, programatic
 * position control, custom transforms, and more.
 *
 * @example
 * ```js
 * import { Draggable } from 'fractils'
 *
 * const element = document.createElement('div')
 *
 * const draggable = new Draggable(element, {
 * 	bounds: 'parent'
 * })
 * ```
 */
export class Draggable {
	static initialized = false
	opts: DragOptions

	/**
	 * Whether the draggable element is currently being dragged.
	 */
	#active = false

	/**
	 * Disables user interaction with the draggable element.
	 */
	disabled = false

	/**
	 * Used in  {@link updatePosition} to account for the difference between
	 * the node's position and the user's exact click position on the node.
	 */
	clickOffset = { x: 0, y: 0 }

	/**
	 * The distance between the pointer's position and the node's position.
	 */
	clientToNodeOffset = {
		x: 0,
		y: 0,
	}

	/**
	 * An internal representation of the {@link node|node's} bounding rectangle.
	 * Used for collision detection and animations.
	 */
	rect: VirtualRect = { top: 0, right: 0, bottom: 0, left: 0 }

	/**
	 * The original value of `user-select` on the body element
	 * used to restore the original value after dragging when
	 * {@link DragOptions.userSelectNone|userSelectNone} is `true`.
	 */
	#bodyOriginalUserSelectVal = ''

	boundsEl?: HTMLElement
	handleEls: HTMLElement[]
	cancelEls: HTMLElement[]
	obstacleEls: HTMLElement[]

	/**
	 * A rectangle representing the draggable element's boundary, if any.
	 */
	bounds = {
		left: -Infinity,
		top: -Infinity,
		right: Infinity,
		bottom: Infinity,
	}

	_position = { x: 0, y: 0 }
	get position() {
		return this._position
	}
	set position(v) {
		this._position = v
		this.moveTo(v)
	}

	/**
	 * Updates the {@link bounds} property to account for any changes in the
	 * DOM or this instance's {@link DragOptions.bounds|bounds} option.
	 */
	#recomputeBounds: () => void

	/**
	 * @todo I think we can just remove this and let the user add their
	 * own event listeners if they want to target a specific element.
	 */
	eventTarget?: HTMLElement

	/**
	 * See {@link DragOptions.tween}
	 */
	tween = tweened(
		{ x: 0, y: 0 },
		{
			duration: 100,
			easing: cubicOut,
		},
	)

	/**
	 * Cleanup functions (removeEventLister / unsubscribe) to call in {@link dispose}.
	 */
	#listeners = new Set<() => void>()
	#evm = new EventManager()

	/**
	 * A callback to release the pointer capture using the
	 * {@link PointerEvent.pointerId | pointerId} and reset the cursor.
	 */
	#releaseCapture = () => {}

	/**
	 * Internal logger for debugging. Automatically bypassed in non-dev environments.
	 */
	#log: Logger

	constructor(
		public node: HTMLElement,
		options?: Partial<DragOptions>,
	) {
		this.opts = {
			...DRAG_DEFAULTS,
			...options,
			defaultPosition: {
				...DRAG_DEFAULTS.defaultPosition,
				...options?.defaultPosition,
			},
		}

		this.#log = new Logger('draggable:' + this.node.classList[0], {
			fg: 'SkyBlue',
			deferred: false,
		})
		this.#log.fn('constructor').info({ opts: this.opts, this: this })

		this.node.classList.add(this.opts.classes.default)

		this.x = options?.position?.x ?? this.opts.defaultPosition.x
		this.y = options?.position?.y ?? this.opts.defaultPosition.y

		// Prevents mobile touch-event jank.
		this.node.style.setProperty('touch-action', 'none')

		this.handleEls = this.opts.handle ? select(this.opts.handle, this.node) : [this.node]
		this.cancelEls = select(this.opts.cancel, this.node)
		this.obstacleEls = select(this.opts.obstacles)

		this.#recomputeBounds = this.#resolveRecomputeBounds(this.opts.bounds)
		this.#recomputeBounds()

		this.#evm.listen(this.node, 'pointerdown', this.dragStart)
		this.#evm.listen(window, 'pointerup', this.dragEnd)
		this.#evm.listen(window, 'pointermove', this.drag)
		this.#evm.listen(window, 'resize', this.resize)
		this.#evm.add(
			this.tween.subscribe(({ x, y }) => {
				this.node.style.setProperty('translate', `${x}px ${y}px 1px`)
			}),
		)

		if (this.opts.defaultPosition !== DRAG_DEFAULTS.defaultPosition) {
			this.moveTo(this.opts.defaultPosition)
			this._position = { x: this.x, y: this.y }
			// Update the virtual rect.
			const { top, right, bottom, left } = this.node.getBoundingClientRect()
			this.rect = { top, right, bottom, left }
		}
	}

	/**
	 * The x position of the draggable element's transform offset.
	 */
	get x() {
		return +this.node.dataset.translateX! || 0
	}
	set x(v: number) {
		this.node.dataset.translateX = String(v)
	}

	/**
	 * The y position of the draggable element's transform offset.
	 */
	get y() {
		return +this.node.dataset.translateY! || 0
	}
	set y(v: number) {
		this.node.dataset.translateY = String(v)
	}

	/**
	 * Whether the draggable element can move in the x direction,
	 * based on the {@link DragOptions.axis|axis} option.
	 */
	get canMoveX() {
		return /(both|x)/.test(this.opts.axis)
	}
	/**
	 * Whether the draggable element can move in the x direction,
	 * based on the {@link DragOptions.axis|axis} option.
	 */
	get canMoveY() {
		return /(both|y)/.test(this.opts.axis)
	}

	get eventData(): DragEventData {
		return {
			x: this.x,
			y: this.y,
			rootNode: this.node,
			eventTarget: this.eventTarget!,
		}
	}

	get isControlled() {
		return !!this.opts.position
	}

	dragStart = (e: PointerEvent) => {
		if (this.disabled) return
		// Ignore right-clicks.
		if (e.button === 2) return

		if (this.opts.ignoreMultitouch && !e.isPrimary) return
		// Abort if a cancel element was clicked.
		if (cancelClassFound(e, this.opts.classes.cancel)) return

		// Refresh the obstacles.
		this.obstacleEls = select(this.opts.obstacles)

		if (DEV) {
			for (const el of this.obstacleEls) {
				el.style.outline = '2px dotted red'
			}
		}

		// Error handling.
		if (
			isString(this.opts.handle) &&
			isString(this.opts.cancel) &&
			this.opts.handle === this.opts.cancel
		) {
			throw new Error("`handle` selector can't be same as `cancel` selector")
		}

		if (this.#cancelElementContains(this.handleEls)) {
			throw new Error(
				"Element being dragged can't be a child of the element on which `cancel` is applied",
			)
		}

		const eventTarget = e.composedPath()[0] as HTMLElement

		// Return if the event target is not a handle element.
		if (
			!this.handleEls.some(
				(e) => e.contains(eventTarget) || e.shadowRoot?.contains(eventTarget),
			)
		)
			return

		// Make sure it's not a cancel element.
		if (this.#cancelElementContains([eventTarget])) {
			return
		}

		this.#log.fn('dragStart').debug('Dragging initiated.')
		e.stopPropagation()

		// Resolve the event target.
		this.eventTarget =
			this.handleEls.length === 1
				? this.node
				: this.handleEls.find((el) => el.contains(eventTarget))!

		this.#active = true

		// Store the click offset
		if (this.canMoveX) this.clickOffset.x = e.clientX - this.x
		if (this.canMoveY) this.clickOffset.y = e.clientY - this.y

		// Update the virtual rectangle.
		const { top, right, bottom, left } = this.node.getBoundingClientRect()
		this.rect = { top, right, bottom, left }

		// Update the clientToNodeOffset.
		if (this.bounds) this.clientToNodeOffset = { x: e.clientX - left, y: e.clientY - top }

		// Set the initial position (with a forced duration of 0).
		this.tween.set({ x: this.x, y: this.y }, { ...this.opts.tween, duration: 0 })
		// Update the bounds rect.
		this.#recomputeBounds()

		// this.node.dispatchEvent(new CustomEvent('grab'))

		// Capture the pointer and store the release callback.
		const { cursor } = getComputedStyle(this.node)
		this.node.setPointerCapture(e.pointerId)
		this.node.style.cursor = 'grabbing'
		this.#releaseCapture = () => {
			//  this.node.releasePointerCapture(e.pointerId)
			this.node.style.cursor = cursor
		}

		// Dispatch custom events
		this.#fireSvelteDragStartEvent()

		this.#fireUpdateEvent()
	}

	drag = (e: PointerEvent) => {
		if (!this.#active) return

		e.preventDefault()
		e.stopPropagation()

		// Apply dragging and dragged classes.
		this.node.classList.add(this.opts.classes.dragging)
		this.node.classList.add(this.opts.classes.dragged)

		const x = e.clientX - this.clickOffset.x
		const y = e.clientY - this.clickOffset.y
		const target = { x, y }
		if (this.bounds) this.#clampToBounds(target)
		this.moveTo(target)

		this.#fireSvelteDragEvent()
	}

	dragEnd = () => {
		if (!this.#active) return

		// todo - delete!
		if (DEV) {
			for (const el of this.obstacleEls) {
				el.style.outline = 'none'
			}
		}

		this.node.classList.remove(this.opts.classes.dragging)

		if (this.opts.userSelectNone) {
			document.body.style.userSelect = this.#bodyOriginalUserSelectVal
		}

		this.clickOffset = { x: 0, y: 0 }
		this.clientToNodeOffset = { x: 0, y: 0 }
		this._position = { x: this.x, y: this.y }

		this.#active = false

		this.#releaseCapture()

		this.node.dispatchEvent(new CustomEvent('release'))

		// todo - this is ghetto
		setTimeout(() => this.node.classList.remove(this.opts.classes.dragged), 0)

		this.#fireSvelteDragEndEvent()
	}

	resize = () => {}

	#clampToBounds = (target: { x: number; y: number }) => {
		// Clamp the target position to the bounds.
		const { left, top, right, bottom } = this.rect
		const width = right - left
		const height = bottom - top

		const styleLeft = parseFloat(this.node.style.left) || 0
		const styleTop = parseFloat(this.node.style.top) || 0

		target.x = clamp(
			target.x,
			this.bounds.left - left - styleLeft,
			this.bounds.right - width - styleLeft,
		)
		target.y = clamp(
			target.y,
			this.bounds.top - top - styleTop,
			this.bounds.bottom - height - styleTop,
		)

		this.#fireUpdateEvent()

		if (DEV) {
			const xdev = this.node.querySelector('.content') as HTMLElement
			if (xdev) {
				xdev.innerText = `this.rect: ${left} , ${top} , ${right}, ${bottom}\n
			targetX: ${target.x}, targetY: ${target.y}\n`
			}
		}
	}

	/**
	 * Moves the {@link node|draggable element} to the specified position, adjusted
	 * for collisions with {@link obstacleEls obstacles} or {@link boundsRect bounds}.
	 */
	moveTo(target: { x: number; y: number }, tweenTime?: number) {
		if (this.canMoveX) {
			const deltaX = target.x - this.x
			const x = this.#collisionClampX(deltaX)

			// Apply delta to x / virtual rect (!! before checking collisionY !!).
			this.rect.left += x
			this.rect.right += x
			this.x += x
		}

		if (this.canMoveY) {
			const deltaY = target.y - this.y
			const y = this.#collisionClampY(deltaY)

			// Apply delta to y / virtual rect.
			this.rect.top += y
			this.rect.bottom += y
			this.y += y
		}

		// Check for a custom user transform function before applying ours.
		if (!this.opts.transform) {
			const { left, top } = this.node.getBoundingClientRect()

			// Tween slower for longer distances.
			const duration =
				tweenTime ?? Math.abs(this.rect.left + this.rect.top - (left + top)) * 2.5

			// Bounce if collision occured.
			// const collisionOccured = this.x !== target.x || this.y !== target.y

			// Set the tween and let it animate the position.
			this.tween.set({ x: this.x, y: this.y }, { duration, easing: cubicOut })
		} else {
			// Call the user's custom transform function.
			const customTransformResult = this.opts.transform?.({
				x: this.x,
				y: this.y,
				rootNode: this.node,
				eventTarget: this.eventTarget!,
			})

			// If the user's custom transform function returns an `{x,y}` object, use it.
			if (
				customTransformResult &&
				'x' in customTransformResult &&
				'y' in customTransformResult
			) {
				const { x, y } = customTransformResult
				this.tween.set({ x, y, ...this.opts.tween })
			}
		}

		this.#fireUpdateEvent()
	}

	/**
	 * Checks for collision with {@link obstacleEls obstacles} to determine the maximum distance
	 * the draggable can move in the x direction.
	 *
	 * @returns The maximum distance the draggable can move in the x direction (`deltaX`) before
	 * colliding with an obstacle.  If no collision is detected, the full distance (`targetX`)
	 * is returned.  If the draggable is already colliding with an obstacle, `0` is returned.
	 */
	#collisionClampX(deltaX: number) {
		const { top, bottom, left, right } = this.rect

		if (deltaX === 0) return 0

		// moving right > 0
		if (deltaX > 0) {
			for (const obstacle of this.obstacleEls) {
				const o = obstacle.getBoundingClientRect()
				// too high || too low || already passed || unreachable with delta
				if (top > o.bottom || bottom < o.top || right > o.left || right + deltaX <= o.left)
					continue
				deltaX = Math.min(deltaX, o.left - right)
			}
		} else {
			for (const obstacle of this.obstacleEls) {
				const o = obstacle.getBoundingClientRect()
				// too high || too low || already passed || unreachable with delta
				if (top > o.bottom || bottom < o.top || left < o.right || left + deltaX >= o.right)
					continue
				deltaX = Math.max(deltaX, o.right - left)
			}
		}
		return deltaX
	}

	/**
	 * Checks for collision with {@link obstacleEls obstacles} to determine the maximum distance
	 * the draggable can move in the y direction.
	 *
	 * @returns The maximum distance the draggable can move in the x direction (`deltaY`) before
	 * colliding with an obstacle.  If no collision is detected, the full distance (`targetY`)
	 * is returned.  If the draggable is already colliding with an obstacle, `0` is returned.
	 */
	#collisionClampY(deltaY: number) {
		const { top, bottom, left, right } = this.rect

		if (deltaY > 0) {
			// Moving down.
			for (const obstacle of this.obstacleEls) {
				const o = obstacle.getBoundingClientRect()
				// too far left || too far right || already passed || unreachable with delta
				if (left > o.right || right < o.left || bottom > o.top || bottom + deltaY <= o.top)
					continue
				deltaY = Math.min(deltaY, o.top - bottom)
			}
		} else {
			// Moving up.
			for (const obstacle of this.obstacleEls) {
				const o = obstacle.getBoundingClientRect()
				// too far left || too far right || already passed || unreachable with delta
				if (left > o.right || right < o.left || top < o.bottom || top + deltaY >= o.bottom)
					continue
				deltaY = Math.max(deltaY, o.bottom - top)
			}
		}
		return deltaY
	}

	/**
	 * Resolves the {@link DragOptions.bounds|bounds} and returns a
	 * function that updates the {@link bounds} property when called.
	 */
	#resolveRecomputeBounds(opts: DragOptions['bounds']): () => void {
		if (opts === false) return () => void 0

		// Check for a custom bounds rect.
		if (
			typeof opts === 'object' &&
			('left' in opts || 'right' in opts || 'top' in opts || 'bottom' in opts)
		) {
			return () => {
				this.bounds = {
					left: 0,
					right: 0,
					top: 0,
					bottom: 0,
					...(this.opts.bounds as Partial<VirtualRect>),
				}
			}
		}

		// prettier-ignore
		const node =
			isHTMLElement(opts) ? opts
			: opts === 'body' 	? document.body
			: opts === 'parent' ? this.node.offsetParent
			: isString(opts) 	? select(opts)[0]
			: !isDefined(opts) 	? document.documentElement
			: undefined

		// Error handling.
		if (!node) throw new Error('Invalid bounds option provided: ' + opts)

		this.boundsEl = node as HTMLElement

		// Add a resize observer to the bounds element to automatically update the bounds.
		const boundsResizeObserver = new ResizeObserver(() => {
			// this.clickOffset = { x: this.rect.left, y: this.rect.top }
			this.resize()
			this.#fireUpdateEvent()
		})
		boundsResizeObserver.observe(node)
		this.#listeners.add(() => boundsResizeObserver.disconnect())

		this.#fireUpdateEvent()

		return () => (this.bounds = node.getBoundingClientRect())
	}

	#cancelElementContains = (dragElements: HTMLElement[]) => {
		return this.cancelEls.some((cancelEl) => dragElements.some((el) => cancelEl.contains(el)))
	}

	#callEvent = (
		eventName: 'dragstart' | 'drag' | 'dragend',
		fn: (data: DragEventData) => void,
	) => {
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

	#fireUpdateEvent = () => {
		this.node.dispatchEvent(new CustomEvent('update', { detail: this }))
	}

	dispose() {
		this.#evm.dispose()
	}
}

/**
 * Events fired by the draggable svelte action.
 */
export interface DragEvents {
	'on:dragStart': (e: DragEventData) => void
	'on:drag': (e: DragEventData) => void
	'on:dragEnd': (e: DragEventData) => void
	'on:collision': (e: { x: number; y: number }) => void
	'on:update': (e: CustomEvent<Draggable>) => void
}

/**
 * A svelte action to make an element draggable.
 *
 * @example
 * ```svelte
 * <script>
 * 	import { draggable } from 'fractils'
 * </script>
 *
 * <div use:draggable> Drag Me </div>
 * ```
 */
export const draggable: Action<HTMLElement, Partial<DragOptions> | undefined, DragEvents> = (
	node: HTMLElement,
	options?: Partial<DragOptions>,
) => {
	const d = new Draggable(node, options ?? {})

	return {
		destroy: () => {
			d.dispose()
		},
		// The update function of a svelte action automatically fires whenever the
		// options object is changed externally, enabling easy reactivity.
		update: (options: Partial<DragOptions> | undefined) => {
			if (!options) return

			// Update all the values that need to be changed
			d.opts.axis = options.axis || DRAG_DEFAULTS.axis
			d.disabled = options.disabled ?? DRAG_DEFAULTS.disabled
			d.opts.ignoreMultitouch = options.ignoreMultitouch ?? DRAG_DEFAULTS.ignoreMultitouch
			d.opts.handle = options.handle
			d.opts.bounds = options.bounds!
			d.opts.cancel = options.cancel
			d.opts.userSelectNone = options.userSelectNone ?? DRAG_DEFAULTS.userSelectNone
			d.opts.transform = options.transform

			const dragged = d.node.classList.contains(d.opts.classes.dragged)

			d.node.classList.remove(d.opts.classes.default, d.opts.classes.dragged)

			d.opts.classes.default = options?.classes?.default ?? DEFAULT_CLASSES.default
			d.opts.classes.dragging = options?.classes?.dragging ?? DEFAULT_CLASSES.dragging
			d.opts.classes.dragged = options?.classes?.dragged ?? DEFAULT_CLASSES.dragged

			d.node.classList.add(d.opts.classes.default)

			if (dragged) d.node.classList.add(d.opts.classes.default)

			if (d.isControlled) {
				d.x = options.position?.x ?? d.x
				d.y = options.position?.y ?? d.y

				d.moveTo({ x: d.x, y: d.y })
			}
		},
	}
}
