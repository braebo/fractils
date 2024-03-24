import type { ThemeDefinition } from '../types'

import { resolveTheme } from '../resolveTheme'

export default resolveTheme({
	title: 'theme-1',
	color: {
		base: {
			'theme-a': '#ff4221',
			'theme-b': '#ff9215',
			'theme-c': '#ff8bd3',
			'dark-a': '#15161d',
			'dark-b': '#282a36',
			'dark-c': '#1d252e',
			'dark-d': '#3a3a44',
			'dark-e': '#4d4d58',
			'light-a': '#ffffff',
			'light-b': '#dfe1e9',
			'light-c': '#c3c4c7',
			'light-d': '#777d8f',
			'light-e': '#5f6377',
		},
		dark: {},
		light: {},
	},
} as const satisfies ThemeDefinition)
