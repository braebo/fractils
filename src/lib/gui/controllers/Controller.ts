import type { ElementMap, Input } from '../inputs/Input'

export abstract class Controller<TInput extends Input<any>, TElements extends ElementMap> {
	elements = {} as TElements

	constructor(public input: TInput) {}

	refresh() {}
}
