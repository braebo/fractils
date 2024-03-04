/**
 * Convert number into to 2-digit hex
 * @param int - number to convert
 */
export function intToHex(int: number) {
	return int.toString(16).padStart(2, '0') as `${string | number}${string | number}`
}
