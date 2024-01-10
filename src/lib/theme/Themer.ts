/**
 * @module themer
 *
 * @description
 * Manages multiple customizable application themes.
 */

import THEME_DEFAULT from './themes/default.json'
import { partition } from '../utils/partition'
import { hexToRgb } from '$lib/utils/hexToRgb'
import { entries } from '$lib/utils/object'
import { logger } from '$lib/utils/logger'
import { g, o, r } from '../utils/l'

export type ThemeTitle = 'theme-default' | 'theme-a' | 'theme-b' | 'theme-c' | (string & {})
export type ThemeVariant = 'light' | 'dark'
export type ThemeMode = ThemeVariant | 'system' | (string & {})

/**
 * A theme variant config contains hex colors. All {@link ThemeConfig | ThemeConfigs}
 * contain both a light and dark variant, defined here.
 */
export interface ThemeVariantConfig {
	'brand-a': string
	'brand-b': string
	'brand-c': string
	// Foreground shades
	'fg-a': string
	'fg-b': string
	'fg-c': string
	'fg-d': string
	// Background shades.
	'bg-a': string
	'bg-b': string
	'bg-c': string
	'bg-d': string
}

/**
 * Represents a theme configuration.
 */
export interface ThemeConfig {
	title: ThemeTitle
	dark: ThemeVariantConfig
	light: ThemeVariantConfig
}

/**
 * A JSON representation of the {@link Themer} class. Used in the
 * {@link Themer.toJSON | toJSON()} and {@link Themer.fromJSON | fromJSON()},
 * methods, and subsequently, in {@link Themer.save | save()}
 * and {@link Themer.load | load()}.
 */
export interface ThemerJSON {
	themes: ThemeConfig[]
	activeTheme: ThemeTitle
	mode: ThemeMode
}

/**
 * Options for the {@link Themer} class.
 */
export interface ThemerOptions {
	/**
	 * Whether to automatically initialize the theme.
	 * @default true
	 */
	autoInit?: boolean
	/**
	 * The default theme to use.
	 * @default A theme titled 'default'.
	 */
	theme?: ThemeConfig
	themes?: Array<ThemeConfig>
	mode?: ThemeMode
}

/**
 * Default {@link ThemerOptions} object.
 */
const THEMER_DEFAULTS = {
	autoInit: true,
	themes: [],
	theme: THEME_DEFAULT,
	mode: 'system',
} as const satisfies ThemerOptions

export class Themer<T extends ThemeTitle> {
	#theme: ThemeConfig
	#mode: ThemeMode
	#themes: ThemeConfig[]

	#initialized = false
	#style!: HTMLStyleElement

	log = logger('themer', {
		fg: 'RoyalBlue',
		deferred: false,
		server: false,
	})

	constructor(options?: ThemerOptions) {
		const opts = Object.assign({}, THEMER_DEFAULTS, options)
		this.log(g('constructor') + '()', { opts, this: this })

		this.#theme = opts.theme
		this.#mode = opts.mode
		this.#themes = opts.themes
		this.addTheme(this.#theme)

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

		this.load()?.applyTheme()

		return this
	}

	/**
	 * The currently active theme.
	 */
	get theme() {
		return this.#theme
	}
	set theme(theme: ThemeConfig) {
		this.#theme = theme
		this.applyTheme()
	}

	/** The current theme mode. */
	get mode() {
		return this.#mode
	}
	set mode(mode: ThemeMode) {
		this.#mode = mode
		this.applyTheme()
	}

	/**
	 * All themes.
	 */
	get themes() {
		return this.#themes
	}
	set themes(themes: ThemeConfig[]) {
		this.#themes = themes
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
	/** Adds a new theme to the Themer and saves it to localStorage. */
	addTheme(
		newTheme: ThemeConfig,
		options?: {
			/**
			 * Whether to overwrite an existing theme with the same title,
			 * or increment the title with a number suffix.
			 * @default false
			 */
			overwrite?: boolean
			/**
			 * Whether to re-save the Themer state to localStorage
			 * after adding the new theme.
			 * @default true
			 */
			save?: boolean
		},
	) {
		this.log(o('addTheme') + '()', { theme: newTheme.title, config: newTheme, this: this })

		const overwrite = options?.overwrite ?? false
		const save = options?.save ?? true

		const [dupes, themes] = partition(this.#themes, (t) => t.title === newTheme.title)
		const alreadyExists = dupes.length > 0

		if (!overwrite && alreadyExists) {
			this.log('Incrementing theme title', { theme: newTheme.title, this: this })

			let i = 0
			while (this.#themes.find((t) => t.title === `${newTheme.title} (${++i})`)) {}
			newTheme.title = `${newTheme.title} (${i})`
		}

		this.#themes = [...themes, newTheme]

		if (save) this.save()

		return this
	}

	/** Resolves a {@link ThemeConfig} by title. */
	getThemeConfig(themeTitle: ThemeTitle | T) {
		return this.#themes.find((t) => t.title === themeTitle)
	}

	/** Changes the active theme of the application. */
	applyTheme() {
		if (!('document' in globalThis)) return

		const theme = this.#theme

		if (!theme) {
			this.log('themeConfig not found', { theme, this: this })
			throw new Error(`Theme not found.`)
		}

		const css = this.#generateCSS(theme)
		if (this.#style.innerHTML !== css) {
			this.#style.innerHTML = css
		}

		if (document.body.getAttribute('theme') !== theme.title) {
			document.body.setAttribute('theme', theme.title)
		}

		this.save()

		return this
	}

	/** Updates Themer state from JSON. */
	fromJSON(json: ThemerJSON) {
		const isNewTheme = this.#theme.title !== json.activeTheme

		const theme = this.#themes.find((t) => t.title === json.activeTheme)
		if (!theme) {
			this.log(r('Error') + ': `activeTheme` not found in `themes` array.', {
				json,
				this: this,
			})
			throw new Error(`Theme not found.`)
		}

		this.#themes = json.themes
		this.#mode = json.mode

		if (isNewTheme) {
			this.applyTheme()
		}
	}

	/** Serializes the current Themer state to JSON. */
	toJSON() {
		return {
			themes: this.#themes,
			activeTheme: this.theme.title,
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

		const exists = 'fractils::themer' in localStorage

		try {
			const identical =
				exists &&
				JSON.parse(JSON.stringify(json)) ===
					JSON.parse(localStorage.getItem('fractils::themer') || '')

			if (!identical) {
				localStorage.setItem('fractils::themer', JSON.stringify(json))
			}
		} catch (error) {
			console.error(r('Error') + ': Failed to save to localStorage.', { error, this: this })
			throw new Error(`Failed to save to localStorage.`)
		}

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

		return `body[theme=${config.title}] {\n${css}\n}`
	}
}
