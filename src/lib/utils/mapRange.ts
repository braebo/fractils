/**
 *  Maps a value from one range to another
 *
 * @param value - the value to map
 * @param x1 - lower bound of the input range
 * @param x2 - upper bound of the input range
 * @param y1 - lower bound of the output range
 * @param y2 - upper bound of the output range
 * @returns a number mapped from the input range to the output range
 */
export const mapRange = (value: number, x1: number, x2: number, y1: number, y2: number) =>
	((value - x1) * (y2 - y1)) / (x2 - x1) + y1
