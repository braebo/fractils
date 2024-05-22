import type { DestructuredVars, ThemeVars } from '../css/custom-properties'

import defaultTheme from '../themer/themes/default'
import { destructureVars } from '../css/custom-properties'

export type GuiCoreVars = DestructuredVars<typeof GUI_VARS_STRUCTURED, typeof VAR_PREFIX>

export const VAR_PREFIX = 'fracgui' as const

const GUI_VARS_UTILITY: ThemeVars = {
	base: {
		'font-family': "'fredoka', sans-serif",
		'shadow-lightness': '0%',
		'shadow-opacity': '0.2',
		'shadow-color': `hsla(250, 10%, var(--${VAR_PREFIX}-shadow-lightness), var(--${VAR_PREFIX}-shadow-opacity))`,
		'shadow-xs': `0rem 0.015rem 0.02rem hsl(var(--${VAR_PREFIX}-shadow-color) / 0.01),0rem 0.15rem 0.04rem hsl(var(--${VAR_PREFIX}-shadow-color) / 0.01),0rem 0.07rem 0.075rem hsl(var(--${VAR_PREFIX}-shadow-color) / 0.011),0rem 0.1rem 0.1rem hsl(var(--${VAR_PREFIX}-shadow-color) / 0.022),0rem 0.125rem 0.125rem hsl(var(--${VAR_PREFIX}-shadow-color) / 0.033),0rem 0.15rem 0.25rem hsl(var(--${VAR_PREFIX}-shadow-color) / 0.05)`,
		'font-sm': 'clamp(0.9rem, 4vw, 1rem)',
		'font-xs': 'clamp(0.75rem, 3vw, 0.9rem)',
		'radius-xs': '0.125rem',
		'radius-sm': '0.1875rem',
		radius: '0.3125rem',
		'radius-md': '0.4375rem',
		filter: 'none',
		'transition-duration': '75ms',
	},
	dark: {},
	light: {
		'shadow-lightness': '50%',
		'shadow-opacity': '0.1',
	},
} as const satisfies ThemeVars

