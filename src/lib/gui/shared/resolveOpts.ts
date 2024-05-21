import { deepMergeOpts } from './deepMergeOpts'

export type MaybeBooleanOrT<T> = T | boolean

/**
 *
 * @param optionsOrBoolean The provided options or a boolean value.
 * @param defaultOptions The fallback options to use if {@link optionsOrBoolean} is `true`.  If
 * {@link optionsOrBoolean} is an object, it will be merged with these defaults.
 * @returns
 */
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
		return deepMergeOpts([defaultOptions, optionsOrBoolean], { concatArrays: false })
	}

	return optionsOrBoolean
}
