/**
 * Checks if an event's composed path contains an element with the `fractils-cancel` class.
 */
export function cancelClassFound(e: Event) {
	return e.composedPath().some((n) => (n as HTMLElement).classList?.contains('fractils-cancel'))
}
