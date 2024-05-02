import type { Folder } from './Folder'

import { entries } from '$lib/utils/object'

export const VAR_PREFIX = 'fracgui' as const

export const GUI_VARS_ROOT = {
	//- Globals
	[`${VAR_PREFIX}-root_width` as const]: '30rem',
	[`${VAR_PREFIX}-min-width` as const]: '25rem',
	[`${VAR_PREFIX}-max-width` as const]: '35rem',
	[`${VAR_PREFIX}-max-height` as const]: '80vh',
	[`${VAR_PREFIX}-header_height` as const]: '1.75rem',
	[`${VAR_PREFIX}-root-alpha` as const]: '0.75',
	[`${VAR_PREFIX}-root-blur` as const]: '0.5rem',
	[`${VAR_PREFIX}_font-family` as const]: 'fredoka, sans-serif',
	// [`${VAR_PREFIX}-font-mono` as const]: 'var(--font-mono)',

	[`${VAR_PREFIX}-root-header_font-size` as const]: 'clamp(0.75rem, 3vw, 0.9rem)',
	[`${VAR_PREFIX}-root-header_font-weight` as const]: '500',
	[`${VAR_PREFIX}-root-header_height` as const]: '1.75rem',
	[`${VAR_PREFIX}-root-header_letter-spacing` as const]: '0.125rem',
	//- Root Folder
	[`${VAR_PREFIX}-root-content_background` as const]:
		'rgba(var(--bg-b-rgb), var(--fracgui-root-alpha))',
	[`${VAR_PREFIX}-root-shadow` as const]: '0 0 1.5px 0.5px rgba(var(--bg-d-rgb), 0.5) inset',
	//- Folders
	[`${VAR_PREFIX}-folder_background` as const]: 'rgba(var(--bg-b-rgb), 0.5)',
	//- Folder Header
	[`${VAR_PREFIX}-folder-header_padding-left` as const]: '0.25rem',
	[`${VAR_PREFIX}-folder-header_color` as const]: 'var(--fg-c)',
	[`${VAR_PREFIX}-folder-header-dim_color` as const]: 'var(--fg-d)',
	[`${VAR_PREFIX}-folder-header_background` as const]: 'var(--bg-a)',
	[`${VAR_PREFIX}-folder-header_outline` as const]: 'none',
	[`${VAR_PREFIX}-folder-header_box-shadow` as const]: 'none',
	[`${VAR_PREFIX}-folder-header_font-size` as const]: 'var(--font-sm)',
	[`${VAR_PREFIX}-folder-header_font-weight` as const]: '350',
	[`${VAR_PREFIX}-folder-header_letter-spacing` as const]: '0.75px',
	//- Folder Toolbar
	[`${VAR_PREFIX}-toolbar-icon-dim_color` as const]: 'var(--bg-c)',
	[`${VAR_PREFIX}-toolbar-icon_color` as const]: 'var(--bg-d)',
	//- Folder Content
	[`${VAR_PREFIX}-folder-content_background` as const]: 'rgba(var(--bg-b-rgb), 0.2)',
	[`${VAR_PREFIX}-folder-content_padding-left` as const]: '0.33rem',
	[`${VAR_PREFIX}-folder-content_font-size` as const]: 'clamp(0.75rem, 3vw, 0.9rem)',
	[`${VAR_PREFIX}-folder-content_font-weight` as const]: '350',
	[`${VAR_PREFIX}-folder-content_letter-spacing` as const]: '0.5px',
	//- Controllers
	[`${VAR_PREFIX}-controller_border-radius` as const]: 'var(--radius-sm)',
	[`${VAR_PREFIX}-controller-shadow` as const]: `-1px 1px 2px hsla(250, 10%, var(--shadow-lightness), calc(0.7 * var(--shadow-alpha))), -1px 2px 5px hsla(250, 10%, var(--shadow-lightness), var(--shadow-alpha))`,
	[`${VAR_PREFIX}-controller_background` as const]: 'rgba(var(--bg-c-rgb), 1)',
	[`${VAR_PREFIX}-controller-dim_background` as const]: 'rgba(var(--bg-c-rgb), 0.75)',
	[`${VAR_PREFIX}-controller-active_background` as const]: 'rgba(var(--bg-d-rgb), 0.75)',
	[`${VAR_PREFIX}-controller_color` as const]: 'var(--fg-b)',
	[`${VAR_PREFIX}-controller-dim_color` as const]: 'var(--fg-d)',
	//- Inputs
	[`${VAR_PREFIX}-input_height` as const]: '2rem',
	[`${VAR_PREFIX}-input_font-size` as const]: 'clamp(0.75rem, 3vw, 0.9rem)',
	[`${VAR_PREFIX}-input-section-1_width` as const]: 'clamp(6rem, 30%, 12rem)',
	[`${VAR_PREFIX}-input-section-2_width` as const]: '4rem',
	[`${VAR_PREFIX}-input-section-3_width` as const]: '100%',
	[`${VAR_PREFIX}-input-container_color` as const]: 'var(--fg-d)',
	[`${VAR_PREFIX}-input-container-dim_color` as const]: 'var(--fg-e)',
	[`${VAR_PREFIX}-input-container_background` as const]: 'rgba(var(--bg-a-rgb), 0.5)',
	[`${VAR_PREFIX}-input-container_outline` as const]: '1px solid rgba(var(--bg-a-rgb), 0.2)',
	[`${VAR_PREFIX}-input-container-shadow` as const]: `-0.15px 0.1px 1px hsla(220, 10%, 2%, calc(0.2 * var(--shadow-alpha))) inset, -2px 2px 15px hsla(220, 10%, 2%, calc(0.075 * var(--shadow-alpha))) inset, -3.0px 3px 25px hsla(220, 10%, 2%, calc(0.05 * var(--shadow-alpha))) inset, -10.0px 10px 50px hsla(220, 10%, 2%, calc(0.025 * var(--shadow-alpha))) inset`,
	[`${VAR_PREFIX}-drawer-toggle_background` as const]: 'rgba(var(--bg-a-rgb), 0.5)',
	//- Input Content
	[`${VAR_PREFIX}-input-content-shadow` as const]: 'var(--shadow-xs)',
	[`${VAR_PREFIX}-input-content-outline` as const]: '1px solid rgba(var(--bg-d-rgb), 0.4)',
	//- Number Input
	//- Range Input
	[`${VAR_PREFIX}-input-number-range_color` as const]: 'var(--bg-c)',
	[`${VAR_PREFIX}-input-number-range-active_color` as const]: 'var(--theme-a)',
	[`${VAR_PREFIX}-input-number-range_background` as const]: 'var(--bg-a)',
	[`${VAR_PREFIX}-input-number-range_outline` as const]: '1px solid rgba(var(--bg-c-rgb), 0.25)',
	[`${VAR_PREFIX}-input-number-range_box-shadow` as const]: `-2px 2px 2.5px hsla(230, 20%, 0%, 0.2), 2px 2px 5px hsla(230, 20%, 0%, 0.2), 2px 3px 10px hsla(230, 20%, 0%, 0.2), 2px 4px 4px hsla(230, 25%, 0%, 0.2)`,
} as const satisfies Record<string, string | Record<string, string>>

