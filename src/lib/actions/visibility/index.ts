// adapted from https://github.com/maciekgrzybek/svelte-inview

import type { Detail, Options, Position, ScrollDirection, Event } from './types'
import type { Action } from '../types'

const defaultOptions: Options = {
	view: null,
	margin: '0px',
	threshold: 0,
	once: false,
}

const createEvent = (name: Event, detail: Detail): CustomEvent<Detail> =>
	new CustomEvent(name, { detail })

/**
 *
 * Observes an element's current viewport visibility and dispatches relevant events.
 *
 * @param {Options} options - Optional config:
 * @param {HTMLElement} options.view - The root view (default: window)
 * @param {string} options.margin - Margin around root view - 'px' or '%' (default: '0px')
 * @param {number | number[]} options.threshold - % of pixels required in view to trigger event.  An array will trigger multiple events - '0-1' (default: 0)
 * @param {boolean} options.once - Whether to dispatch events only once (default: false)
 *
 * @event change - Triggered when element enters or leaves view
 * @event enter - Triggered when element enters view
 * @event leave - Triggered when element leaves view
 *
 * @example
 *```svelte
 * <script>
 * 	import type { VisibilityEvent } from 'fractils';
 * 
 * 	let visible, scrollDir, options = {threshold: 0.25}
 *
 * 	function handleChange(event: VisibilityEvent) {
 * 		visible = event.detail.isVisible
 * 		scrollDir = event.detail.scrollDirection
 * 	}
 * </script>
 *
 * <div
 * 	use:visibility={options}
 * 	on:change={handleChange}
 * 	on:enter={doSomething}
 * 	on:leave={doSomethingElse}
 * 	class:visible
 * >
 * 	{scrollDir}
 * </div>
 *
 *```
 */
export function visibility(node: HTMLElement, options?: Options): ReturnType<Action> | void {
	const { view, margin, threshold, once }: Options = {
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

					const detail: Detail = {
						isVisible: entry.isIntersecting,
						entry,
						scrollDirection,
						observe,
						unobserve,
					}

					node.dispatchEvent(createEvent('change', detail))

					if (entry.isIntersecting) {
						node.dispatchEvent(createEvent('enter', detail))

						once && _observer.unobserve(node)
					} else {
						node.dispatchEvent(createEvent('leave', detail))
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
}
