import { entries } from '../utils/object'

/**
 * Represents a structured mapping to CSS custom properties, facilitating the
 * definition and organization of CSS variables in a hierarchical manner. Each
 * key in the nested structure corresponds to a fragment of a CSS variable name,
 * enabling a structured and readable way to define and access CSS variables.
 *
 * For example, the following object structure:
 * ```ts
 * {
 *   input: {
 *     checkbox: {
 *       color: 'red'
 *     }
 *   }
 * }
 * ```
 * Represents this CSS variable:
 * ```css
 * { --input-checkbox_color: red; }
 * ```
 *
 * The rules for defining structured variables are as follows:
 * - Each key represents a fragment of the CSS variable name. Fragments are
 *   concatenated with a hyphen `-`,  except for the last fragment, which is
 *   concatenated with an underscore `_` to the preceding fragment(s).
 * - The last key in each branch (each leaf node) must be a valid CSS property,
 *   such as `color`, `min-width`, etc.
 * - The value assigned to the last fragment represents the CSS variable's value.
 *
 * This interface is intended to be used in contexts where CSS variables are
 * dynamically generated or  managed in Typescript, such as the {@link Themer}.
 */
export interface StructuredVars {
	[key: string]: string | StructuredVars
}

type Entries = Array<[string, string]> | IterableIterator<[string, string]>

// Limits the depth of the recursive type.
type Prev = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
type AccumulateKeys<T, Prefix extends string = '', Depth extends number = 10> = Depth extends 0
	? never
	: T extends object
		? {
				[K in keyof T]: K extends string
					? T[K] extends Record<string, any>
						? `${Prefix}${K}-` extends `${infer Rest}-`
							? AccumulateKeys<T[K], `${Rest}-`, Prev[Depth]>
							: never
						: `${Prefix}${K}` extends `${infer Rest}`
							? `${Rest}_${K}`
							: never
					: never
			}[keyof T]
		: ''

type FlattenStructuredVars<T, P extends string> = {
	[K in AccumulateKeys<T> as `--${P}-${K}`]: string
}

type DestructuredVars<T extends StructuredVars, Prefix extends string = ''> = FlattenStructuredVars<
	T,
	Prefix
>

/**
 * Converts a {@link StructuredVars} object into a flat object of CSS variables.
 * @example
 * const vars = { root: { header: { width: '1rem' }, // etc... }
 *
 * destructureVars(vars) // { '--root-header_width': '1rem' }
 */
export function destructureVars<const T extends StructuredVars, const P extends string>(
	vars: T,
	_prefix: P,
) {
	const flatVars: Record<string, string> = {}

	function destructure(o: Record<string, any>, prefix: string = '') {
		for (const [k, v] of entries(o)) {
			if (typeof v === 'object') {
				destructure(v, `${prefix ? prefix + '-' : ''}${k}`)
			} else {
				flatVars[`${prefix ? prefix + '_' : ''}${k}`] = v
			}
		}
	}

	destructure(vars)

	return flatVars as Partial<DestructuredVars<T, P>>
}

/**
 * Converts a flat object/map/entries of CSS variables into a {@link StructuredVars} object.
 *
 * @example
 * ```ts
 * // This array of entries:
 * restructure([[ '--root-folder_max-height', '1rem' ]])
 * // is structured into:
 * { root: { folder: { 'max-height': '1rem' } }
 * ```
 */
export function restructureVars(
	entries: [string, string][] | Map<string, string> | Record<string, string>,
): StructuredVars {
	if (entries instanceof Map) {
		return unroll(entries.entries())
	} else if (Array.isArray(entries)) {
		return unroll(entries)
	} else {
		return unroll(Object.entries(entries))
	}
}

function unroll(entries: Entries): StructuredVars {
	const structuredVars: StructuredVars = {}

	for (const [key, value] of entries) {
		const parts = key.split(/[_-]/)
		let current = structuredVars

		for (let i = 0; i < parts.length - 1; i++) {
			current[parts[i]] ||= {}

			current = current[parts[i]] as StructuredVars
		}

		current[parts[parts.length - 1]] = value
	}

	return structuredVars
}
