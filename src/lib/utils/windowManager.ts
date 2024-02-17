import type { ElementsOrSelectors } from './select'

import { Resizable, type ResizableOptions } from './resizable'
import { Draggable, type DragOptions } from './draggable3'
import { isObject } from './is'

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
	 * Whether to make windows draggable.
	 * @default true
	 */
	draggable: boolean | Partial<DragOptions>

	/**
	 * Whether to make windows resizable.
	 * @default true
	 */
	resizable: boolean | Partial<ResizableOptions>

	/**
	 * Animation options for window selection.
	 * @default { scale: 1.025, duration: 75 }
	 */
	animation: false | Partial<AnimationOptions>

	/**
	 * Element's or selectors which will act as collision obstacles for the draggable element.
	 * @default ''
	 */
	obstacles: ElementsOrSelectors
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
	animation: {
		duration: 75,
		scale: 1.025,
	} as const,
	obstacles: '',
} as const

/**
 * Manages the z-index of multiple elements to ensure
 * the most recently selected element is on top.
 */
export class WindowManager {
	nodes: HTMLElement[] = []
	opts: WindowManagerOptions

	draggableOptions: Partial<DragOptions> | null
	resizableOptions: Partial<ResizableOptions> | null
	animationOptions: AnimationOptions | null

	constructor(options?: Partial<WindowManagerOptions>) {
		this.opts = { ...WINDOWMANAGER_DEFAULTS, ...options }

		if (options?.animation === false) {
			this.animationOptions = null
		} else {
			this.animationOptions = {
				...WINDOWMANAGER_DEFAULTS.animation,
				...(options?.animation as AnimationOptions),
			}
		}

		this.draggableOptions = this.#resolve(this.opts.draggable)
		this.resizableOptions = this.#resolve(this.opts.resizable)

		// Add any obstacles to both the draggable and resizable options.
		if (this.opts.obstacles) {
			if (this.draggableOptions) this.draggableOptions.obstacles = this.opts.obstacles
			if (this.resizableOptions) this.resizableOptions.obstacles = this.opts.obstacles
		}
	}

	add = (node: HTMLElement, options?: Partial<WindowManagerOptions>) => {
		if (options?.preserveZ) node.dataset.keepZ = 'true'

		this.nodes.push(node)

		if (this.draggableOptions) {
			const obstacles = options?.obstacles ?? this.opts.obstacles
			// Order of precedence: options.draggable.obstacles > options.obstacles > this.opts.obstacles
			const opts = Object.assign(this.draggableOptions, { obstacles }, options?.draggable)
			new Draggable(node, opts)
		}

		if (this.resizableOptions) {
			const obstacles = options?.obstacles ?? this.opts.obstacles
			// Order of precedence: options.resizable.obstacles > options.obstacles > this.opts.obstacles
			const opts = Object.assign(this.resizableOptions, { obstacles }, options?.resizable)
			new Resizable(node, opts)

			const addClasses = () => {
				const nodes = this.nodes.filter((n) => n !== node)
				for (const n of nodes) {
					n.classList.add('fractils-resizable-grabbing')
				}
			}
			node.addEventListener('grab', addClasses)
			this.#listeners.add(() => node.removeEventListener('grab', addClasses))

			const removeClasses = () => {
				const nodes = this.nodes.filter((n) => n !== node)
				for (const n of nodes) {
					n.classList.remove('fractils-resizable-grabbing')
				}
			}
			node.addEventListener('release', removeClasses)
			this.#listeners.add(() => node.removeEventListener('release', removeClasses))
		}

		node.addEventListener('pointerdown', this.select, { capture: false })
		this.#listeners.add(() => node.removeEventListener('pointerdown', this.select))

		return {
			destroy: () => {
				for (const cb of this.#listeners) {
					cb()
				}
			},
		}
	}

	applyZ() {
		for (let i = 1; i < this.nodes.length; i++) {
			this.nodes[i].style.setProperty('z-index', String(this.opts.zFloor + i))
		}

		return this
	}

	select = (e: PointerEvent) => {
		const node = e.currentTarget as HTMLElement

		this.#animate(node)

		const initialZ = node.style.getPropertyValue('z-index')
		node.style.setProperty('z-index', String(this.opts.zFloor + this.nodes.length))

		if (node.dataset.keepZ === 'true' || this.opts.preserveZ) {
			addEventListener('pointerup', () => node.style.setProperty('z-index', initialZ), {
				once: true,
			})
		} else {
			this.nodes = this.nodes.filter((n) => n !== node)
			this.nodes.push(node)
			this.applyZ()
		}
	}

	#animate = (node: HTMLElement) => {
		if (!this.animationOptions) return

		const scale = parseFloat(node.style.getPropertyValue('scale')) || 1

		const animOpts = {
			duration: this.animationOptions.duration,
			easing: 'ease-out',
			fill: 'forwards',
		} as const

		node.animate([{ scale }, { scale: scale - 1 + this.animationOptions.scale }], animOpts)

		node.addEventListener('pointerup', () => node.animate([{ scale }], animOpts), {
			once: true,
		})
	}

	#listeners = new Set<() => void>()

	/**
	 * Resolves a `boolean` or `object` option into the desired object.
	 */
	#resolve<T>(option: T) {
		return typeof option === 'object'
			? option
			: option === true
				? ({} as Omit<T, 'boolean'>)
				: null
	}

	dispose() {
		for (const cb of this.#listeners) {
			cb()
		}
	}
}
