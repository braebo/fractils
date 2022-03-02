declare namespace svelte.JSX {
	interface HTMLProps<T> {
		'onf-change'?: (event: import('./types').VisibilityEvent) => void
		'onf-enter'?: (event: import('./types').VisibilityEvent) => void
		'onf-leave'?: (event: import('./types').VisibilityEvent) => void
	}
}
