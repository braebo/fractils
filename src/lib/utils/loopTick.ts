/**
 * A simple animation loop.  Return `true` to cancel.
 */
export function tickLoop(cb: () => boolean | undefined) {
	requestAnimationFrame(() => {
		if (!cb()) tickLoop(cb)
	})
}
