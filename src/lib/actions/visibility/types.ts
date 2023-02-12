export type Event = 'v-change' | 'v-leave' | 'v-exit' | 'v-enter'

/**
 * Optional config
 * @param {HTMLElement} view - The root view (default: window)
 * @param {string} margin - Margin around root view - 'px' or '%' (default: '0px')
 * @param {number | number[]} threshold - % of pixels required in view to trigger event.  An array will trigger multiple events - '0-1' (default: 0).
 * @param {boolean} once - Whether to dispatch events only once (default: false)
 */
export type VisibilityOptions = {
	view?: HTMLElement | null
	margin?: string
	threshold?: number | number[]
	once?: boolean
}

export type Position = {
	x?: number
	y?: number
}

// Types below needs to be manually copied to additional-svelte.jsx.d.ts file - more details there
export type Direction = 'up' | 'down' | 'left' | 'right'

export type ScrollDirection = {
	vertical?: Direction
	horizontal?: Direction
}

export type VisibilityEventDetail = {
	isVisible: boolean
	entry: IntersectionObserverEntry
	scrollDirection: ScrollDirection
	observe: (target: Element) => void
	unobserve: (target: Element) => void
}

export type VisibilityEvent = CustomEvent<VisibilityEventDetail>

// Attributes applied to the element that does use:visibility
export interface VisibilityAttr {
	/** Callback fired when element enters or exits view. */
	'on:v-change'?: (event: VisibilityEvent) => void
	/** Callback fired when element enters view. */
	'on:v-enter'?: (event: VisibilityEvent) => void
	/** Callback fired when element exits view. */
	'on:v-exit'?: (event: VisibilityEvent) => void
}
