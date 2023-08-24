import type { Action } from 'svelte/action';

/**
 * Options for the `add` action.
 */
export interface AddOptions {
	/** The class(es) to add to the element. */
	class?: string | string[];
	/**
	 * The target element.  Defaults to the element itself,
	 * but can be used to target a child element.
	 * @returns The new target element.
	 * @example
	 * ```svelte
	 * <div use:add={{ target: (node) => node.firstChild }}>
	 * ```
	 */
	target?: (
		/** The dom element using the action. */
		node: HTMLElement,
	) => HTMLElement;
	transform?: (node: HTMLElement) => void;
}

const ADD_OPTIONS_DEFAULTS = {
	class: '' as string | string[],
	target: (node: HTMLElement) => node,
} as const satisfies AddOptions;

/**
 * Calls a function when the user clicks outside the element.
 * @example
 * ```svelte
 * <div on:outclick={someFunction} use:add={{ whitelist: ['.burger'] }}>
 * ```
 */
export const add: Action<Element, AddOptions> = (node, options = {}) => {
	const { class: c } = { ...ADD_OPTIONS_DEFAULTS, ...options };
	Array.isArray(c) ? node.classList.add(...c) : node.classList.add(c);
};
