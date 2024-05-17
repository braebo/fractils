import { Logger } from './logger'
import { c, r } from './l'

let log: Logger

export type ElementOrSelector = string | HTMLElement | undefined | 'document' | 'window'
export type ElementsOrSelectors = ElementOrSelector | ElementOrSelector[]

/**
 * Takes in any combination of selectors and elements, and
 * resolves them all into an array of HTMLElements.
 */
export function select(input: ElementsOrSelectors, node?: HTMLElement): HTMLElement[] {
	log ??= new Logger('select', { fg: 'AliceBlue' })

	if (typeof window === 'undefined') return []

	if (input === undefined) return []

	const elements = Array.isArray(input) ? input : [input]

	node ??= document.documentElement

	return elements.flatMap((el): HTMLElement[] => {
		if (!el) return []

		if (el instanceof HTMLElement) return [el]
		// @ts-expect-error - (document instanceof Document) is always `true`, so this is safe..
		if (el instanceof Document) {
			return [document.documentElement]
		}

		if (typeof el === 'string') {
			if (el === 'document' || el === 'window') return [document.documentElement]
			if (el.startsWith('#')) {
				const foundEl = document.getElementById(JSON.stringify(el).slice(1))
				if (foundEl) {
					return [foundEl]
				} else {
					log.debug(r(`No element found width id: `) + ': ' + c(el))
					log.debug(r(`Make sure the selector is a child of the target node.`))
					log.debug({ input, node, elements })

					return []
				}
			}
		}

		const foundEls = node!.querySelectorAll<HTMLElement>(el)
		if (foundEls.length === 0) {
			log.debug(r(`No elements found for selector`) + ': ' + c(el))
			log.debug(r(`Make sure the selector is a child of the target node.`))
			log.debug({ input, node, elements })

			return []
		}
		return Array.from(foundEls)
	})
}
