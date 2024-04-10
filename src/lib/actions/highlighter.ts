import type { HighlightOptions } from '../utils/highlight'
import type { Action } from 'svelte/action'

import { highlight, HIGHLIGHT_DEFAULTS } from '../utils/highlight'
import { logger } from '../utils/logger'

const DEBUG = true
const log = logger('highlight', { fg: '#94b8ff', deferred: true, browser: DEBUG })

export interface HighlightEventDetail {
	/**
	 * The element that was highlighted.
	 */
	target: HTMLElement
	/**
	 * The highlighted text.
	 */
	text: string
}

export type HighlightEvent = CustomEvent<HighlightEventDetail>

export interface HighlightAttr {
	'on:highlight'?: (event: HighlightEvent) => void
}

/**
 * A syntax highlighter action.
 * @example
 * ```svelte
 * <pre use:highlight={{ lang: 'json' }}>
 * 	{JSON.stringify({ hello: 'world' }, null, 2)}
 * </pre>
 * ```
 */
export const highlighter: Action<HTMLElement, HighlightOptions, HighlightAttr> = (
	node: HTMLElement,
	options: Partial<HighlightOptions>,
) => {
	const opts = { ...HIGHLIGHT_DEFAULTS, ...options }

	let text = node.textContent || ''
	const lang = opts.lang
	const theme = opts.theme

	log('initializing', { lang, theme })

	highlight(text, opts).then((highlighted) => {
		node.innerHTML = highlighted

		node.dispatchEvent(
			new CustomEvent('highlight', {
				detail: {
					target: node,
					text,
					highlighted,
				},
			}),
		)
	})

	return {
		update: (newOptions: HighlightOptions) => (options = { ...options, ...newOptions }),
		destroy() {},
	}
}
