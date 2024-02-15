import { Draggable, type DragOptions } from './draggable3'
import { Resizable, type ResizableOptions } from './resizable'

export interface WindowManagerOptions {
	/**
	 * The base z-index value.
	 * @default 0
	 */
	zFloor: number

	/**
	 * Return to current z-index on release.
	 * @default false
	 */
	keepZ: boolean

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
}

export const WINDOWMANAGER_DEFAULTS: WindowManagerOptions = {
	zFloor: 0,
	keepZ: false,
	resizable: true,
	draggable: true,
}

/**
 * Manages the z-index of multiple elements to ensure
 * the most recently selected element is on top.
 */
export class WindowManager {
	nodes: HTMLElement[] = []
	opts: WindowManagerOptions

	draggableOptions: Partial<DragOptions> | null
	resizableOptions: Partial<ResizableOptions> | null

	constructor(options?: Partial<WindowManagerOptions>) {
		this.opts = { ...WINDOWMANAGER_DEFAULTS, ...options }

		console.log(this.opts.zFloor)

		this.draggableOptions =
			typeof this.opts.draggable === 'object'
				? this.opts.draggable
				: this.opts.draggable === true
					? {}
					: null
		this.resizableOptions =
			typeof this.opts.resizable === 'object'
				? this.opts.resizable
				: this.opts.resizable === true
					? {}
					: null
	}

	add = (node: HTMLElement, options?: Partial<WindowManagerOptions>) => {
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
		const z = node.style.getPropertyValue('z-index')
		node.style.setProperty('z-index', String(this.opts.zFloor + this.nodes.length))

		// const scale = window.getComputedStyle(node).getPropertyValue('scale')
		const scale = parseFloat(node.style.getPropertyValue('scale')) || 1

		// node.style.setProperty('scale', String(scale + 0.1))
		node.animate([{ scale }, { scale: scale + 0.025 }], {
			duration: 75,
			easing: 'ease-out',
			fill: 'forwards',
		})

		const animateBack = () =>
			node.animate({ scale: scale }, { duration: 75, easing: 'ease-in', fill: 'forwards' })

		if (this.opts.keepZ) {
			// prettier-ignore
			addEventListener('pointerup', () => {
				animateBack()
				node.style.setProperty('z-index', z)
			}, { once: true })
		} else {
			this.nodes = this.nodes.filter((n) => n !== node)
			this.nodes.push(node)
			this.applyZ()
			// prettier-ignore
			addEventListener('pointerup', () => {
				animateBack()
			}, { once: true })
		}
	}

	dispose() {
		for (const node of this.nodes) {
			node.removeEventListener('pointerdown', this.select)
		}
	}
}
