/**
 * Parse hex str to an int
 * @param str - hex string to parse
 */
export function parseHexInt(str: `${string}${string}`): number {
	if (str.length !== 2) throw new Error('Invalid hex string: ' + str)
	return parseInt(str, 16)
}
