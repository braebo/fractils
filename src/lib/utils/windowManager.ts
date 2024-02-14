export type WindowManagerOptions = typeof WINDOWMANAGER_DEFAULTS

export const WINDOWMANAGER_DEFAULTS = {}

export class WindowManager {
	nodes: HTMLElement[] = []

	constructor(options: Partial<WindowManagerOptions>) {
		const opts = { ...WINDOWMANAGER_DEFAULTS, ...options }
	}

	add(node: HTMLElement) {
		this.nodes.push(node)
	}
}
