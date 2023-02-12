export interface ClickOutsideEventDetail {
	target: HTMLElement
}

/**
 * Calls `outclick` when a parent element is clicked.
 */
export type ClickOutsideEvent = CustomEvent<ClickOutsideEventDetail>

export interface ClickOutsideOptions {
	/**
	 * Array of classnames.  If the click target element has one of these classes, it will not be considered an outclick.
	 */
	whitelist?: string[]
}

// Attributes applied to the element that does use:clickOutside
export interface ClickOutsideAttr {
	'on:outclick'?: (event: ClickOutsideEvent) => void
}
