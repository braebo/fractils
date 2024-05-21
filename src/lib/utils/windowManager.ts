import type { ElementOrSelector, ElementsOrSelectors } from './select'
import type { Action } from 'svelte/action'

import { Resizable, RESIZABLE_DEFAULTS, type ResizableOptions } from './resizable'
import { DRAGGABLE_DEFAULTS, Draggable, type DraggableOptions } from './draggable'
import { resolveOpts } from '../gui/shared/resolveOpts'
import { EventManager } from './EventManager'
import { Logger } from './logger'
import { nanoid } from './nanoid'
import { state } from './state'
import { isObject } from './is'

export interface WindowManagerOptions {
	__type?: 'WindowManagerOptions'

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
	bounds: ElementOrSelector

	/**
	 * The base z-index value.
	 * @default 10
	 */
	zFloor: number

	/**
	 * Restores a selected window's z-index immediately upon release.
	 * @default false
	 */
	preserveZ: boolean

	/**
	 * Options to persist position and/or size in local storage.
	 *
	 * `true` to use the {@link WINDOWMANAGER_DEFAULTS}.
	 *
	 * `false` to disable local storage (or just leave `undefined`).
	 *
	 * @see WindowManagerStorageOptions
	 */
	localStorage?: boolean | WindowManagerStorageOptions
}

interface WindowManagerStorageOptions {
	__type?: 'WindowManagerStorageOptions'

	/**
	 * Prefix to use for localStorage keys.
	 * @default "window-manager"
	 */
	key: string

	/**
	 * Whether to persist the size of {@link resizable} windows.
	 * @default true
	 */
	size?: boolean

	/**
	 * Whether to persist the position of {@link draggable} windows.
	 * @default true
	 */
	position?: boolean

	/**
	 * How long to debounce writes to localStorage (0 to disable).
	 * @default 50
	 */
	debounce?: number
}

export const WINDOWMANGER_STORAGE_DEFAULTS = {
	__type: 'WindowManagerStorageOptions',
	key: 'window-manager',
	size: true,
	position: true,
	debounce: 50,
} as const satisfies WindowManagerStorageOptions

export const WINDOWMANAGER_DEFAULTS = {
	__type: 'WindowManagerOptions',
	resizable: RESIZABLE_DEFAULTS,
	draggable: DRAGGABLE_DEFAULTS,
	zFloor: 10,
	preserveZ: false,
	bounds: undefined,
	obstacles: undefined,
	localStorage: false,
} as const satisfies WindowManagerOptions

/**
 * Manages multiple draggable and/or resizable {@link WindowInstance}s.
 *
 * {@link WindowManager.windows|`windows`} can be added, removed, and their
 * z-index values are managed to ensure the most recently selected element is on top.
 * @todo Add examples
 */
export class WindowManager {
	/**
	 * A map of all windows managed by the instance.  The key is the window's id specified in the
	 * options for each window.
	 */
	windows = new Map<WindowInstance['id'], WindowInstance>()

	/**
	 * The initial {@link WindowManagerOptions} provided.
	 */
	readonly opts: WindowManagerOptions

	private _log = new Logger('WindowManager', { fg: 'lightseagreen' })
	private _evm = new EventManager()

	constructor(options?: Partial<WindowManagerOptions>) {
		options ??= WINDOWMANAGER_DEFAULTS
		options.__type = 'WindowManagerOptions'
		this.opts = Object.freeze(this._resolveOptions(options))
		this._log.fn('constructor').info({ opts: this.opts, this: this })
	}

	add: Action<HTMLElement, Partial<WindowInstanceOptions> | undefined> = (
		node: HTMLElement,
		options?: Partial<WindowInstanceOptions>,
	) => {
		// const instanceOpts = this._resolveOptions(options) as WindowInstanceOptions
		// this._log.fn('add').info({ node, options, instanceOpts })

		const instance = new WindowInstance(this, node, options)
		this.windows.set(instance.id, instance)

		const listenerId = this._evm.listen(node, 'grab', this.select)

		return {
			destroy: () => {
				instance.dispose()
				this.windows.delete(instance.id)
				this._evm.unlisten(listenerId)
			},
		}
	}

