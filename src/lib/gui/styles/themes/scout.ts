import type { GUI_VARS } from '../GUI_VARS'
import type { ThemeDefinition } from '../../../themer/types'

import { resolveTheme } from '../../../themer/resolveTheme'

export default resolveTheme({
	title: 'scout',
	prefix: 'fracgui',
	vars: {
		color: {
			base: {
				'theme-a': '#ff4221',
				'theme-b': '#ff9215',
				'theme-c': '#ff8bd3',
				'dark-a': '#15161d',
				'dark-b': '#282a36',
				'dark-c': '#272d30',
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
		utility: {
			dark: {
				filter: 'contrast(1.05) brightness(1.05)',
			},
		},
		core: {
			dark: {
				// 'input-container_background': 'color-mix(in sRGB, var(--fracgui-bg-a) 50%, transparent)',
				'folder-header_background':
					'color-mix(in sRGB, var(--fracgui-bg-a) 100%, transparent)',
			},
			light: {
				'controller-dim_background': '#96a09c',
			},
		} as Partial<typeof GUI_VARS.core>,
	},
} as const satisfies ThemeDefinition)
