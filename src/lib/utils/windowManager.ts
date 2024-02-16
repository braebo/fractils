import { Draggable, type DragOptions } from './draggable3'
import { Resizable, type ResizableOptions } from './resizable'

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
	}

	add = (node: HTMLElement, options?: Partial<WindowManagerOptions>) => {
		if (options?.preserveZ) node.dataset.keepZ = 'true'

		this.nodes.push(node)

		if (this.draggableOptions) {
			new Draggable(node, Object.assign(this.draggableOptions, options?.draggable))
		}
		if (this.resizableOptions) {
			new Resizable(node, Object.assign(this.resizableOptions, options?.resizable))
		}

		node.addEventListener('pointerdown', this.select, { capture: false })

		return {
			destroy: () => {
				node.removeEventListener('pointerdown', this.select)
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
		for (const node of this.nodes) {
			node.removeEventListener('pointerdown', this.select)
		}
	}
}
