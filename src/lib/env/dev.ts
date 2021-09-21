import { browser } from './browser'

export const dev =
	import.meta.env != undefined
		? import.meta.env.DEV
		: (() => {
				if (!browser) return
				if (typeof process != 'undefined') {
					return process.env?.NODE_ENV === 'development'
				} else {
					return false
				}
		  })()
