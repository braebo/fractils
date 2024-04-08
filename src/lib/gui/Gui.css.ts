import type { Folder } from './Folder'

import type { VariableDefinition } from '../themer/types'
import { entries } from '../utils/object'
import { isColor } from '../color/color'
import { isString } from '../utils/is'

export const VAR_PREFIX = 'fracgui' as const

const GUI_VARS_UTILITY = {
	base: {
		'font-family': "'fredoka', sans-serif",
		'shadow-lightness': '0%',
		'shadow-opacity': '0.2',
		// 'shadow-color': '220, 10%, 2%',
		'shadow-color': `hsla(250, 10%, var(--${VAR_PREFIX}-shadow-lightness), var(--${VAR_PREFIX}-shadow-opacity))`,
		'shadow-xs': `0rem 0.015rem 0.02rem hsl(var(--${VAR_PREFIX}-shadow-color) / 0.01),0rem 0.15rem 0.04rem hsl(var(--${VAR_PREFIX}-shadow-color) / 0.01),0rem 0.07rem 0.075rem hsl(var(--${VAR_PREFIX}-shadow-color) / 0.011),0rem 0.1rem 0.1rem hsl(var(--${VAR_PREFIX}-shadow-color) / 0.022),0rem 0.125rem 0.125rem hsl(var(--${VAR_PREFIX}-shadow-color) / 0.033),0rem 0.15rem 0.25rem hsl(var(--${VAR_PREFIX}-shadow-color) / 0.05)`,
		'font-sm': 'clamp(0.9rem, 4vw, 1rem)',
		'font-xs': 'clamp(0.75rem, 3vw, 0.9rem)',
		// todo - make sure there aren't more missing
		'radius-xs': '0.125rem',
		'radius-sm': '0.1875rem',
		radius: '0.3125rem',
		'radius-md': '0.4375rem',
	},
	dark: {},
	light: {
		'shadow-lightness': '50%',
		'shadow-opacity': '0.1',
	},
}

