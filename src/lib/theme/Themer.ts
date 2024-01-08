/**
 * @module themer
 *
 * @description
 * Manages multiple customizable application themes.
 */

import THEME_DEFAULT from './theme-default.json'
import { hexToRgb } from '$lib/utils/hexToRgb'
import { entries } from '$lib/utils/object'
import { logger } from '$lib/utils/logger'
import { g, o } from '../utils/l'

export type ThemeName = 'theme-default' | 'theme-a' | 'theme-b' | 'theme-c' | (string & {})
export type ThemeVariant = 'light' | 'dark'
export type ThemeMode = ThemeVariant | 'system' | (string & {})
export type ThemeNode = HTMLElement | Element | null

/**
 * A theme variant config contains hex colors. All {@link ThemeConfig | ThemeConfigs}
 * contain both a light and dark variant, defined here.
 */
export interface ThemeVariantConfig {
	'brand-a': string
	'brand-b': string
	'brand-c': string
	'fg-a': string
	'fg-b': string
	'fg-c': string
	'fg-d': string
	'bg-a': string
	'bg-b': string
	'bg-c': string
	'bg-d': string
}

/**
 * Represents a theme configuration.
 */
export interface ThemeConfig {
	id: string
	name: ThemeName

	dark: ThemeVariantConfig
	light: ThemeVariantConfig
}

/**
 * Options for the {@link Themer} class.
 */
export interface ThemerOptions {
	/**
	 * Whether to automatically initialize the theme.
	 */
	autoInit?: boolean
	themes?: Array<ThemeConfig>
	theme?: ThemeName
	mode?: ThemeMode
}

/**
 * A JSON representation of the {@link Themer} class. Used in the
 * {@link Themer.toJSON | toJSON()} and {@link Themer.fromJSON | fromJSON()},
 * methods, and subsequently, in {@link Themer.save | save()}
 * and {@link Themer.load | load()}.
 */
export type ThemerJSON = {
	themes: ThemeConfig[]
	theme: ThemeName
	mode: ThemeMode
}

/**
 * Default {@link ThemerOptions} object.
 */
const THEMER_DEFAULTS = {
	autoInit: true,
	themes: [THEME_DEFAULT],
	theme: 'theme-default',
	mode: 'system',
} as const satisfies ThemerOptions

export class Themer<T extends ThemeName> {
	_theme: ThemeName | T
	_mode: ThemeMode
	themes: ThemeConfig[]

	#initialized = false
	#style!: HTMLStyleElement

	log = logger('themer', {
		fg: 'RoyalBlue',
		deferred: false,
	})

	constructor(options: ThemerOptions) {
		const opts = Object.assign({}, THEMER_DEFAULTS, options)
		this.log(g('constructor') + '()', { opts, this: this })

		this._theme = opts.theme
		this._mode = opts.mode
		this.themes = opts.themes

		if (opts.autoInit) {
			this.init()
		}
	}

	/** Initializes the Themer. */
	init() {
		this.log(o('init') + '()', { theme: this.theme, this: this })
		if (typeof document === 'undefined') return

		if (this.#initialized) return this
		this.#initialized = true

		const style = document.createElement('style')
		style.setAttribute('type', 'text/css')
		style.setAttribute('id', 'themer')
		document.head.appendChild(style)
		this.#style = style

		this.load()?.setTheme(this.theme)

		return this
	}

	/** The currently active theme. */
	get theme() {
		return this._theme
	}
	set theme(theme: ThemeName | T) {
		this._theme = theme
		this.setTheme(theme)
	}

	/** The current theme mode. */
	get mode() {
		return this._mode
	}
	set mode(mode: ThemeMode) {
		this._mode = mode
		this.setTheme(this.theme)
	}

	/** The current mode, taking into account the system preferences. */
	get activeMode(): 'light' | 'dark' {
		const mode = this.mode

		if (mode === 'system') {
			if (window.matchMedia('(prefers-color-scheme: light)').matches) {
				return 'light'
			}
			if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
				return 'dark'
			}
		}

		return mode as 'light' | 'dark'
	}

	/** The current {@link ThemeConfig} object. */
	get activeTheme() {
		return this.getThemeConfig(this.theme)
	}

	/** Adds a new theme to the Themer and saves it to localStorage. */
	addTheme(config: ThemeConfig) {
		this.log(o('addTheme') + '()', { theme: config.name, config, this: this })
		this.themes = [...new Set([...this.themes, config])]
		this.save()

		return this
	}

	/** Resolves a {@link ThemeConfig} by name. */
	getThemeConfig(theme: ThemeName | T) {
		return this.themes.find((t) => t.name === theme)
	}

	/** Changes the active theme of the application. */
	setTheme(theme: ThemeName | T) {
		if (!('document' in globalThis)) return
		this.log(o('setTheme') + '()', { theme, this: this })

		this._theme = theme

		const themeConfig = this.getThemeConfig(theme)
		if (!themeConfig) {
			this.log('themeConfig not found', { theme, this: this })
			throw new Error(`Theme "${theme}" not found.`)
		}

		const css = this.#generateCSS(themeConfig)
		this.#style.innerHTML = css

		document.body.setAttribute('theme', theme)

		this.save()

		return this
	}

	/** Updates Themer state from JSON. */
	fromJSON(json: ThemerJSON) {
		const isNewTheme = this._theme !== json.theme

		this.themes = json.themes
		this._mode = json.mode
		this._theme = json.theme

		if (isNewTheme) {
			this.setTheme(this.theme)
		}
	}

	/** Serializes the current Themer state to JSON. */
	toJSON() {
		return {
			themes: this.themes,
			theme: this.theme,
			mode: this.mode,
			// nodes: Array.from(this.nodes).map((node) => node?.id || node?.tagName || ''),
		} satisfies ThemerJSON
	}

	/**
	 * Loads Themer state from localStorage.
	 * @returns The JSON that was loaded (if found).
	 */
	load() {
		this.log(o('load') + '()', { this: this })

		if ('localStorage' in globalThis) {
			const json = localStorage.getItem('fractils::themer')

			if (json) {
				this.fromJSON(JSON.parse(json))
			}
		}

		return this
	}

	/**
	 * Saves the current Themer state to localStorage.
	 * @returns The JSON that was saved.
	 */
	save() {
		this.log(o('save') + '()', { this: this })
		if (!('localStorage' in globalThis)) return
		const json = this.toJSON()
		localStorage.setItem('fractils::themer', JSON.stringify(json))
		return json
	}

	/**
	 * Removes the current Themer state from localStorage.
	 */
	clear() {
		this.log(o('clear') + '()', { this: this })
		if (!('localStorage' in globalThis)) return
		localStorage.removeItem('fractils::themer')
	}

	/**
	 * Generates CSS custom properties from a theme config.
	 * @param config - The theme config to generate CSS from.
	 * @returns A string of CSS custom properties.
	 * @internal
	 */
	#generateCSS(config: ThemeConfig) {
		let css = ''

		for (const [key, value] of entries(config[this.activeMode])) {
			css += `--${key}: ${value};\n`
			css += `--${key}-rgb: ${hexToRgb(value)};\n`
		}

		return `body[theme=${config.name}] {\n${css}\n}`
	}
}
