declare namespace svelte.JSX {
	interface HTMLProps<T> {
		/**
		 * A callback function to run when ClickOutsideEvent fires.
		 */
		onoutclick?: (event: import('./types').ClickOutsideEvent) => void
	}
}
