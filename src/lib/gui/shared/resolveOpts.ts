import { deepMergeOpts } from './deepMergeOpts'

export type MaybeBooleanOrT<T> = T | boolean

/**
 * - If {@link maybeT} is `undefined`, returns {@link tDefaults}.
 * - If {@link maybeT} is `true`, returns {@link tDefaults}.
 * - If {@link maybeT} is `false`, returns `false`.
 * - If {@link maybeT} is an object, it's returned merged with {@link tDefaults}.
 * @param maybeT The provided options or a boolean value.
 * @param tDefaults The fallback options to use if {@link maybeT} is `true`.  If
 * {@link maybeT} is an object, it will be merged with these defaults.
 */
export function resolveOpts<T extends {}>(
	maybeT: MaybeBooleanOrT<Partial<T>> | undefined,
	tDefaults: T,
): T | false {
	if (typeof maybeT === 'undefined') {
		return tDefaults
	}

	if (maybeT === true) {
		return tDefaults
	}

	if (maybeT === false) {
		return false
	}

	if (typeof maybeT === 'object') {
		return deepMergeOpts([tDefaults, maybeT], { concatArrays: false })
	}

	return maybeT
}
