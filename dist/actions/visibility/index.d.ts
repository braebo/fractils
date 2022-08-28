import './events.d';
import type { Action } from 'svelte/action';
import type { VisibilityEventDetail, VisibilityOptions, VisibilityEvent, ScrollDirection, Direction, Position, Event } from './types';
export type { VisibilityEventDetail, VisibilityOptions, VisibilityEvent, ScrollDirection, Direction, Position, Event, };
/**
 * Observes an element's current viewport visibility and dispatches relevant events.
 *
 * @param options - Optional config:
 * @param options.view - The root view (default: window)
 * @param options.margin - Margin around root view - 'px' or '%' (default: '0px')
 * @param options.threshold - % of pixels required in view to trigger event.  An array will trigger multiple events - '0-1' (default: 0)
 * @param options.once - Whether to dispatch events only once (default: false)
 *
 * @event change - Triggered when element enters or leaves view.
 * @event enter - Triggered when element enters view.
 * @event exit - Triggered when element exits view.
 *
 * @example
 *```svelte
 * <script>
 * 	let visible, scrollDir, options = {threshold: 0.25}
 *
 *  <!-- TypeScript users can import the VisibilityEvent or VisibilityEventDetail type -->
 * 	function handleChange({ detail }) {
 * 		visible = detail.isVisible
 * 		scrollDir = detail.scrollDirection
 * 	}
 * </script>
 *
 * <div
 * 	use:visibility={options}
 * 	on:v-change={handleChange}
 * 	on:v-enter={doSomething}
 * 	on:v-exit={doSomethingElse}
 * 	class:visible
 * >
 * 	{scrollDir}
 * </div>
 *
 *```
 */
export declare const visibility: Action<HTMLElement, VisibilityOptions>;
