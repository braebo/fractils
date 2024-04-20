/**
 * Creates a throttled version of a function. The throttled function is
 * invoked at most once per `duration` milliseconds, and ensures that
 * the last call to the throttled function is eventually fired.
 *
 * @param fn The function to throttle.
 * @param duration The number of milliseconds to throttle invocations to.
 * @returns A throttled version of the provided function.
 */
export function throttle(
	fn: Function,
	/**
	 * The number of milliseconds to throttle invocations to.
	 * @default 50
	 */
	duration = 50,
) {
	let timeout: ReturnType<typeof setTimeout> | null
	let lastExecution = 0
	let isLastCall = false

	return function (...args: any[]) {
		const now = Date.now()
		const elapsed = now - lastExecution

		if (elapsed >= duration) {
			lastExecution = now
			fn(...args)
		} else {
			isLastCall = true
			clearTimeout(timeout!)
			timeout = setTimeout(() => {
				lastExecution = Date.now()
				if (isLastCall) {
					fn(...args)
					isLastCall = false
				}
			}, duration - elapsed)
		}
	}
}