	update() {
		this.windows.forEach(({ resizableInstance, draggableInstance }) => {
			if (draggableInstance) draggableInstance.update()
			if (resizableInstance) resizableInstance.size = resizableInstance.size
		})
	}

	applyZ() {
		let i = 0
		for (const instance of this.windows.values()) {
			instance.node.style.setProperty('z-index', String(this.opts.zFloor + i++))
		}

		return this
	}

	select = (e: PointerEvent) => {
		const target_node = e.currentTarget as HTMLElement

		const instance = this.windows.get(target_node.id)

		if (!instance) {
			throw new Error('Unable to resolve instance from selected node: ' + target_node.id)
		}

		// this.#animate(node)

		if (this.windows.size > 1) {
			const initialZ = target_node.style.getPropertyValue('z-index')
			target_node.style.setProperty('z-index', String(this.opts.zFloor + this.windows.size))

			if (target_node.dataset['keepZ'] === 'true' || this.opts.preserveZ) {
				addEventListener(
					'pointerup',
					() => target_node.style.setProperty('z-index', initialZ),
					{
						once: true,
					},
				)
			} else {
				this.windows.delete(instance.id)
				this.windows.set(instance.id, instance)
				this.applyZ()
			}
		}

		return this
	}

	private _resolveOptions(
		options?: Partial<WindowManagerOptions>,
		defaults = WINDOWMANAGER_DEFAULTS,
	): WindowManagerOptions & {
		localStorage: WindowManagerStorageOptions | false
		draggable: DraggableOptions | false
		resizable: ResizableOptions | false
	} {
		const opts = {} as WindowManagerOptions & {
			localStorage: WindowManagerStorageOptions | false
			draggable: DraggableOptions | false
			resizable: ResizableOptions | false
		}

		opts.zFloor = options?.zFloor ?? defaults.zFloor
		opts.preserveZ = options?.preserveZ ?? defaults.preserveZ
		opts.draggable = resolveOpts(options?.draggable, defaults.draggable)
		opts.resizable = resolveOpts(options?.resizable, defaults.resizable)
		opts.obstacles = options?.obstacles ?? defaults.obstacles
		opts.bounds = options?.bounds ?? defaults.bounds

		if (typeof options?.obstacles === 'undefined') {
			if (opts.obstacles) {
				if (isObject(opts.draggable)) {
					opts.draggable.obstacles = opts.obstacles
				}
				if (isObject(opts.resizable)) {
					opts.resizable.obstacles = opts.obstacles
				}
			}
		} else {
			if (isObject(opts.draggable)) {
				if (typeof opts.draggable.obstacles === 'undefined') {
					opts.draggable.obstacles = options.obstacles
				}
			}
		}

		if (opts.bounds) {
			if (opts.draggable) {
				opts.draggable.bounds = opts.bounds
			}
			if (opts.resizable) {
				opts.resizable.bounds = opts.bounds
			}
		}

		// Resolve localStorage options.
		if (typeof options?.localStorage !== 'undefined') {
			if (options.localStorage === true) {
				opts.localStorage = WINDOWMANGER_STORAGE_DEFAULTS
			} else if (options.localStorage === false) {
				opts.localStorage = false
			} else if (typeof options.localStorage === 'object') {
				opts.localStorage = {
					key: options.localStorage.key ?? WINDOWMANGER_STORAGE_DEFAULTS.key,
					size: options.localStorage.size ?? WINDOWMANGER_STORAGE_DEFAULTS.size,
					position:
						options.localStorage.position ?? WINDOWMANGER_STORAGE_DEFAULTS.position,
					debounce:
						options.localStorage.debounce ?? WINDOWMANGER_STORAGE_DEFAULTS.debounce,
				}

				if (isObject(opts.draggable)) {
					opts.draggable.localStorageKey = opts.localStorage.key
				}
				if (isObject(opts.resizable)) {
					opts.resizable.localStorageKey = opts.localStorage.key
				}
			}
		}

		return opts
	}