export const GUI_VARS_LIGHT = {
	[`${VAR_PREFIX}-controller-dim_background` as const]: 'rgba(var(--bg-a-rgb), 0.5)',
	[`${VAR_PREFIX}-controller_background` as const]: 'rgba(var(--bg-a-rgb), 1)',
	[`${VAR_PREFIX}-controller_color` as const]: 'var(--fg-a)',
	[`${VAR_PREFIX}-controller-dim_color` as const]: 'var(--fg-c)',
	[`${VAR_PREFIX}-input-outline` as const]: '1px solid rgba(var(--bg-d-rgb), 0.1)',
	[`${VAR_PREFIX}-input-number-range_background` as const]: 'var(--bg-b)',
	[`${VAR_PREFIX}-input-number-range_color` as const]: 'var(--bg-d)',
	[`${VAR_PREFIX}-input-number-range_box-shadow` as const]: `-2px 2px 2px hsla(230, 20%, 30%, 0.1), 2px 2px 3px hsla(230, 20%, 30%, 0.1), 2px 2px 7px hsla(230, 20%, 30%, 0.1)`,
} as const satisfies Record<string, string | Record<string, string>>

export const GUI_VARS = {
	dark: GUI_VARS_ROOT,
	light: Object.assign({}, GUI_VARS_ROOT, GUI_VARS_LIGHT),
}

