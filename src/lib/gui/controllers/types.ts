import type { Input, ElementMap, InputOptions, ValidInputs } from '../inputs/Input'

/**
 * Controller factory funtions create the DOM elements that are
 * used to control the input, and bind their change events to
 * the input's {@link Input.refresh | updateState} method.
 */
export type ControllerFactory<
	TElement extends Element | ElementMap,
	TInput extends ValidInputs = ValidInputs,
	TOptions extends InputOptions<any> = InputOptions,
> = (input: TInput, opts: TOptions, parent?: HTMLElement) => TElement
