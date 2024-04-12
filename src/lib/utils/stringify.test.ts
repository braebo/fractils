import { stringify } from './stringify'
import { test, expect } from 'vitest'

test('stringify', () => {
	const obj = {
		number: 1,
		string: 'str',
		boolean: true,
		null: null,
		undefined: undefined,
		nested: { a: { b: 'obj.nested' as unknown } },
		array: [1, 2, 3],
		function: () => {},
		get circular() {
			return this
		},
	}
	obj.nested.a.b = obj.nested

	const result = stringify(obj, 2)

	const expected = `{
  "number": 1,
  "string": "str",
  "boolean": true,
  "null": null,
  "undefined": "undefined",
  "nested": {
    "a": {
      "b": "[Circular ~.nested]"
    }
  },
  "array": [
    1,
    2,
    3
  ],
  "function": "function",
  "circular": "[Circular ~]"
}`

	expect(result).toBe(expected)
})
