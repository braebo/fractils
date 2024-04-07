import type { ElementsOrSelector, ElementsOrSelectors } from './select'

import { Resizable, RESIZABLE_DEFAULTS, type ResizableOptions } from './resizable'
import { DRAG_DEFAULTS, Draggable, type DraggableOptions } from './draggable'
import { resolveOpts } from '$lib/gui/shared/resolveOpts'
import { EventManager } from './EventManager'
import { deepMerge } from './deepMerge'
import { Logger } from './logger'
import { state } from './state'

export interface WindowManagerOptions {
	/**
	 * Whether to make windows draggable. Can be a boolean, or your own
	 * {@link DraggableOptions}.  Set to `false` to disable dragging.
	 * @default true
	 */
	draggable: boolean | Partial<DraggableOptions>

	/**
	 * Whether to make windows resizable. Can be a boolean, or your own
	 * {@link ResizableOptions}.  Set to `false` to disable resizing.
	 * @default true
	 */
	resizable: boolean | Partial<ResizableOptions>

	/**
	 * Element's or selectors which will act as collision obstacles for the element.
	 * @default ''
	 */
	obstacles: ElementsOrSelectors

	/**
	 * Element's or selectors which will act as bounds obstacles for the element.
	 * @default ''
	 */
	bounds: ElementsOrSelector

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
}

export interface WindowManagerStorageOptions {
	/**
	 * Prefix to use for localStorage keys.
	 * @default "fractils::window-manager"
	 */
	key: string

	/**
	 * Whether to persist the size.
	 * @default true
	 */
	size?: boolean

	/**
	 * Whether to persist the position when windowManager is enabled.
	 * @default true
	 */
	position?: boolean

	/**
	 * How long to debounce writes to localStorage (0 to disable).
	 * @default 50
	 */
	debounce?: number
}

export const WINDOWMANAGER_DEFAULTS = {
	resizable: {
		...RESIZABLE_DEFAULTS,
		// localStorageKey: 'fractils::window-manager::resizable',
	},
	draggable: {
		...DRAG_DEFAULTS,
		// localStorageKey: 'fractils::window-manager::draggable',
	},
	zFloor: 0,
	preserveZ: false,
	bounds: undefined,
	obstacles: undefined,
} as const satisfies WindowManagerOptions

/**
 * Manages the z-index of multiple elements to ensure
 * the most recently selected element is on top.
 */
export class WindowManager {
	windows: WindowInstance[] = []
	opts: WindowManagerOptions

	#log = new Logger('WindowManager', { fg: 'lightseagreen' })
	#evm = new EventManager()

	// get animationOptions() {
	// 	return this.opts.animation as AnimationOptions | false
	// }

	constructor(options?: Partial<WindowManagerOptions>) {
		this.opts = this.#resolveOptions(options)
		this.#log.fn('constructor').info({ opts: this.opts, this: this })
	}

	add = (node: HTMLElement, options?: Partial<WindowInstanceOptions>) => {
		// const instanceOpts: WindowInstanceOptions = {
		// 	preserveZ: this.opts.preserveZ,
		// 	resizable: false,
		// 	draggable: false,
		// 	bounds: this.opts.bounds,
		// }

		// if (options?.draggable !== false) {
		// 	const dragObstacles = this.#resolveObstacles(options?.draggable, this.opts.draggable)
		// 	if (dragObstacles) {
		// 		instanceOpts.draggable = Object.assign({}, this.opts.draggable, dragObstacles)
		// 	}
		// }

		// if (options?.resizable !== false) {
		// 	const resizeObstacles = this.#resolveObstacles(options?.resizable, this.opts.resizable)
		// 	if (resizeObstacles) {
		// 		instanceOpts.resizable = Object.assign({}, this.opts.resizable, resizeObstacles)
		// 	}
		// }

		const instanceOpts = this.#resolveOptions(options) as WindowInstanceOptions
		this.#log.fn('add').info({ node, options, instanceOpts })

		this.windows.push(new WindowInstance(node, instanceOpts))

		this.#evm.listen(node, 'grab', this.select)

		return this
	}

	// #resolveObstacles<T extends 'draggable' | 'resizable'>(
	// 	localOverride: T extends 'draggable'
	// 		? WindowInstanceOptions['draggable'] | boolean | undefined
	// 		: WindowInstanceOptions['resizable'] | boolean | undefined,
	// 	localBase: T extends 'draggable'
	// 		? WindowManagerOptions['draggable'] | undefined
	// 		: WindowManagerOptions['resizable'] | undefined,
	// ): { obstacles: ElementsOrSelectors } {
	// 	let obstacles: ElementsOrSelectors = []

