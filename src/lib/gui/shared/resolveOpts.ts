import { deepMerge } from '../../utils/deepMerge'

export type MaybeBooleanOrT<T> = T | boolean

export function resolveOpts<T extends {}>(
	optionsOrBoolean: MaybeBooleanOrT<Partial<T>> | undefined,
	defaultOptions: T,
): T | false {
	if (typeof optionsOrBoolean === 'undefined') {
		return defaultOptions
	}

	if (optionsOrBoolean === true) {
		return defaultOptions
	}

	if (optionsOrBoolean === false) {
		return false
	}

	if (typeof optionsOrBoolean === 'object') {
		return deepMerge([defaultOptions, optionsOrBoolean], { concatArrays: false })
	}

	return optionsOrBoolean
}
