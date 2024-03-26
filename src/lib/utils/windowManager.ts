import type { ElementsOrSelectors } from './select'

import { Resizable, type ResizableOptions } from './resizable'
import { Draggable, type DragOptions } from './draggable'
import { EventManager } from './EventManager'
import { Logger } from './logger'
import { deepMerge } from './deepMerge'

export interface WindowManagerOptions {
	/**
	 * The base z-index value.
	 * @default 0
	 */
	zFloor: number

	/**
	 * Restores a selected window's z-index immediately upon release.
	 * @default false
	 */
	preserveZ: boolean

	/**
	 * Whether to make windows draggable. Can be a boolean, or your own
	 * {@link DragOptions}.  Set to `false` to disable dragging.
	 * @default true
	 */
	draggable: boolean | Partial<DragOptions>

	/**
	 * Whether to make windows resizable. Can be a boolean, or your own
	 * {@link ResizableOptions}.  Set to `false` to disable resizing.
	 * @default true
	 */
	resizable: boolean | Partial<ResizableOptions>

	// /**
	//  * Animation options for window selection.
	//  * @default { scale: 1., duration: 75 }
	//  */
	// animation: false | Partial<AnimationOptions>

	/**
	 * Element's or selectors which will act as collision obstacles for the element.
	 * @default ''
	 */
	obstacles: ElementsOrSelectors

	/**
	 * Element's or selectors which will act as bounds obstacles for the element.
	 * @default ''
	 */
	bounds: ElementsOrSelectors
}

interface AnimationOptions {
	scale: number
	duration: number
}

export const WINDOWMANAGER_DEFAULTS: WindowManagerOptions = {
	zFloor: 0,
	preserveZ: false,
	resizable: true,
	draggable: true,
	// animation: {
	// 	duration: 75,
	// 	scale: 1,
	// } as const,
	obstacles: undefined,
	bounds: undefined,
} as const

/**
 * A single window in a window manager.
 */
interface WindowInstance {
	element: HTMLElement
	draggableInstance?: Draggable
	resizableInstance?: Resizable
}

/**
 * Manages the z-index of multiple elements to ensure
 * the most recently selected element is on top.
 */
export class WindowManager {
	windows: WindowInstance[] = []
	opts: WindowManagerOptions

	#log = new Logger('WindowManager', { fg: 'lightseagreen' })
	#evm = new EventManager()

	get draggableOptions() {
		return this.opts.draggable as DragOptions | false
	}
	get resizableOptions() {
		return this.opts.resizable as ResizableOptions | false
	}
	// get animationOptions() {
	// 	return this.opts.animation as AnimationOptions | false
	// }

	constructor(options?: Partial<WindowManagerOptions>) {
		this.opts = this.#resolveOptions(options)
		this.#log.fn('constructor').info({ opts: this.opts, this: this })
	}

	add = (node: HTMLElement, options?: Partial<WindowManagerOptions>) => {
		if (options?.preserveZ) node.dataset.keepZ = 'true'

		const instance: WindowInstance = {
			element: node,
			resizableInstance: undefined,
			draggableInstance: undefined,
		}

		if (this.draggableOptions) {
			const obstacles = options?.obstacles ?? this.draggableOptions.obstacles
			// Order of precedence: options.draggable.obstacles > options.obstacles > this.opts.obstacles
			const opts = Object.assign({}, this.draggableOptions, { obstacles }, options?.draggable)
			instance.draggableInstance = new Draggable(node, opts)
		}

		if (this.resizableOptions) {
			const obstacles = options?.obstacles ?? this.opts.obstacles
			// Order of precedence: options.resizable.obstacles > options.obstacles > this.opts.obstacles
			const opts = Object.assign({}, this.resizableOptions, { obstacles }, options?.resizable)
			instance.resizableInstance = new Resizable(node, opts)
		}

		this.windows.push(instance)

		this.#evm.listen(node, 'grab', this.select)

		return {
			destroy: () => {
				this.dispose()
			},
		}
	}

	applyZ() {
		for (let i = 1; i < this.windows.length; i++) {
			this.windows[i].element.style.setProperty('z-index', String(this.opts.zFloor + i))
		}

		return this
	}

	select = (e: PointerEvent) => {
		const node = e.currentTarget as HTMLElement

		const instance = this.windows.find(({ element }) => element === node)

		if (!instance) {
			throw new Error('Unable to resolve instance from selected node: ' + node)
		}

		// this.#animate(node)

		const initialZ = node.style.getPropertyValue('z-index')
		node.style.setProperty('z-index', String(this.opts.zFloor + this.windows.length))

		if (node.dataset.keepZ === 'true' || this.opts.preserveZ) {
			addEventListener('pointerup', () => node.style.setProperty('z-index', initialZ), {
				once: true,
			})
		} else {
			this.windows = this.windows.filter(i => i !== instance)
			this.windows.push(instance)
			this.applyZ()
		}
	}

	// #animate = (node: HTMLElement) => {
	// 	if (!this.animationOptions) return

	// 	const scale = parseFloat(node.style.getPropertyValue('scale')) || 1

	// 	const animOpts = {
	// 		duration: this.animationOptions.duration,
	// 		easing: 'ease-out',
	// 		fill: 'forwards',
	// 	} as const

	// 	node.animate([{ scale }, { scale: scale - 1 + this.animationOptions.scale }], animOpts)

	// 	window.addEventListener('pointerup', () => node.animate([{ scale }], animOpts), {
	// 		once: true,
	// 	})
	// }

	#resolveOptions(options?: Partial<WindowManagerOptions>): WindowManagerOptions {
		// const opts = { ...WINDOWMANAGER_DEFAULTS, ...options }
		this.#log.fn('#resolveOptions').info(options)
		const opts = deepMerge(WINDOWMANAGER_DEFAULTS, options)


		// if (options?.animation === false) {
		// 	opts.animation = false
		// } else {
		// 	opts.animation = {
		// 		...WINDOWMANAGER_DEFAULTS.animation,
		// 		...(options?.animation as AnimationOptions),
		// 	}
		// }

		opts.draggable =
			typeof options?.draggable === 'object'
				? options.draggable
				: options?.draggable === true
					? WINDOWMANAGER_DEFAULTS.draggable
					: false

		opts.resizable =
			typeof options?.resizable === 'object'
				? options.resizable
				: options?.resizable === true
					? WINDOWMANAGER_DEFAULTS.resizable
					: false

		// Add any obstacles to both the draggable and resizable options.
		if (opts.obstacles) {
			if (opts.draggable) {
				;(opts.draggable as DragOptions).obstacles = opts.obstacles
			}
			if (opts.resizable) {
				;(opts.resizable as ResizableOptions).obstacles = opts.obstacles
			}
		}

		return opts
	}

	dispose() {
		this.#evm.dispose()
	}
}
