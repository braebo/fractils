import type { ColorControllerElements } from './inputs/InputColor'

export function isColor(v: any): v is ColorControllerElements {
	return v?.isColor
}
