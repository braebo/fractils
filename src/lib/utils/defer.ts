export const defer =
	typeof globalThis?.window?.requestIdleCallback !== 'undefined'
		? globalThis.window.requestIdleCallback
		: typeof requestAnimationFrame !== 'undefined'
		? requestAnimationFrame
		: // @ts-expect-error - This _is_ a number but they typed it as a Timeout?
		  (fn: () => void) => setTimeout(fn, 0) as number;

export const cancelDefer =
	typeof globalThis?.window?.cancelIdleCallback !== 'undefined'
		? globalThis.window.cancelIdleCallback
		: typeof cancelAnimationFrame !== 'undefined'
		? cancelAnimationFrame
		: clearTimeout;
