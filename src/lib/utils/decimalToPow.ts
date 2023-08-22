/**
 * Converts a decimal to a power of 10.
 */
export function decimalToPow(value: number) {
	let pow = 1

	while (value < 1) {
		value *= 10
		pow *= 10
	}

	return pow
}
