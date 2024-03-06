export function isTouchEvent(e: Event): e is TouchEvent {
	return e.type.startsWith('touch')
}

export function isMouseEvent(e: Event): e is PointerEvent {
	return e.type.startsWith('mouse')
}

export function isDefined<T>(value: T | undefined): value is T {
	return value !== undefined
}

export function isString(value: unknown): value is string {
	return typeof value === 'string'
}

export function isHTMLElement(value: unknown): value is HTMLElement {
	return value instanceof HTMLElement
}

export function isObject(value: unknown): value is Record<string, unknown> {
	return !!value && typeof value === 'object'
}
