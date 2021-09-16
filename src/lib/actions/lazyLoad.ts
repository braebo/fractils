//? Adapted from swyx - https://github.com/sw-yx/svelte-actions/blob/main/src/lazyload.ts

import type { Action } from './types'

const lazyLoadHandleIntersection: IntersectionObserverCallback = (entries) => {
	entries.forEach((entry) => {
		if (!entry.isIntersecting) {
			return
		}

		if (!(entry.target instanceof HTMLElement)) {
			return
		}

		let node = entry.target
		let attributes = lazyLoadNodeAttributes.find(
			(item) => item.node === node,
		)?.attributes
		Object.assign(node, attributes)

		lazyLoadObserver.unobserve(node)
	})
}

let lazyLoadObserver: IntersectionObserver
let lazyLoadNodeAttributes: Array<{ node: HTMLElement; attributes: Object }> =
	[]

interface IntersectionObserverOptions {
	root?: Element | null
	rootMargin?: string
	threshold?: number
}

let options = {
	root:
		typeof document != 'undefined'
			? document?.querySelector('#scrollArea')
			: null,
	rootMargin: '0px',
	threshold: 1.0,
}

/**
 * Attach onto any image to lazy load it
 * @param options - optional config object
 * @param options.root - The base element used to calculate the threshold
 * @param options.rootMargin -   The base element used to calculate the threshold
 * @param options.threshold - The threshold used to trigger the intersection obeserver
 *
 * @example
 *  <img use:lazyLoad={{src:"/myimage"}} alt="">
 */
export function lazyLoad(
	node: HTMLElement,
	attributes: Object,
	options: IntersectionObserverOptions = {
		rootMargin: '0px',
		threshold: 1.5,
	},
): ReturnType<Action> {
	if (!lazyLoadObserver) {
		lazyLoadObserver = new IntersectionObserver(
			lazyLoadHandleIntersection,
			options,
		)
	}
	lazyLoadNodeAttributes.push({ node, attributes })

	lazyLoadObserver.observe(node)
	return {
		destroy() {
			lazyLoadObserver.unobserve(node)
		},
	}
}
