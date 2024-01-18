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
