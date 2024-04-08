import type { ThemeDefinition } from '../types'

import { resolveTheme } from '../resolveTheme'

export default resolveTheme({
	title: 'flat',
	prefix: 'fracgui',
	vars: {
		color: {
			base: {
				'theme-a': '#00bcd4',
				'theme-b': '#f8d2c9',
				'theme-c': '#ba788a',
				'dark-a': '#0B0B11',
				'dark-b': '#15161D',
				'dark-c': '#1F202D',
				'dark-d': '#353746',
				'dark-e': '#474A5B',
				'light-a': '#ffffff',
				'light-b': '#dfe1e9',
				'light-c': '#BABECA',
				'light-d': '#777D8F',
				'light-e': '#5F6377',
			},
			dark: {},
			light: {},
		},
	},
} as const satisfies ThemeDefinition)