export const GUI_VARS_MAP = new Map<string, string>(
	entries(Object.assign({}, GUI_VARS.dark, GUI_VARS.light)),
)

export function generateKindMap() {
	const kindMap = new Map<string, string>()
	for (const [k, v] of GUI_VARS_MAP) {
		let kind = ''
		if (k.match(/color|background|bg-|fg-|theme-/)) {
			kind = 'color'
		} else if (k.match(/width|height|padding|margin/)) {
			kind = 'width'
		} else if (k.match(/font-weight/)) {
			kind = 'font-weight'
		} else if (k.match(/font-size/)) {
			kind = 'font-size'
		} else if (k.match(/font-family/)) {
			kind = 'font-family'
		} else if (k.match(/font/)) {
			kind = 'font'
		} else if (k.match(/shadow/)) {
			kind = 'box-shadow'
		} else if (k.match(/alpha/)) {
			kind = 'opacity'
		} else if (k.match(/radius/)) {
			kind = 'border-radius'
		} else if (k.match(/outline/)) {
			kind = 'outline'
		} else if (v.startsWith('#')) {
			kind = 'color'
		} else if (v.endsWith('px')) {
			kind = 'width'
		} else if (v.endsWith('rem')) {
			kind = 'width'
		} else if (v.endsWith('em')) {
			kind = 'width'
		} else if (v.match(/rgba\(/)) {
			kind = 'color'
		} else {
			throw new Error('kind not found for:' + `${k}: ${v}`)
		}
		// const key = k.replace(VAR_PREFIX + '-', '')

		if (!CSS.supports(kind, v)) {
			throw new Error('Unsupported CSS property value: ' + `${kind}: ${v}`)
		}

		kindMap.set(k, kind)
	}

	return kindMap
}

console.log(Object.fromEntries(GUI_VARS_MAP))

export function generateVarGui(target: HTMLElement, parentFolder: Folder) {
	const kindMap = generateKindMap()
	const PART_LENGTH = 1
	const PREFIX_REGEX = new RegExp(`^${VAR_PREFIX}-`)
	const folders = new Map<string, Folder>()

	let currentFolder = parentFolder
	let topFolder = currentFolder

	outer: for (const [key, v] of GUI_VARS_MAP) {
		const k = key.replace(PREFIX_REGEX, '')
		const parts = k.split('-')

		topFolder = currentFolder
		for (let i = 0; i < parts.length - PART_LENGTH; i++) {
			const folderName = parts[i]
			if (!folders.has(folderName)) {
				const newFolder = currentFolder.addFolder({ title: folderName, closed: false })
				folders.set(folderName, newFolder)
			}
			currentFolder = folders.get(folderName)!
		}

		const propertyName =
			parts.length >= PART_LENGTH ? parts.slice(-PART_LENGTH).join(' ') : parts[0]

		console.log('k', k)
		console.log('v', v)

		const innerVars = v.match(/(var\(--.+?\))/g)

		let value = v
		if (innerVars) {
			for (const innerVar of innerVars) {
				const innerVarKey = innerVar.slice(4, -1)
				const innerVarValue = target.style.getPropertyValue(innerVarKey)
				if (innerVarValue === '') {
					console.error(`innerVarValue not found: ${innerVarKey}.  Skipping.`)
					continue outer
				}
				value = value.replace(innerVar, innerVarValue)
				if (value === '') {
					value = GUI_VARS_MAP.get(innerVarKey) ?? ''
					if (value === '') {
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
			.on('change', v => {
				const kind = kindMap.get(k)

				if (!kind) {
					throw new Error('kind not found for: ' + `${k}: ${v}`)
				}

				console.log(kind, CSS.supports(kind, v))

				if (CSS.supports(kind, v)) {
					target.style.setProperty('--' + k, v)
				}
			})

		currentFolder = topFolder
	}

	// delete empty folders
	for (const f of folders.values()) {
		if (f.inputs.size === 0) {
			f.dispose()
		} else {
			f.close()
		}
	}
}
