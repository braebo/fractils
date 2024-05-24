import type { ThemeDefinition } from '../../../themer/types'

import { resolveTheme } from '../../../themer/resolveTheme'

export default resolveTheme({
	title: 'default',
	prefix: 'fracgui',
	vars: {
		color: {
			base: {
				'theme-a': '#00bcd4',
				// 'theme-b': '#f8d2c9',
				// 'theme-c': '#ba788a',
				'dark-a': '#0B0B11',
				'dark-b': '#1b1d29',
				'dark-c': '#46465e',
				'dark-d': '#55566a',
				'dark-e': '#787b89',
				'light-a': '#ffffff',
				'light-b': '#c9ccd7',
				'light-c': '#a9adba',
				'light-d': '#777D8F',
				'light-e': '#5F6377',
			},
			dark: {},
			light: {},
		},
		core: {
			light: {
				// 'controller-dim_background': 'rgba(var(--fracgui-bg-a-rgb), 0.75)',
				'controller-dim_background': 'color-mix(in sRGB, var(--fracgui-bg-a) 75%, transparent)',
			},
		},
	},
} as const satisfies ThemeDefinition)
