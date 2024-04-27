import type { RectReference, RectTarget, SimpleRect } from './resolveRect'

import { resolveRef, resolveRefRect } from './resolveRect'

export class Rect<T extends RectTarget = RectTarget> {
	ref: T

	constructor(reference: RectReference) {
		this.ref = resolveRef(reference) as T
		const rect = resolveRefRect(this.ref)

		this.#top = () => rect().top
		this.#right = () => rect().right
		this.#bottom = () => rect().bottom
		this.#left = () => rect().left
		this.#center = () => ({
			x: this.x + this.width / 2,
			y: this.y + this.height / 2,
		})
	}

	#left: () => number
	get left() {
		return this.#left()
	}

	#right: () => number
	get right() {
		return this.#right()
	}

	#top: () => number
	get top() {
		return this.#top()
	}

	#bottom: () => number
	get bottom() {
		return this.#bottom()
	}

	get x() {
		return this.#left()
	}

	get y() {
		return this.#top()
	}

	get width() {
		return this.#right() - this.#left()
	}

	get height() {
		return this.#bottom() - this.#top()
	}

	#center: () => { x: number; y: number }
	get center() {
		return this.#center()
	}

	contains(_rect: Rect) {
		// todo
	}

	intersects(_rect: Rect): { intersects: boolean; deltaX: number; deltaY: number } {
		let intersects = false
		let deltaX = 0
		let deltaY = 0

		// todo

		return { intersects, deltaX, deltaY }
	}
}

export function isVirtualRect(reference: RectReference): reference is SimpleRect {
	return (
		typeof reference === 'object' &&
		'x' in reference &&
		'y' in reference &&
		'width' in reference &&
		'height' in reference
	)
}

// todo maybe
export class BoundsRect extends Rect {
	constructor(reference: RectReference) {
		super(reference)
	}
}