	/**
	 * Dispose of the instance and all windows.
	 */
	dispose() {
		this._log.fn('dispose').info(this)
		this._evm?.dispose()
		for (const instance of this.windows.values()) {
			instance?.dispose()
		}
		this.windows.clear()
	}
}

// export interface WindowInstanceOptions {
// 	id?: string
// 	draggable: Partial<DraggableOptions> | boolean
// 	resizable: Partial<ResizableOptions> | boolean
// 	bounds?: WindowManagerOptions['bounds']
// 	obstacles?: WindowManagerOptions['obstacles']
// 	preserveZ?: WindowManagerOptions['preserveZ']
// }
export type WindowInstanceOptions = Partial<WindowManagerOptions> & {
	/**
	 * A unique identifier for the window, making it accessible via the
	 * {@link WindowManager.windows|`windows`} map (i.e. `windowManager.windows.get(id)`).
	 *
	 * If not provided, a random id will be generated.
	 * @default nanoid()
	 */
	id?: string
}

/**
 * A single window in a window manager.
 */
export class WindowInstance {
	draggableInstance?: Draggable
	resizableInstance?: Resizable

	id: string
	position = state({ x: 0, y: 0 })
	size = state({ width: 0, height: 0 })

	constructor(
		public manager: WindowManager,
		public node: HTMLElement,
		options?: WindowInstanceOptions,
	) {
		this.id = node.id || options?.id || `wm-instance-${nanoid(8)}`
		node.id ||= this.id

		// @ts-expect-error - yoink
		const opts = manager._resolveOptions(options, manager.opts)

		let dragKey: string | undefined = undefined
		const dragKeyParts = [] as string[]
		const dragOpts = opts.draggable

		if (!!dragOpts) {
			if (typeof dragOpts === 'object') {
				if (typeof dragOpts.localStorageKey === 'undefined') {
					if (typeof manager.opts.localStorage === 'object') {
						dragKeyParts.push(manager.opts.localStorage.key)
					} else {
						dragKeyParts.push(WINDOWMANGER_STORAGE_DEFAULTS.key)
					}
				} else if (dragOpts.localStorageKey) {
					dragKeyParts.push(dragOpts.localStorageKey)
				}
			}
			dragKeyParts.push(`${this.manager.windows.size + 1}`)
			dragKey = [...dragKeyParts, 'draggable'].join('::')
			dragOpts.localStorageKey = dragKey
		}

		let resizeKey: string | undefined = undefined
		const resizeKeyParts = [] as string[]
		const resizeOpts = opts.resizable

		if (resizeOpts) {
			if (typeof resizeOpts === 'object') {
				if (typeof resizeOpts.localStorageKey === 'undefined') {
					if (typeof manager.opts.localStorage === 'object') {
						resizeKeyParts.push(manager.opts.localStorage.key)
					} else {
						resizeKeyParts.push(WINDOWMANGER_STORAGE_DEFAULTS.key)
					}
				} else if (resizeOpts.localStorageKey) {
					resizeKeyParts.push(resizeOpts.localStorageKey)
				}
			}
			resizeKeyParts.push(`${this.manager.windows.size}`)
			resizeKey = [...resizeKeyParts, 'resizable'].join('::')
			resizeOpts.localStorageKey = resizeKey
		}

		this.draggableInstance = new Draggable(node, dragOpts || { disabled: true })
		this.resizableInstance = new Resizable(node, resizeOpts || { disabled: true })

		if (opts?.preserveZ) {
			node.dataset['keepZ'] = 'true'
		}
	}

	dispose() {
		this.resizableInstance?.dispose()
		this.draggableInstance?.dispose()
	}
}
