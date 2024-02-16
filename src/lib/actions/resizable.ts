import type { ResizableOptions } from '../utils/resizable'
import type { Action } from 'svelte/action'

import { Resizable } from '../utils/resizable'

export interface ResizableEvents {
	/**
	 * Dispatched when the element is resized.
	 */
	'on:resize'?: (event: CustomEvent) => void
}

/**
 * Svelte-action version of {@link Resizable}.
 *
 * @example Basic
 * ```svelte
 * <div use:resize> Resize Me </div>
 * ```
 *
 * @example Advanced
 * ```svelte
 * <script>
 * 	import { resize } from 'fractils'
 * </script>
 *
 * <div use:resize={{
 * 	sides: ['left', 'bottom'],
 * 	grabberSize: 3,
 * 	onResize: () => console.log('resized'),
 * 	localStorageKey: 'resizable::size',
 * 	visible: false,
 * 	color: 'var(--fg-d)',
 * 	borderRadius: '0.5rem',
 * }} />
 * ```
 */
export const resizable: Action<HTMLElement, Partial<ResizableOptions> | undefined, ResizableEvents> = (
	node: HTMLElement,
	options?: Partial<ResizableOptions>,
) => {
	const resizeable = new Resizable(node, options)

	return {
		destroy: () => resizeable.dispose(),
	}
}
