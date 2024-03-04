export const CSS_INTEGER = '[-\\+]?\\d+%?' // https://www.w3.org/TR/css3-values/#integers
export const CSS_NUMBER = '[-\\+]?\\d*\\.\\d+%?' // http://www.w3.org/TR/css3-values/#number-value

// Allow positive/negative integer/number. Don't capture the either/or, just the entire outcome
export const CSS_UNIT = '(?:' + CSS_NUMBER + ')|(?:' + CSS_INTEGER + ')'

// Parse function params
// Parens and commas are optional, and this also allows for whitespace between numbers
export const PERMISSIVE_MATCH_3 =
	'[\\s|\\(]+(' + CSS_UNIT + ')[,|\\s]+(' + CSS_UNIT + ')[,|\\s]+(' + CSS_UNIT + ')\\s*\\)?'
export const PERMISSIVE_MATCH_4 =
	'[\\s|\\(]+(' +
	CSS_UNIT +
	')[,|\\s]+(' +
	CSS_UNIT +
	')[,|\\s]+(' +
	CSS_UNIT +
	')[,|\\s]+(' +
	CSS_UNIT +
	')\\s*\\)?'

// Regex patterns for functional color strings
export const REGEX_FUNCTIONAL_RGB = new RegExp('rgb' + PERMISSIVE_MATCH_3)
export const REGEX_FUNCTIONAL_RGBA = new RegExp('rgba' + PERMISSIVE_MATCH_4)
export const REGEX_FUNCTIONAL_HSL = new RegExp('hsl' + PERMISSIVE_MATCH_3)
export const REGEX_FUNCTIONAL_HSLA = new RegExp('hsla' + PERMISSIVE_MATCH_4)

// Color string parsing regex
export const HEX_START = '^(?:#?|0x?)'
export const HEX_INT_SINGLE = '([0-9a-fA-F]{1})'
export const HEX_INT_DOUBLE = '([0-9a-fA-F]{2})'

export const REGEX_HEX_3 = new RegExp(
	HEX_START + HEX_INT_SINGLE + HEX_INT_SINGLE + HEX_INT_SINGLE + '$',
)
export const REGEX_HEX_4 = new RegExp(
	HEX_START + HEX_INT_SINGLE + HEX_INT_SINGLE + HEX_INT_SINGLE + HEX_INT_SINGLE + '$',
)
export const REGEX_HEX_6 = new RegExp(
	HEX_START + HEX_INT_DOUBLE + HEX_INT_DOUBLE + HEX_INT_DOUBLE + '$',
)
export const REGEX_HEX_8 = new RegExp(
	HEX_START + HEX_INT_DOUBLE + HEX_INT_DOUBLE + HEX_INT_DOUBLE + HEX_INT_DOUBLE + '$',
)
