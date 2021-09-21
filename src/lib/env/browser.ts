export const browser =
	import.meta.env != undefined
		? !import.meta.env.SSR
		: typeof globalThis.window !== 'undefined' &&
		  typeof globalThis.window.document !== 'undefined'
