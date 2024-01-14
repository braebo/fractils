export function isTouchEvent(e: Event): e is TouchEvent {
	return e.type.startsWith('touch')
}

export function isMouseEvent(e: Event): e is PointerEvent {
	return e.type.startsWith('mouse')
}
