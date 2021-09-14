import type { Action } from './types';
/**
 *
 * Calls a function when the user clicks outside the element.
 *
 * @param {Function} callback - The function to call.
 *
 * @example
 * <div use:clickOutside={someFunc}>
 *
 */
export declare function clickOutside(node: Element, callback: Function): ReturnType<Action>;
