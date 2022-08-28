declare namespace svelte.JSX {
	interface HTMLProps<T> {
		/** Callback fired when element enters or exits view. */
		'onv-change'?: (event: import('./types').VisibilityEvent) => void
		/** Callback fired when element enters view. */
		'onv-enter'?: (event: import('./types').VisibilityEvent) => void
		/** Callback fired when element exits view. */
		'onv-exit'?: (event: import('./types').VisibilityEvent) => void
	}
}

declare type Direction = 'up' | 'down' | 'left' | 'right'

declare type ScrollDirection = {
	vertical?: Direction
	horizontal?: Direction
}
