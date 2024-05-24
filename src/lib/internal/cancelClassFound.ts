/**
 * Checks if an event's composed path contains an element with the provided classname.
 */
export function composedPathContains(e: Event, classname: string) {
	return e.composedPath().some((n) => (n as HTMLElement).classList?.contains(classname))
}
