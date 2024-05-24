import type { PropertiesHyphen } from 'csstype'

/**
 * All valid CSS Property names (e.g. `background-color`).
 */
export type CSSProperty = keyof PropertiesHyphen

/**
 * All valid Javascript Style Properties names (e.g. `backgroundColor`).
 */
export type JavascriptStyleProperty = {
	[K in keyof CSSStyleDeclaration]: CSSStyleDeclaration[K] extends string ? K : never
}[keyof CSSStyleDeclaration] &
	string

/**
 * A CSS variable reference value, used to reference other CSS variables.
 * @see [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)
 */
export type CSSCustomProperty = `--${string}_${keyof PropertiesHyphen}` | CSSVariableReferenceValue

/**
 * A CSS variable reference value, used to reference other CSS variables.
 * @see [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/var)
 */
export type CSSVariableReferenceValue = `var(${string})`
