/**
 * @module themer
 *
 * @description
 *
 * Themer is a module that allows you to change the theme of the application.
 */

import THEME_DEFAULT from './theme-default.json'
import { hexToRgb } from '$lib/utils/hexToRgb'
import { entries } from '$lib/utils/object'
import { logger } from '$lib/utils/logger'
import { writable } from 'svelte/store'
import { DEV } from 'esm-env'

export type ThemeName = 'theme-default' | 'theme-a' | 'theme-b' | 'theme-c' | (string & {})
export type ThemeVariant = 'light' | 'dark'
export type ThemeMode = ThemeVariant | 'system' | (string & {})
export type ThemeNode = HTMLElement | Element | null

export interface ThemeVariantConfig {
	'fg-a': string
	'fg-b': string
	'fg-c': string
	'fg-d': string
	'bg-a': string
	'bg-b': string
	'bg-c': string
	'bg-d': string
}

export interface ThemeConfig {
	id: string
	name: ThemeName

	'brand-a': string
	'brand-b': string
	'brand-c': string

	dark: ThemeVariantConfig
	light: ThemeVariantConfig
}

export interface ThemerOptions {
	/**
	 * Whether to automatically initialize the theme.
	 */
	autoInit?: boolean
	themes?: Array<ThemeConfig>
	theme?: ThemeName
	mode?: ThemeMode
	nodes?: ThemeNode[]
}

export type ThemerJSON = {
	themes: ThemeConfig[]
	theme: ThemeName
	mode: ThemeMode
	nodes: string[]
}

const THEMER_DEFAULTS = {
	themes: [THEME_DEFAULT],
	theme: 'theme-default',
	mode: 'system',
	nodes: [] as ThemeNode[],
} as const satisfies ThemerOptions

const log = logger('themer', {
	fg: 'RoyalBlue',
	deferred: false,
})

export class Themer<T extends ThemeName> {
	themes: ThemeConfig[]

	_theme: ThemeName | T
	/**
	 * The currently active theme.
	 */
	get theme() {
		return this._theme
	}
	set theme(theme: ThemeName | T) {
		this._theme = theme
		this.setTheme(theme)
	}

	/**
	 * The current theme mode.
	 */
	mode: ThemeMode
	nodes: Set<ThemeNode>
	#style!: HTMLStyleElement

	get activeTheme() {
		return this.getTheme(this.theme)
	}

	get activeMode() {
		switch (this.mode) {
			case 'light':
			case 'dark':
				return this.mode
			case 'system':
				return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
			default:
				return 'dark'
		}
	}

	constructor(options: ThemerOptions) {
		const opts = Object.assign({}, THEMER_DEFAULTS, options)
		log('constructor()', { opts, this: this })

		this._theme = opts.theme
		this.themes = opts.themes
		this.mode = opts.mode

		this.nodes = new Set()
		for (const node of opts.nodes) {
			// if (typeof node === 'undefined' || !node) continue
			this.nodes.add(node)
		}

		if (opts.autoInit) {
			this.init()
		}
	}

	init() {
		log('init()', { theme: this.theme, this: this })
		if (typeof document === 'undefined') return

		this.#style ||= this.#createStyleElement()
		this.setTheme(this.theme)
		// this.#update()
	}

	#createStyleElement() {
		const style = document.createElement('style')
		style.setAttribute('type', 'text/css')
		style.setAttribute('id', 'themer')
		document.head.appendChild(style)
		return style
	}

	addTheme(config: ThemeConfig) {
		log('addTheme', { theme: config.name, config, this: this })
		this.themes.push(config)
	}

	getTheme(theme: ThemeName | T) {
		return this.themes.find((t) => t.name === theme)
	}

	setTheme(theme: ThemeName | T) {
		if (!('document' in globalThis)) return
		log('setTheme', { theme, this: this })

		document.documentElement.setAttribute('data-theme', theme)
		this._theme = theme

		const themeConfig = this.getTheme(theme)
		if (!themeConfig) {
			log('themeConfig not found', { theme, this: this })
			throw new Error(`Theme "${theme}" not found.`)
		}

		const css = this.#generateCSS(themeConfig)
		this.#style.innerHTML = css

		document.body.setAttribute('theme', theme)
	}

	#generateCSS(config: ThemeConfig) {
		let css = ''

		const mode = this.activeMode

		const visit = (config: ThemeConfig | ThemeVariantConfig) => {
			for (const [key, value] of entries(config)) {
				if (key === 'id') continue
				if (key === 'name') continue

				if (typeof value === 'object') {
					if (key === mode) {
						visit(value)
					}
					continue
				}

				if (typeof value !== 'string') {
					if (DEV) {
						console.error('non-string value', { key, value, this: this })
					}
					continue
				}

				css += `--${key}: ${value};\n`
				css += `--${key}-rgb: ${hexToRgb(value)};\n`
			}
		}

		visit(config)

		return `body[theme=${config.name}] {\n${css}\n}`
	}
}
