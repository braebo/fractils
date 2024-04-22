/**
 * Regex to extract the inner variable name from a CSS variable.
 * @example
 * | `rgba(var(--my-color), 0.5)`.match(CSS_VAR_INNER)[0]
 * > '--my-color'
 */
export const CSS_VAR_INNER = /\bvar\((--[a-zA-Z0-9_-]+)\)/g

/**
 * Regex to match a CSS variable.
 * @example
 * | `rgba(var(--my-color), 0.5)`.match(CSS_VAR)[0]
 * > 'var(--my-color)'
 */
export const CSS_VAR_OUTER = /(?:var\()(!?[a-z-]+)/g
