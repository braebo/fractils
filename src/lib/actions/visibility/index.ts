import type { Action } from 'svelte/action'

import type {
	VisibilityEventDetail,
	VisibilityOptions,
	VisibilityEvent,
	ScrollDirection,
	Direction,
	Position,
	Event,
	VisibilityAttr,
} from './types'

export type {
	VisibilityEventDetail,
	VisibilityOptions,
	VisibilityEvent,
	ScrollDirection,
	Direction,
	Position,
	Event,
}

const defaultOptions: VisibilityOptions = {
	view: null,
	margin: '0px',
	threshold: 0,
	once: false,
}

const dispatch = (node: HTMLElement, name: Event, detail: VisibilityEventDetail) => {
	node.dispatchEvent(new CustomEvent(name, { detail }))
}

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
export const visibility: Action<HTMLElement, VisibilityOptions, VisibilityAttr> = (
	node,
	options,
) => {
	const { view, margin, threshold, once }: VisibilityOptions = {
		...defaultOptions,
		...options,
	}

	let prevPos: Position = {
		x: undefined,
		y: undefined,
	}

	let scrollDirection: ScrollDirection = {
		vertical: undefined,
		horizontal: undefined,
	}

	if (typeof IntersectionObserver !== 'undefined' && node) {
		const observer = new IntersectionObserver(
			(entries, _observer) => {
				const observe = _observer.observe
				const unobserve = _observer.unobserve

				entries.forEach((singleEntry) => {
					const entry = singleEntry

					if (prevPos.y && prevPos.y > entry.boundingClientRect.y) {
						scrollDirection.vertical = 'down'
					} else {
						scrollDirection.vertical = 'up'
					}

					if (prevPos.x && prevPos.x > entry.boundingClientRect.x) {
						scrollDirection.horizontal = 'left'
					} else {
						scrollDirection.horizontal = 'right'
					}

					prevPos = {
						y: entry.boundingClientRect.y,
						x: entry.boundingClientRect.x,
					}

					const detail: VisibilityEventDetail = {
						isVisible: entry.isIntersecting,
						entry,
						scrollDirection,
						observe,
						unobserve,
					}

					dispatch(node, 'v-change', detail)

					if (entry.isIntersecting) {
						dispatch(node, 'v-enter', detail)

						once && _observer.unobserve(node)
					} else {
						dispatch(node, 'v-exit', detail)
					}
				})
			},
			{
				root: view,
				rootMargin: margin,
				threshold,
			},
		)

		observer.observe(node)

		return {
			destroy() {
				observer.unobserve(node)
			},
		}
	}

	return {}
}
