import type { Input, ElementMap, InputOptions, ValidInput } from '../inputs/Input'

/**
 * Controller factory funtions create the DOM elements that are
 * used to control the inputs, and bind their change events to
 * the input's {@link Input.refresh | refresh} method.
 */
export type ControllerFactory<
	TElement extends Element | ElementMap,
	TInput extends ValidInput = ValidInput,
	TOptions extends InputOptions<any> = InputOptions,
> = (input: TInput, opts: TOptions, parent?: HTMLElement) => TElement