	// 	if (typeof localOverride === 'object' && localOverride?.obstacles) {
	// 		obstacles = localOverride.obstacles
	// 	} else if (typeof localBase === 'object' && localBase.obstacles) {
	// 		obstacles = this.opts.obstacles
	// 	} else if (localOverride === true) {
	// 		obstacles = this.opts.obstacles
	// 	} else if (localOverride === false) {
	// 		obstacles = []
	// 	}

	// 	return { obstacles }
	// }

	applyZ() {
		for (let i = 1; i < this.windows.length; i++) {
			this.windows[i].node.style.setProperty('z-index', String(this.opts.zFloor + i))
		}

		return this
	}

	select = (e: PointerEvent) => {
		const target_node = e.currentTarget as HTMLElement

		const instance = this.windows.find(({ node }) => node === target_node)

		if (!instance) {
			throw new Error('Unable to resolve instance from selected node: ' + target_node)
		}

		// this.#animate(node)

		const initialZ = target_node.style.getPropertyValue('z-index')
		target_node.style.setProperty('z-index', String(this.opts.zFloor + this.windows.length))

		if (target_node.dataset['keepZ'] === 'true' || this.opts.preserveZ) {
			addEventListener(
				'pointerup',
				() => target_node.style.setProperty('z-index', initialZ),
				{
					once: true,
				},
			)
		} else {
			this.windows = this.windows.filter(i => i !== instance)
			this.windows.push(instance)
			this.applyZ()
		}
	}

	#resolveOptions(options?: Partial<WindowManagerOptions>): WindowManagerOptions {
		this.#log.fn('#resolveOptions').info(options)
		const opts = deepMerge<WindowManagerOptions>(WINDOWMANAGER_DEFAULTS, options)

		opts.draggable = resolveOpts(options?.draggable, WINDOWMANAGER_DEFAULTS.draggable)
		opts.resizable = resolveOpts(options?.resizable, WINDOWMANAGER_DEFAULTS.resizable)

		// Add any obstacles to both the draggable and resizable options.
		if (opts.obstacles) {
			if (opts.draggable) {
				;(opts.draggable as DraggableOptions).obstacles = opts.obstacles
			}
			if (opts.resizable) {
				;(opts.resizable as ResizableOptions).obstacles = opts.obstacles
			}
		}

		if (opts.bounds) {
			if (opts.draggable) {
				;(opts.draggable as DraggableOptions).bounds = opts.bounds
			}
			if (opts.resizable) {
				;(opts.resizable as ResizableOptions).bounds = opts.bounds
			}
		}

		// Pass on storage options, and add a suffix to the key.
		// const storageOpts = resolveOpts(options?.storage, WINDOWMANAGER_DEFAULTS.storage)
		// if (storageOpts) opts.storage = storageOpts

		return opts
	}

	dispose() {
		this.#evm.dispose()
		for (const instance of this.windows) {
			instance.resizableInstance?.dispose()
			instance.draggableInstance?.dispose()
		}
	}
}

interface WindowInstanceOptions {
	draggable: DraggableOptions | boolean
	resizable: ResizableOptions | boolean
	bounds?: WindowManagerOptions['bounds']
	obstacles?: WindowManagerOptions['obstacles']
	preserveZ?: WindowManagerOptions['preserveZ']
}

/**
 * A single window in a window manager.
 */
class WindowInstance {
	draggableInstance?: Draggable
	resizableInstance?: Resizable

	position = state({ x: 0, y: 0 })
	size = state({ width: 0, height: 0 })

	constructor(
		public node: HTMLElement,
		options: WindowInstanceOptions,
	) {
		if (options?.preserveZ) node.dataset['keepZ'] = 'true'

		const dragOpts = resolveOpts(options.draggable, DRAG_DEFAULTS)
		const resizeOpts = resolveOpts(options.resizable, RESIZABLE_DEFAULTS)

		if (dragOpts) {
			this.draggableInstance = new Draggable(node, dragOpts)
		}

		if (resizeOpts) {
			this.resizableInstance = new Resizable(node, resizeOpts)
		}
	}

	dispose() {
		this.resizableInstance?.dispose()
		this.draggableInstance?.dispose()
	}
}
