import type { JavascriptStyleProperty } from '$lib/css/types'

/**
 * A polyfill for `element.computeStyleMap()` that falls back to `getComputedStyle()` until
 * firefox catches up.
 *
 * @see {@link https://bugzilla.mozilla.org/show_bug.cgi?id=1857849|Bugzilla}
 */
export const getStyleMap = (element: Element) => {
	if (typeof element !== 'object') {
		throw new Error('element must be an object')
	}

	if ('computedStyleMap' in element) {
		return element.computedStyleMap()
	} else {
		const styles = getComputedStyle(element)
		const styleMap = new Map()

		for (let i = 0; i < styles.length; i++) {
			const property = styles[i]
			const value = styles.getPropertyValue(property)
			if (value) {
				styleMap.set(property, value)
			}
		}

		return styleMap
	}
}

export const getStyle = (element: Element, property: JavascriptStyleProperty) => {
	return getStyleMap(element).get(property as string)
}
