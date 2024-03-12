import type { ColorControllerElements } from './inputs/InputColor'

export function isColorController(v: any): v is ColorControllerElements {
	return !!v?.isColor
}
