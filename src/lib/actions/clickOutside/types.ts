export type ClickOutsideEventDetail = {
	target: HTMLElement
}

/**
 * Calls `outclick` when a parent element is clicked.
 */
export type ClickOutsideEvent = CustomEvent<ClickOutsideEventDetail>
