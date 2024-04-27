import type { ElementOrSelector } from '../utils/select'

import { select } from '../utils/select'
import { isVirtualRect } from './rect'

export type RectReference = SimpleRect | ElementOrSelector | Window | 'window' | 'document'

export type RectTarget = DOMRect | HTMLElement | Window

export interface SimpleRect {
	x: number
	y: number
	width: number
	height: number
}

/**
 * Resolves a reference to a DOMRect.  Valid input references are:
 * - {@link ElementOrSelector}
 * - `{ x, y, width, height }`
 * - `Window` | `Document`
 * - `'window'` | `'document'`
 * - An existing {@link DOMRect}
 */
export function resolveRect(ref: RectReference) {
	return resolveRefRect(resolveRef(ref))
}

/**
 * Resolves a reference to an element, window, or DOMRect.
 * @param ref - A reference to an element, window, or DOMRect.
 * @returns A function that returns the current DOMRect of the reference.
 */
export function resolveRefRect(target: RectTarget) {
	if ('getBoundingClientRect' in target) {
		return () => target.getBoundingClientRect()
	}

	if (target instanceof DOMRect) return () => target

	if (target instanceof Window) {
		return () => new DOMRect(0, 0, window.innerWidth, window.innerHeight)
	}

	throw new Error('Invalid target: ' + target)
}

export function resolveRef(ref: RectReference): RectTarget {
	if (!ref) {
		throw new Error('Invalid reference: ' + ref)
	}

	if (typeof ref === 'string') {
		if (ref === 'window') {
			if (!globalThis.window) {
				throw new Error('Cannot resolve reference to "window": window is undefined.')
			}

			return globalThis.window as Window
		}

		if (ref === 'document') {
			if (!globalThis.document) {
				throw new Error('Cannot resolve reference to "document": document is undefined.')
			}

			return globalThis.document.documentElement
		}

		const element = select(ref)[0]

		if (!element) {
			throw new Error('Cannot resolve reference to element: element not found.')
		}

		return element as HTMLElement
	}

	if (ref instanceof Window) return ref
	if (ref instanceof HTMLElement) return ref
	if (ref instanceof DOMRect) return ref

	if (isVirtualRect(ref)) {
		return new DOMRect(ref.x, ref.y, ref.width, ref.height)
	}

	throw new Error('Invalid reference: ' + ref)
}
