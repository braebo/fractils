import { isObject } from './is'

export function deepMerge<T extends {} = {}, U extends {} | undefined = {}>(
	target: T,
	...sources: U[]
): T & U {
	return sources.reduce<T & U>(
		(acc, source) => {
			if (!source) return acc

			Object.keys(source).forEach((key) => {
				const accValue = acc[key]
				const sourceValue = source[key]

				if (Array.isArray(accValue) && Array.isArray(sourceValue)) {
					acc[key] = accValue.concat(sourceValue)
				} else if (isObject(accValue) && isObject(sourceValue)) {
					acc[key] = deepMerge({ ...accValue }, sourceValue)
				} else {
					acc[key] = sourceValue
				}
			})
			return acc
		},
		{ ...target } as T & U,
	)
}
