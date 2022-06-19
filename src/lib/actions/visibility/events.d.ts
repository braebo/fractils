declare namespace svelte.JSX {
	interface HTMLProps<T> {
		'onf-change'?: (event: import('./types').VisibilityEvent) => void
		'onf-enter'?: (event: import('./types').VisibilityEvent) => void
		'onf-leave'?: (event: import('./types').VisibilityEvent) => void
	}
}

declare type Direction = 'up' | 'down' | 'left' | 'right'

declare type ScrollDirection = {
	vertical?: Direction
	horizontal?: Direction
}
