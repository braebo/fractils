import type { Action } from 'svelte/action'

export type Event = 'v-change' | 'v-leave' | 'v-exit' | 'v-enter'

export type Position = {
	x?: number
	y?: number
}

// Types below need to be manually copied to additional-svelte.jsx.d.ts file - more details there
export type Direction = 'up' | 'down' | 'left' | 'right'

export type ScrollDirection = {
	vertical?: Direction
	horizontal?: Direction
}

export type VisibilityEventDetail = {
	isVisible: boolean
	entry: IntersectionObserverEntry
	scrollDirection: ScrollDirection
	observe: (target: Element) => void
	unobserve: (target: Element) => void
}

export type VisibilityEvent = CustomEvent<VisibilityEventDetail>

export interface VisibilityAttr {
	/** Callback fired when element enters or exits view. */
	'on:v-change'?: (event: VisibilityEvent) => void
	/** Callback fired when element enters view. */
	'on:v-enter'?: (event: VisibilityEvent) => void
	/** Callback fired when element exits view. */
	'on:v-exit'?: (event: VisibilityEvent) => void
}

/**
 * Optional config for `visibility` action.
 */
export type VisibilityOptions = {
	/**
	 * The root view.
	 * @default window
	 */
	view?: HTMLElement | null
	/**
	 * Margin around root view - 'px' or '%'.
	 * @default '0px'
	 */
	margin?: string
	/**
	 * % of pixels required in view to trigger event.  An array will trigger multiple events - '0-1'.
	 * @default 0
	 */
	threshold?: number | number[]
	/**
	 * Whether to dispatch events only once.
	 * @default false
	 */
	once?: boolean
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
 * Events:
 * - on:change - Triggered when element enters or leaves view.
 * - on:enter - Triggered when element enters view.
 * - on:exit - Triggered when element exits view.
 *
 * @param options - Optional config, see {@link VisibilityOptions}.
 *
 * @example
 *```svelte
 * <script>
 * 	let visible, scrollDir, options = {threshold: 0.25}
 *
 * 	// TypeScript users can import the VisibilityEvent or VisibilityEventDetail type
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
	node: HTMLElement,
	options: VisibilityOptions,
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

	if (node && typeof IntersectionObserver !== 'undefined') {
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
