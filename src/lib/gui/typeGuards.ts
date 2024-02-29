import type { ColorControllerElements } from './inputs/Color'

export function isColor(v: any): v is ColorControllerElements {
	return v?.isColor
}
