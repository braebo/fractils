export type ThemeSetting = 'light' | 'dark' | 'system'
export type ThemeMode = 'light' | 'dark'

export type Theme = {
	title: string
	color: {
		base: BaseColors
		dark: ModeColors
		light: ModeColors
	}
}

export type ThemeDefinition = {
	title: string
	color: {
		base: BaseColors
		dark?: Partial<ModeColors>
		light?: Partial<ModeColors>
	}
}

interface BaseColors {
	[key: string]: string
	'theme-a': string
	'theme-b': string
	'theme-c': string

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

interface ModeColors {
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
