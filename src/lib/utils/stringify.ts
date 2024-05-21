/**
 * JSON.stringify() with circular reference support.
 * - Circular references are replaced with the string `[Circular ~<path>]`
 * where `<path>` is the path to the circular reference.
 * - `undefined` -\> `"undefined"`
 * - `function` -\> `"function"`
 *
 * @param obj - The object to stringify.
 * @param indentation - Number of spaces for indentation. Optional.
 */
export const stringify = (input: unknown, indentation = 0) => {
	const stack = [] as unknown[]
	return JSON.stringify(input, serialize(stack), indentation)
}

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
export function serialize(stack: unknown[]) {
	const keys: string[] = []

	return function (this: unknown, key: string, value: unknown): unknown {
		if (typeof value === 'undefined') return
		if (typeof value === 'function') return '[Function]'

		let thisPos = stack.indexOf(this)
		if (thisPos !== -1) {
			stack.length = thisPos + 1
			keys.length = thisPos
			keys[thisPos] = key
		} else {
			stack.push(this)
			keys.push(key)
		}

		let valuePos = stack.indexOf(value)
		if (valuePos !== -1) {
			return '[Circular ~' + keys.slice(0, valuePos).join('.') + ']'
		}

		if (value instanceof Set) {
			return Array.from(value)
		}

		if (value instanceof Map) {
			return Object.fromEntries(
				Array.from(value.entries()).map(([k, v]) => {
					const newStack = [...stack]
					return [k, JSON.parse(JSON.stringify(v, serialize(newStack)))]
				}),
			)
		}

		if (value instanceof Element) {
			return `${value.tagName}#${value.id}.${Array.from(value.classList).join('.')}`
		}

		if (stack.length > 0) {
			stack.push(value)
		}

		return value
	}
}

const test = stringify(
	{
		foo: 'bar',
		baz: new Map([['foo', 'bar']]),
	},
	2,
)
console.log(test)
