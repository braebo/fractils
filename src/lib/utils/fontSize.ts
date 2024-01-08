import { BROWSER } from 'esm-env'

/**
 * Gets the font size of the root element (on the
 * server, this will always return `16px`).
 */
export const fontSize: `${number}px` = !BROWSER
	? '16px'
	: (window
			.getComputedStyle(document.documentElement)
			.getPropertyValue('font-size') as `${number}px`)
