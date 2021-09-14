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
export function clickOutside(
	node: Element,
	callback: Function,
): ReturnType<Action> {
	const handleClick = (event: MouseEvent) => {
		if (
			node &&
			!node.contains(event.target as Node) &&
			!event.defaultPrevented
		) {
			callback();
		}
	};

	function update() {
		document.addEventListener('click', handleClick, true);
	}
	update();

	return {
		update,
		destroy() {
			document.removeEventListener('click', handleClick, true);
		},
	};
}
