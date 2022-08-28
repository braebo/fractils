import './events.d';
import type { Action } from 'svelte/action';
export interface ClickOutsideOptions {
    /**
     * Array of classnames.  If the click target element has one of these classes, it will not be considered an outclick.
     */
    whitelist?: string[];
}
/**
 * Calls a function when the user clicks outside the element.
 * @example
 * ```svelte
 * <div on:outclick={someFunction} use:clickOutside={{ whitelist: ['.burger'] }}>
 * ```
 */
export declare const clickOutside: Action<Element, ClickOutsideOptions>;