const GUI_VARS_STRUCTURED: ThemeVars = {
	base: {
		root: {
			width: '30rem',
			'min-width': '25rem',
			'max-width': '35rem',
			'max-height': '90vh',
			'font-family': "'fredoka', sans-serif",
			opacity: '0.75',
			blur: '0.5rem',
			'box-shadow': `0 0 1.5px 0.5px rgba(var(--${VAR_PREFIX}-bg-d-rgb), 0.5) inset`,
		},
		header: {
			'font-family': "'fredoka', sans-serif",
			'font-size': `var(--${VAR_PREFIX}-font-xs)`,
			'font-weight': '500',
			height: '1.75rem',
			'letter-spacing': '0.125rem',
		},
		folder: {
			background: `rgba(var(--${VAR_PREFIX}-bg-b-rgb), 0.6)`,
			header: {
				'padding-left': '0.25rem',
				color: `var(--${VAR_PREFIX}-fg-c)`,
				dim: {
					color: `var(--${VAR_PREFIX}-fg-d)`,
				},
				background: `var(--${VAR_PREFIX}-bg-a)`,
				outline: 'none',
				'box-shadow': 'none',
				'font-size': `var(--${VAR_PREFIX}-font-sm)`,
				'font-weight': '350',
				'letter-spacing': '0.75px',
			},
			content: {
				background: `rgba(var(--${VAR_PREFIX}-bg-b-rgb), 0.2)`,
				'padding-left': '0.33rem',
				'font-size': `var(--${VAR_PREFIX}-font-xs)`,
				'font-weight': '350',
				'letter-spacing': '0.5px',
			},
		},
		toolbar: {
			icon: {
				color: `var(--${VAR_PREFIX}-bg-d)`,
				dim: { color: `var(--${VAR_PREFIX}-bg-c)` },
			},
		},
		controller: {
			'border-radius': `var(--${VAR_PREFIX}-radius-sm)`,
			'box-shadow': `-1px 1px 2px hsla(250, 10%, var(--${VAR_PREFIX}-shadow-lightness), calc(0.7 * var(--${VAR_PREFIX}-shadow-opacity))), -1px 2px 5px hsla(250, 10%, var(--${VAR_PREFIX}-shadow-lightness), var(--${VAR_PREFIX}-shadow-opacity))`,
			background: `rgba(var(--${VAR_PREFIX}-bg-c-rgb), 1)`,
			outline: `1px solid rgba(var(--${VAR_PREFIX}-bg-d-rgb), 0.4)`,
			color: `var(--${VAR_PREFIX}-fg-b)`,
			active: {
				background: `rgba(var(--${VAR_PREFIX}-bg-d-rgb), 0.75)`,
			},
			dim: {
				color: `var(--${VAR_PREFIX}-fg-c)`,
				background: `rgba(var(--${VAR_PREFIX}-bg-c-rgb), 0.75)`,
			},
		},
		input: {
			height: '2rem',
			'box-shadow': `var(--${VAR_PREFIX}-shadow-xs)`,
			'section-1': { width: 'clamp(6rem, 30%, 12rem)' },
			'section-2': { width: '4rem' },
			'section-3': { width: '100%' },
			'font-size': `var(--${VAR_PREFIX}-font-xs)`,
			'font-family': "'inconsolata', 'Comic Mono', 'Fira Code', monospace",
			container: {
				color: `var(--${VAR_PREFIX}-fg-d)`,
				dim: { color: `var(--${VAR_PREFIX}-fg-e)` },
				background: `rgba(var(--${VAR_PREFIX}-bg-a-rgb), 0.5)`,
				outline: `1px solid rgba(var(--${VAR_PREFIX}-bg-a-rgb), 0.2)`,
				'box-shadow': `-0.15px 0.1px 1px hsla(220, 10%, 2%, calc(0.2 * var(--${VAR_PREFIX}-shadow-opacity))) inset, -2px 2px 15px hsla(220, 10%, 2%, calc(0.075 * var(--${VAR_PREFIX}-shadow-opacity))) inset, -3.0px 3px 25px hsla(220, 10%, 2%, calc(0.05 * var(--${VAR_PREFIX}-shadow-opacity))) inset, -10.0px 10px 50px hsla(220, 10%, 2%, calc(0.025 * var(--${VAR_PREFIX}-shadow-opacity))) inset`,
			},
			content: {
				'box-shadow': `var(--${VAR_PREFIX}-shadow-xs)`,
			},
			number: {
				range: {
					color: `var(--${VAR_PREFIX}-bg-c)`,
					active: { color: `var(--${VAR_PREFIX}-theme-a)` },
					background: `var(--${VAR_PREFIX}-bg-a)`,
					outline: `1px solid rgba(var(--${VAR_PREFIX}-bg-c-rgb), 0.25)`,
					'box-shadow': `-2px 2px 2.5px hsla(230, 20%, 0%, 0.2), 2px 2px 5px hsla(230, 20%, 0%, 0.2), 2px 3px 10px hsla(230, 20%, 0%, 0.2), 2px 4px 4px hsla(230, 25%, 0%, 0.2)`,
				},
			},
		},
	},
	dark: {},
	light: {
		controller: {
			outline: `1px solid rgba(var(--${VAR_PREFIX}-bg-d-rgb), 0.1)`,
			background: `rgba(var(--${VAR_PREFIX}-bg-a-rgb), 1)`,
			color: `var(--${VAR_PREFIX}-fg-a)`,
			dim: {
				background: `rgba(var(--${VAR_PREFIX}-bg-a-rgb), 0.5)`,
				color: `var(--${VAR_PREFIX}-fg-c)`,
			},
		},
		input: {
			'number-range': {
				background: `var(--${VAR_PREFIX}-bg-b)`,
				color: `var(--${VAR_PREFIX}-bg-d)`,
				'box-shadow': `-2px 2px 2px hsla(230, 20%, 30%, 0.1), 2px 2px 3px hsla(230, 20%, 30%, 0.1), 2px 2px 7px hsla(230, 20%, 30%, 0.1)`,
			},
		},
	},
} as const satisfies ThemeVars

export const GUI_VARS = {
	color: defaultTheme.vars.color,
	utility: GUI_VARS_UTILITY,
	core: {
		base: destructureVars(GUI_VARS_STRUCTURED.base, VAR_PREFIX),
		dark: destructureVars(GUI_VARS_STRUCTURED.dark, VAR_PREFIX),
		light: destructureVars(GUI_VARS_STRUCTURED.light, VAR_PREFIX),
	},
}
