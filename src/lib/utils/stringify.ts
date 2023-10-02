/**
 * JSON.stringify() with circular reference support.
 * - Circular references are replaced with the string `[Circular ~<path>]`
 * where `<path>` is the path to the circular reference.
 * - `undefined` -> `"undefined"`
 * - `function` -> `"function"`
 *
 * @param obj - The object to stringify.
 * @param indentation - Number of spaces for indentation. Optional.
 */
export const stringify = (input: unknown, indentation = 0) =>
	JSON.stringify(input, serialize(), indentation);

/**
 * Replaces circular references, undefined values, and functions with strings.
 * - Circular references are replaced with the string `[Circular ~<path>]`
 * where `<path>` is the path to the circular reference relative to the
 * root object, i.e. `[Circular ~.b.c]`.
 * - `undefined` values are replaced with the string `"undefined"`.
 * - Functions are replaced with the string `"function"`.
 *
 * @returns A replacer function for JSON.stringify.
 */
export function serialize() {
	const stack: unknown[] = [],
		keys: string[] = [];

	return function (this: unknown, key: string, value: unknown): unknown {
		if (typeof value === 'undefined') return 'undefined';
		if (typeof value === 'function') return 'function';

		let thisPos = stack.indexOf(this);
		if (thisPos !== -1) {
			stack.length = thisPos + 1;
			keys.length = thisPos;
			keys[thisPos] = key;
		} else {
			stack.push(this);
			keys.push(key);
		}

		let valuePos = stack.indexOf(value);
		if (valuePos !== -1) {
			return '[Circular ~' + keys.slice(0, valuePos).join('.') + ']';
		}

		if (stack.length > 0) {
			stack.push(value);
		}

		return value;
	};
}
