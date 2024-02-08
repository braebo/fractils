import { Logger } from './logger'
import { c, r } from './l'

const log = new Logger('select', { fg: 'AliceBlue' })

export type ElementsOrSelectors = string | HTMLElement | (string | HTMLElement)[] | undefined

/**
 * Takes in any combination of selectors and elements, and
 * resolves them all into an array of HTMLElements.
 */
export function select(input: ElementsOrSelectors, node?: HTMLElement): HTMLElement[] {
	if (typeof window === 'undefined') return []

	if (input === undefined) return []

	const elements = Array.isArray(input) ? input : [input]

	node ??= document.documentElement

	return elements.flatMap((el): HTMLElement[] => {
		if (el instanceof HTMLElement) return [el]

		const foundEls = node!.querySelectorAll<HTMLElement>(el)
		if (foundEls.length === 0) {
			log.error(r(`No elements found for selector`) + ': ' + c(el))
			throw new Error(
				`No elements found for selector "${el}". Make sure the selector is a child of the target node.`,
			)
		}
		return Array.from(foundEls)
	})
}
