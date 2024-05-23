export type ThemeTitle = string
export type ThemeVariant = 'light' | 'dark'
export type ThemeMode = ThemeVariant | 'system'

/**
 * A collection of css custom properties that can be added to {@link ThemeDefinition.vars | theme vars}.
 *
 * @remarks Defining `base`, then adding mode-specific overrides, is the intended
 * pattern for defining themes, as `dark` and `light` are typically an
 * optional `Partial` of `base`.
 */
export interface VariableDefinition {
	/** Variables applied to all modes. */
	base: Record<string, string>
	/** Optional dark-mode overrides. */
	dark: Record<string, string>
	/** Optional light-mode overrides. */
	light: Record<string, string>
}

/**
 * All themes come with a default color definition that can be overridden with partials.
 *
 * All shades have light and dark variants, allowing all other colors to adapt to the mode.
 *
 * The `light` and `dark` variables are automatically generated from the `base` colors
 * if not overridden manually.
 */
export interface ColorDefinition extends VariableDefinition {
	base: BaseColors
	dark: Partial<ModeColors> & Record<string, string>
	light: Partial<ModeColors> & Record<string, string>
}

export interface ColorTheme extends VariableDefinition {
	base: BaseColors
	dark: ModeColors & Record<string, string>
	light: ModeColors & Record<string, string>
}

/**
 * Arbitrary variables that can be added to a theme.
 */
export type ExtendedVars = {
	[key: string]: Partial<VariableDefinition>
}

/**
 * The minimum required definition for a theme.
 */
export type ThemeDefinition<T extends ExtendedVars = Record<string, any>> = {
	title: string
	prefix?: string
	vars: T & { color: ColorDefinition }
	/**
	 * Whether the theme dark/light modes have been generated
	 * from the base colors, and should not be regenerated.
	 * @internal
	 */
	resolved?: boolean
}

/**
 * A fully resolved theme with all variables applied.
 */
export type Theme<T extends ExtendedVars = Record<string, any>> = {
	title: string
	prefix: string
	vars: { color: ColorTheme } & {
		[key in keyof T]: VariableDefinition
	}
	/**
	 * Whether the theme dark/light modes have been generated
	 * from the base colors, and should not be regenerated.
	 * @internal
	 */
	resolved?: boolean
}

export type ThemeColors = BaseColors & ModeColors

export interface BaseColors {
	[key: string]: string
	'theme-a': string
	// 'theme-b': string
	// 'theme-c': string

	'dark-a': string
	'dark-b': string
	'dark-c': string
	'dark-d': string
	'dark-e': string

	'light-a': string
	'light-b': string
	'light-c': string
	'light-d': string
	'light-e': string
}

export interface ModeColors {
	[key: string]: string
	'bg-a': string
	'bg-b': string
	'bg-c': string
	'bg-d': string
	'bg-e': string

	'fg-a': string
	'fg-b': string
	'fg-c': string
	'fg-d': string
	'fg-e': string
}
