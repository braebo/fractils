/**
 * Regex to extract the inner variable name from a CSS variable.
 * @example
 * | `rgba(var(--var-rgb), 0.5)`.match(CSS_VAR_INNER)[0]
 * > '--var-rgb'
 */
// export const CSS_VAR_INNER = /\bvar\(--([a-zA-Z0-9_-]+)\)/g
export const CSS_VAR_INNER = /\bvar\((--[a-zA-Z0-9_-]+)\)/g

/**
 * Regex to match a CSS variable.
 * @example
 * | `rgba(var(--var-rgb), 0.5)`.match(CSS_VAR)[0]
 * > 'var(--var-rgb)'
 */
export const CSS_VAR = /(?:var\()(!?[a-z-]+)/g
