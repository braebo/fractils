import type { ExtendedVars, Theme, ThemeDefinition } from './types'

import { deepMergeOpts } from '../gui/shared/deepMergeOpts'

export function resolveTheme(def: ThemeDefinition, vars: ExtendedVars = {}) {
	const color = def.resolved
		? {}
		: {
				base: def.vars.color.base,
				dark: {
					'bg-a': def.vars.color.dark?.['bg-a'] || def.vars.color.base['dark-a'],
					'bg-b': def.vars.color.dark?.['bg-b'] || def.vars.color.base['dark-b'],
					'bg-c': def.vars.color.dark?.['bg-c'] || def.vars.color.base['dark-c'],
					'bg-d': def.vars.color.dark?.['bg-d'] || def.vars.color.base['dark-d'],
					'bg-e': def.vars.color.dark?.['bg-e'] || def.vars.color.base['dark-e'],
					'fg-a': def.vars.color.dark?.['fg-a'] || def.vars.color.base['light-a'],
					'fg-b': def.vars.color.dark?.['fg-b'] || def.vars.color.base['light-b'],
					'fg-c': def.vars.color.dark?.['fg-c'] || def.vars.color.base['light-c'],
					'fg-d': def.vars.color.dark?.['fg-d'] || def.vars.color.base['light-d'],
					'fg-e': def.vars.color.dark?.['fg-e'] || def.vars.color.base['light-e'],
					...def.vars.color.dark,
				},
				light: {
					'bg-a': def.vars.color.light?.['bg-a'] || def.vars.color.base['light-a'],
					'bg-b': def.vars.color.light?.['bg-b'] || def.vars.color.base['light-b'],
					'bg-c': def.vars.color.light?.['bg-c'] || def.vars.color.base['light-c'],
					'bg-d': def.vars.color.light?.['bg-d'] || def.vars.color.base['light-d'],
					'bg-e': def.vars.color.light?.['bg-e'] || def.vars.color.base['light-e'],
					'fg-a': def.vars.color.light?.['fg-a'] || def.vars.color.base['dark-a'],
					'fg-b': def.vars.color.light?.['fg-b'] || def.vars.color.base['dark-b'],
					'fg-c': def.vars.color.light?.['fg-c'] || def.vars.color.base['dark-c'],
					'fg-d': def.vars.color.light?.['fg-d'] || def.vars.color.base['dark-d'],
					'fg-e': def.vars.color.light?.['fg-e'] || def.vars.color.base['dark-e'],
					...def.vars.color.light,
				},
			}

	const theme: Theme = {
		title: def.title,
		prefix: def.prefix || 'fractils',
		vars: deepMergeOpts([{ color }, vars, def.vars]) as Theme['vars'],
		resolved: true,
	}

	return theme
}
