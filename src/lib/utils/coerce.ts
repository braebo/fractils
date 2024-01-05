/**
 * A conditional type that coerces a string literal to a boolean or number type if it matches
 * a recognized pattern, or leaves it as a string otherwise.
 */
export type CoerceValue<T extends string> = T extends 'true'
	? true
	: T extends 'false'
		? false
		: T extends `${number}`
			? number
			: T

/**
 * Attempts to parse a string value to a boolean or number if
 * possible, returning the string unchanged if not.
 *
 * @example
 * const a = coerce('21') //=\> const a: number
 * const b = coerce('true') //=\> const b: true
 * const c = coerce('False') //=\> const c: "False"
 */
export function coerce<T extends string>(value: T): CoerceValue<T> {
	if (value === 'true') return true as CoerceValue<T>
	if (value === 'false') return false as CoerceValue<T>

	const parsedNumber = parseFloat(value)
	if (!isNaN(parsedNumber) && value.trim() !== '') return parsedNumber as CoerceValue<T>

	return value as CoerceValue<T>
}

/**
 * Takes an object with string values, returning a new object with the
 * values coerced to booleans or numbers where possible. Non-string
 * properties are left unchanged.
 */
export function coerceObject<const T extends Record<string, any>>(
	obj: T,
): { [P in keyof T]: CoerceValue<Extract<T[P], string>> } {
	const result: Partial<{ [P in keyof T]: CoerceValue<Extract<T[P], string>> }> = {}

	for (const key in obj) {
		const value = obj[key]
		result[key] = typeof value === 'string' ? coerce(value as any) : value
	}

	return result as { [P in keyof T]: CoerceValue<Extract<T[P], string>> }
}
