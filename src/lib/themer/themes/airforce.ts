import type { ThemeDefinition } from '../types'

import { resolveTheme } from '../resolveTheme'

export default resolveTheme({
	title: 'airforce',
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
			'light-a': '#dfe1e9',
			'light-b': '#c3c4c7',
			'light-c': '#777d8f',
			'light-d': '#5f6377',
			'light-e': '#363945',
		},
		dark: {},
		light: {},
	},
} as const satisfies ThemeDefinition)
