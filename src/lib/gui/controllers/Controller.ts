import type { ElementMap, Input } from '../inputs/Input'

export abstract class Controller<
	TInput extends Input<any> = Input<any>,
	TElements extends ElementMap = ElementMap,
> {
	elements = {} as TElements

	constructor(public input: TInput) {}

	refresh() {}
}
