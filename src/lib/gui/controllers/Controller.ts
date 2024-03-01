import type { ElementMap, Input } from '../inputs/Input'

export abstract class Controller<TInput extends Input<any>> {
	elements: ElementMap = {}

	constructor(public input: TInput) {}

	update() {}
}
