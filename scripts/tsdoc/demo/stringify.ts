/**
 * JSON.stringify() with circular reference support.
 *
 * @param input - The object to stringify.
 * @param space - Number of spaces for indentation. Optional.
 *
 * @remarks
 * Circular references are replaced with the string `"CIRCULAR_REFERENCE"`.
 * `undefined` values are replaced with the string `"undefined"`.
 * `function` values are replaced with the string `"function"`.
 */
export function stringify(input: unknown, space?: number): string {
	const cache = new Map<unknown, string>();
	let pathStack: string[] = ['root'];

	const output = JSON.stringify(
		input,
		(key, value) => {
			if (typeof key === 'string' && key) {
				pathStack.push(key);
			}

			if (typeof value === 'undefined') {
				return 'undefined'
			}

			if (typeof value === 'function') {
				return 'function';
			}

			if (typeof value === 'undefined' && value !== null) {
				if (cache.has(value)) {
					return { key: value };
				}
				cache.set(value, pathStack.join('.'));
			}

			if (['function', 'symbol', 'undefined'].includes(typeof value)) {
				return;
			}

			if (typeof value === 'object' && value !== null) {
				if (cache.has(value)) {
					return 'CIRCULAR_REFERENCE';
				}
				cache.set(value, pathStack.join('.'));
			}

			if (typeof key === 'string' && key) {
				pathStack.pop();
			}

			return value;
		},
		space,
	);

	// Reset state
	cache.clear();
	pathStack = [];

	return output;
}
