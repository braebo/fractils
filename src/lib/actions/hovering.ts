import type { Action } from 'svelte/action'

export interface HoveringOptions {
	/**
	 * The rate at which to poll for hovering, in milliseconds. Set to
	 * `0` to disable polling.
	 * @default 100
	 */
	pollRate: number
	/**
	 * Whether to include focus state.
	 * @default true
	 */
	focus: boolean
}

export interface HoveringAttributes {
	/**
	 * Dispatched when the user hovers over the element (or focuses it, if `focus` is `true`).
	 */
	'on:hoverIn'?: (event: CustomEvent) => void
	/**
	 * Dispatched when the user stops hovering over the element (or blurs it, if `focus` is `true`).
	 */
	'on:hoverOut'?: (event: CustomEvent) => void
}

export const HOVERING_DEFAULTS: HoveringOptions = {
	pollRate: 500,
	focus: true,
}

export const hovering: Action<
	HTMLElement,
	Partial<HoveringOptions> | undefined,
	HoveringAttributes
> = (node, options = HOVERING_DEFAULTS) => {
	const opts = Object.assign({}, HOVERING_DEFAULTS, options)

	let timeout: number | null = null
	let hovering = false

	const hoverIn = () => {
		hovering = true
		node.dispatchEvent(new CustomEvent('hoverIn'))

		node.removeEventListener('mouseenter', hoverIn)
		if (opts.focus) {
			node.removeEventListener('focus', hoverIn)
		}

		node.addEventListener('mouseleave', hoverOut)
		if (opts.focus) {
			node.addEventListener('blur', hoverOut)
		}

		pollHover()
	}

	const hoverOut = () => {
		hovering = false
		node.dispatchEvent(new CustomEvent('hoverOut'))

		node.removeEventListener('mouseleave', hoverOut)
		if (opts.focus) {
			node.removeEventListener('blur', hoverOut)
		}

		node.addEventListener('mouseenter', hoverIn)
		if (opts.focus) {
			node.addEventListener('focus', hoverIn)
		}
	}

	node.removeEventListener('mouseenter', hoverIn)
	if (opts.focus) {
		node.removeEventListener('focus', hoverIn)
	}

	const pollHover = () => {
		if (hovering) {
			// Sometimes the browser misses the mouseleave event, so we need to
			// check if the mouse is still over the element.
			if (document.activeElement !== node) {
				console.log('pollHover bail!')
				hoverOut()
				return
			}

			console.log('pollHover')

			timeout = window.setTimeout(() => {
				pollHover()
			}, opts.pollRate)
		}
	}

	pollHover()

	return {
		destroy() {
			node.removeEventListener('mouseenter', hoverIn)
			node.removeEventListener('focus', hoverIn)

			node.removeEventListener('mouseleave', hoverOut)
			node.removeEventListener('blur', hoverOut)

			if (timeout) {
				window.clearTimeout(timeout)
			}
		},
	}
}
