import type { Theme, ThemeDefinition } from './types'

export function resolveTheme(def: ThemeDefinition): Theme {
	return {
		title: def.title,
		color: {
			base: def.color.base,
			dark: {
				'bg-a': def.color.dark?.['bg-a'] || def.color.base['dark-a'],
				'bg-b': def.color.dark?.['bg-b'] || def.color.base['dark-b'],
				'bg-c': def.color.dark?.['bg-c'] || def.color.base['dark-c'],
				'bg-d': def.color.dark?.['bg-d'] || def.color.base['dark-d'],
				'bg-e': def.color.dark?.['bg-e'] || def.color.base['dark-e'],
				'fg-a': def.color.dark?.['fg-a'] || def.color.base['light-a'],
				'fg-b': def.color.dark?.['fg-b'] || def.color.base['light-b'],
				'fg-c': def.color.dark?.['fg-c'] || def.color.base['light-c'],
				'fg-d': def.color.dark?.['fg-d'] || def.color.base['light-d'],
				'fg-e': def.color.dark?.['fg-e'] || def.color.base['light-e'],
			},
			light: {
				'bg-a': def.color.light?.['bg-a'] || def.color.base['light-a'],
				'bg-b': def.color.light?.['bg-b'] || def.color.base['light-b'],
				'bg-c': def.color.light?.['bg-c'] || def.color.base['light-c'],
				'bg-d': def.color.light?.['bg-d'] || def.color.base['light-d'],
				'bg-e': def.color.light?.['bg-e'] || def.color.base['light-e'],
				'fg-a': def.color.light?.['fg-a'] || def.color.base['dark-a'],
				'fg-b': def.color.light?.['fg-b'] || def.color.base['dark-b'],
				'fg-c': def.color.light?.['fg-c'] || def.color.base['dark-c'],
				'fg-d': def.color.light?.['fg-d'] || def.color.base['dark-d'],
				'fg-e': def.color.light?.['fg-e'] || def.color.base['dark-e'],
			},
		},
	}
}
