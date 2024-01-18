export const defer =
	typeof requestIdleCallback !== 'undefined'
		? requestIdleCallback
		: typeof requestAnimationFrame !== 'undefined'
			? requestAnimationFrame
			: (fn: () => void) => setTimeout(fn, 0) as unknown as number // node types are wrong..?

export const cancelDefer =
	typeof globalThis?.window?.cancelIdleCallback !== 'undefined'
		? globalThis.window.cancelIdleCallback
		: typeof cancelAnimationFrame !== 'undefined'
			? cancelAnimationFrame
			: clearTimeout
