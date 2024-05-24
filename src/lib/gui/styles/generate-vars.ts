import type { ThemeVars } from '../../css/custom-properties'
import type { ColorTheme, ThemeMode } from '../../themer/types'

import { VAR_PREFIX, GUI_VARS } from './GUI_VARS'
import { readFileSync, writeFileSync } from 'fs'
import { hexToRgb } from '../../utils/hexToRgb'
import { entries } from '../../utils/object'
import { join } from 'path'

const j = (o: any) => JSON.stringify(o, null, 2).replaceAll(/"/g, '')
const here = new URL('.', import.meta.url).pathname

console.clear()

const test = flattenAllVars(GUI_VARS as any, VAR_PREFIX)

const css = `
.fracgui-root ${j(test['base'])}

.fracgui-root[mode='dark'] ${j(test['dark'])}

.fracgui-root[mode='light'] ${j(test['light'])}
`

writeFileSync(join(here, 'gui-vars.scss'), css)

const guiScss = readFileSync(join(here, 'gui.scss'), 'utf-8')
	.split('\n')
	.filter(line => !line.trim().startsWith('//'))
	.join('\n')

const counts = [test['base'], test['dark'], test['light']].map(vars =>
	Object.entries(vars).reduce((acc, [k]) => {
		const count = (guiScss.match(new RegExp(k, 'g')) || []).length

		acc[k] = count
		return acc
	}, {} as any),
)

// @ts-expect-error
const all = Object.assign(...counts)

// @ts-expect-error
const sorted = Object.fromEntries(Object.entries(all).sort((a, b) => b[1] - a[1]))
// console.log(sorted)

writeFileSync(join(here, 'gui-vars-counts.json'), JSON.stringify(sorted, null, 2))

/**
 * Destructures theme vars into a flat object of CSS variables.
 */
function flattenAllVars(vars: Record<string, ThemeVars>, prefix: string) {
	const destructureMode = (mode: ThemeMode) => {
		const allVars = {} as Record<string, any>

		for (const [key, value] of entries(vars)) {
			if (key === 'color') {
				for (const [k, v] of [
					...entries(value['base']),
					...entries(value[mode as keyof ColorTheme]),
				]) {
					allVars[`--${prefix}-${k}`] = v
					allVars[`--${prefix}-${k}-rgb`] = hexToRgb(v as string)
				}
			} else {
				const x = vars[key]

				for (const [_mode, vars] of entries(x)) {
					if (_mode === 'base') {
						for (const [k, v] of entries(vars)) {
							allVars[`--${prefix}-${k}`] = v
						}
					} else if (_mode === mode) {
						for (const [k, v] of entries(vars)) {
							allVars[`--${prefix}-${k}`] = v
						}
					}
				}
			}
		}
		return allVars
	}

	const res = {} as any

	for (const mode of ['base', 'dark', 'light'] as ThemeMode[]) {
		res[mode] = destructureMode(mode)
	}

	return res
}
