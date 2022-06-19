declare namespace svelte.JSX {
	interface HTMLProps<T> {
		onoutclick?: (event: import('./types').ClickOutsideEvent) => void
	}
}
