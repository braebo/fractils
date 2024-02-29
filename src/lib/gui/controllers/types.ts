import type { Input, ElementMap, InputOptions } from '../inputs/Input'

/**
 * Controller factory funtions create the DOM elements that are
 * used to control the input, and bind their change events to
 * the input's {@link Input.updateState | updateState} method.
 */
export type ControllerFactory<
	TElement extends Element | ElementMap,
	TInput extends Input = Input<any>,
	TOptions extends InputOptions<any> = InputOptions,
> = (input: TInput, opts: TOptions, parent?: HTMLElement) => TElement