export const GUI_VARS_STRUCTURED = {
	base: {
		root: {
			width: '30rem',
			'min-width': '25rem',
			'max-width': '35rem',
			'font-size': `var(--${VAR_PREFIX}-font-sm)`,
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
			background: `rgba(var(--${VAR_PREFIX}-bg-b-rgb), 0.5)`,
			header: {
				'padding-left': '0.25rem',
				color: `var(--${VAR_PREFIX}-fg-c)`,
				'dim-color': `var(--${VAR_PREFIX}-fg-d)`,
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
			radius: `var(--${VAR_PREFIX}-radius-sm)`,
			'box-shadow': `-1px 1px 2px hsla(250, 10%, var(--${VAR_PREFIX}-shadow-lightness), calc(0.7 * var(--${VAR_PREFIX}-shadow-opacity))), -1px 2px 5px hsla(250, 10%, var(--${VAR_PREFIX}-shadow-lightness), var(--${VAR_PREFIX}-shadow-opacity))`,
			background: `rgba(var(--${VAR_PREFIX}-bg-c-rgb), 1)`,
			outline: `1px solid rgba(var(--${VAR_PREFIX}-bg-d-rgb), 0.4)`,
			color: `var(--${VAR_PREFIX}-fg-b)`,
			active: {
				background: `rgba(var(--${VAR_PREFIX}-bg-d-rgb), 0.75)`,
			},
			dim: {
				color: `var(--${VAR_PREFIX}-fg-d)`,
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
			color: 'var(--${VAR_PREFIX}-fg-a)',
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
} as const

export const GUI_VARS_MAP = {
	// utility: mapVars(GUI_VARS_STRUCTURED.utility),
	base: mapVars([GUI_VARS_UTILITY.base, GUI_VARS_STRUCTURED.base]),
	dark: mapVars([GUI_VARS_UTILITY.dark, GUI_VARS_STRUCTURED.dark]),
	light: mapVars([GUI_VARS_UTILITY.light, GUI_VARS_STRUCTURED.light]),
}

export const GUI_VARS = {
	base: Object.fromEntries(GUI_VARS_MAP.base),
	dark: Object.fromEntries(GUI_VARS_MAP.dark),
	light: Object.fromEntries(GUI_VARS_MAP.light),
} as const satisfies VariableDefinition

// export const applyVars = (node: HTMLElement, mode: 'dark' | 'light' = 'dark') => {
// 	apply(GUI_VARS_MAP[mode])

// 	function apply(vars: Map<string, string>) {
// 		for (const [k, v] of vars) {
// 			node.style.setProperty(k, v)
// 		}
// 	}
// }

export function mapVars(objects: Record<string, any>[]) {
	const css = new Map<string, string>()

	function parse(o: Record<string, any>, prefix: string = '' /*`--${VAR_PREFIX}`*/) {
		for (const [k, v] of entries(o)) {
			if (typeof v === 'object') {
				parse(v, `${prefix ? prefix + '-' : ''}${k}`)
			} else {
				css.set(`${prefix ? prefix + '-' : ''}${k}`, v)
			}
		}
	}

	for (const o of objects) {
		parse(o)
	}

	return css
}

function generateVarCss() {
	let css = ''

	css += `.fracgui-root {\n`
	for (const [k, v] of GUI_VARS_MAP.dark) {
		css += `\t${k}: ${v};\n`
	}
	css += `}\n\n`

	css += `.fracgui-root[mode='light'] {`
	for (const [k, v] of GUI_VARS_MAP.light) {
		css += `\t${k}: ${v};\n`
	}
	css += `}\n`

	return css
}

export function injectVarCss() {
	const style = document.createElement('style')
	style.textContent = generateVarCss()
	document.head.appendChild(style)
}

//!
//! todo - Refactor this to use the new structured vars
//!

export function generateVarGui(
	vars: Map<string, string>,
	target: HTMLElement,
	parentFolder: Folder,
) {
	const PART_LENGTH = 1
	const PREFIX_REGEX = new RegExp(`^${VAR_PREFIX}-`)
	const folders = new Map<string, Folder>()

	let currentFolder = parentFolder
	// let currentFolderTitle = currentFolder.title
	let topFolder = currentFolder
	// let topFolderTitle = currentFolderTitle

	for (const [key, v] of vars) {
		const k = key.replace(PREFIX_REGEX, '')
		const parts = k.split('-')

		topFolder = currentFolder
		for (let i = 0; i < parts.length - PART_LENGTH; i++) {
			const folderName = parts[i]
			if (!folders.has(folderName)) {
				const newFolder = currentFolder.addFolder({ title: folderName })
				folders.set(folderName, newFolder)
			}
			currentFolder = folders.get(folderName)!
			// currentFolderTitle = currentFolder.title
		}

		const propertyName =
			parts.length >= PART_LENGTH ? parts.slice(-PART_LENGTH).join(' ') : parts[0]

		const innerVars = v.match(/(var\(--.+?\))/g)

		let value = v
		if (innerVars) {
			console.log('multiVar', innerVars)
			for (const innerVar of innerVars) {
				const innerVarKey = innerVar.slice(4, -1)
				const innerVarValue = target.style.getPropertyValue(innerVarKey)

				value = value.replace(innerVar, innerVarValue)

				if (value === '') {
					value = vars.get(innerVarKey) ?? ''

					if (value === '') {
						console.error({
							k,
							v,
							vars,
							innerVarKey,
							innerVarValue,
						})
						throw new Error('innerVarValue not found:' + innerVarKey)
					}
				}
			}
			console.log('value', value)
		}

		currentFolder
			.add({
				title: propertyName,
				value,
			})
			.onChange(v => {
				if (isColor(v)) {
					console.log(k, 'isColor=true', v.hex8String)
					target.style.setProperty(`--${key}`, v.hex8String)
					console.log('propertyValue', target.style.getPropertyValue(`--${key}`))
					return
				}

				if (isString(v)) {
					target.style.setProperty(key, v)
					return
				}

				throw new Error('Unsupported value type: ' + v)
			})

		currentFolder = topFolder
	}
	// delete empty folders
	for (const f of folders.values()) {
		if (f.controls.size === 0) {
			f.dispose()
		} else {
			f.close()
		}
	}
}
