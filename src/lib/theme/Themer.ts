/**
 * @module themer
 *
 * @description
 * Manages multiple customizable application themes.
 */

import { state, type PrimitiveState, type State } from '../utils/state'
import THEME_DEFAULT from './themes/default.json'
import { partition } from '../utils/partition'
import { hexToRgb } from '../utils/hexToRgb'
import { entries } from '../utils/object'
import { logger } from '../utils/logger'
import { c, g, o, r } from '../utils/l'
import { onDestroy } from 'svelte'
import { BROWSER } from 'esm-env'
import type { Unsubscriber } from 'svelte/motion'

export type ThemeTitle = 'theme-default' | 'theme-a' | 'theme-b' | 'theme-c' | (string & {})
export type ThemeVariant = 'light' | 'dark'
export type ThemeMode = ThemeVariant | 'system'

/**
 * A theme variant config contains hex colors. All {@link ThemeConfig | ThemeConfigs}
 * contain both a light and dark variant, defined here.
 */
export interface ThemeVariantConfig {
	// Brand colors.
	'brand-a': string
	'brand-b': string
	'brand-c': string
	// Foreground shades.
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
	autoInit: boolean
	/**
	 * Whether to persist the Themer state in localStorage.
	 * @default true
	 */
	persistent: boolean
	/**
	 * The default theme to use.
	 * @default A theme titled 'default'.
	 */
	theme: ThemeConfig
	themes: Array<ThemeConfig>
	mode: ThemeMode
}

/**
 * Default {@link ThemerOptions} object.
 */
const THEMER_DEFAULTS: ThemerOptions = {
	autoInit: true,
	persistent: true,
	themes: [],
	theme: THEME_DEFAULT,
	mode: 'system',
}

/**
 * The Themer class manages multiple customizable application themes.
 * It can be used to store and retrieve themes, create new themes,
 * and apply themes to the document.  Each theme has a light and dark
 * variant, and the active variant is determined by the current
 * {@link ThemeMode}, which can be set to 'light', 'dark', or 'system'.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 * 	import { Themer } from 'fractils'
 * 	import my_theme from './themes/my_theme.json'
 *
 * 	const themer = new Themer({
 * 		theme: my_theme,
 * 	})
 * </script>
 *
 * <h1>{theme.theme.title}</h1>
 * <button on:click={() => themer.mode = 'dark'}>dark mode</button>
 * <button on:click={() => themer.addTheme({...})}>add theme</button>
 */
export class Themer<T extends ThemeTitle> {
	theme: State<ThemeConfig>
	mode: State<'light' | 'dark' | 'system'>
	themes: State<ThemeConfig[]>

	#unsubs: Array<() => void> = []

	#persistent: boolean
	#initialized = false
	#style!: HTMLStyleElement

	log = logger('themer', {
		fg: 'DarkCyan',
		deferred: false,
		server: false,
	})

	constructor(options?: Partial<ThemerOptions>) {
		const opts = Object.assign({}, THEMER_DEFAULTS, options)
		this.log(g('constructor') + '()', { opts, this: this })

		this.theme = state(opts.theme)

		this.mode = state(opts.mode)

		this.#addSub(this.theme, (v) => {
			this.log(o('theme') + c('.subscribe') + '()', { v, this: this })
			if (this.#initialized) this.applyTheme()
		})

		this.#addSub(this.mode, (v) => {
			this.log(o('mode') + c('.subscribe') + '()', { v, this: this })
			if (this.#initialized) this.applyTheme()
		})

		this.themes = state(opts.themes)

		this.#persistent = opts.persistent ?? true

		if (opts.autoInit) {
			this.init()
		}

		try {
			onDestroy(() => {
				this.dispose()
				if (BROWSER) {
					this.log(c('onDestroy') + '()', 'disposed')
				}
			})
		} catch (e) {
			console.error(e)
			// Swallow... (just means we're not in a Svelte component)
		}
	}

	#addSub<
		S extends PrimitiveState<unknown>,
		V extends Parameters<Parameters<S['subscribe']>[0]>[0],
	>(state: S, cb: (v: V) => void) {
		this.#unsubs.push(state.subscribe((v) => cb(v as V)))
	}

	init() {
		const themes = this.themes.get()
		const theme = this.theme.get()

		this.log(c('init') + '()', { theme: this.theme, this: this })
		if (typeof document === 'undefined') return

		if (this.#initialized) return this
		this.#initialized = true

		// Make sure the initial theme is in the themes array.
		if (!themes.find((t) => t.title === theme.title)) {
			this.create(theme, { overwrite: true, save: false })
		}

		// Create the <style> element.
		const style = document.createElement('style')
		style.setAttribute('id', 'fractils-themer')
		style.setAttribute('type', 'text/css')
		document.head.appendChild(style)
		this.#style = style

		this.load()?.applyTheme()

		return this
	}

	/**
	 * The current mode, taking into account the system preferences.
	 */
	get activeMode(): 'light' | 'dark' {
		const mode = this.mode.get()

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

	/**
	 * Adds a new theme to the Themer and optionally saves it to localStorage.
	 */
	create(
		/**
		 * The theme to add.
		 * @remarks If a theme with the same title already exists, its title
		 * will be incremented with a number suffix (i.e. `my-theme (1)`).
		 */
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
			 * after adding the new theme.  If {@link ThemerOptions.persistent}
			 * is `false`, this option is ignored.
			 * @default true
			 */
			save?: boolean
		},
	) {
		this.log(c('addTheme') + '()', { newTheme, options, this: this })

		const theme = structuredClone(newTheme)

		const overwrite = options?.overwrite ?? false
		const save = options?.save ?? true

		const [dupes, existing] = partition(this.themes.value, (t) => t.title === theme.title)
		const alreadyExists = dupes.length > 0

		if (!overwrite && alreadyExists) {
			// Preserve the existing theme while de-duping it.
			existing.push(structuredClone(dupes[0]))

			// Increment the title.
			let i = 0
			while (true) {
				const newTitle = `${theme.title} (${i++})`

				if (!existing.some((t) => t.title === newTitle)) {
					theme.title = newTitle
					break
				}

				if (i > 100) {
					this.log(c('addTheme') + '()', r('Runaway loop detected.') + ' Aborting.', {
						this: this,
					})
					break
				}
			}

			// let i = 0
			// const similar = this.themes.filter(t => t.title.startsWith(newTheme.title))
			// while (similar.find((t) => t.title === `${newTheme.title} (${i++})`)) {}
			// const [, title] = newTheme.title.match(/^(.*?)(?: \((\d+)\))?$/) ?? []
			// newTheme.title = `${title} (${i - 1})`
		}

		this.themes.push(theme)

		if (save) this.save()

		return this
	}

	delete(themeOrTitle: ThemeTitle | T | ThemeConfig) {
		this.log(c('deleteTheme') + '()', { themeOrTitle, this: this })

		const themeTitle = typeof themeOrTitle === 'string' ? themeOrTitle : themeOrTitle.title

		const themes = this.themes.get()

		const theme = themes.find((t) => t.title === themeTitle)

		if (!theme) {
			this.log(r('Error') + ': `themeTitle` not found in `themes` array.', {
				themeTitle,
				this: this,
			})
			throw new Error(`Theme not found.`)
		}

		const nextIndex = themes.indexOf(theme) - 1

		const isActive = this.theme.get().title === themeTitle

		this.themes.set(this.themes.get().filter((t) => t.title !== themeTitle))

		if (isActive) {
			this.theme.set(themes[nextIndex] ?? themes.at(-1))
		}

		this.save()

		return this
	}

	/**
	 * Resolves a {@link ThemeConfig} by title.
	 */
	getThemeConfig(themeTitle: ThemeTitle | T) {
		return this.themes.get().find((t) => t.title === themeTitle)
	}

	/**
	 * Applies the current theme to the document.
	 */
	applyTheme() {
		if (!('document' in globalThis)) return

		const theme = this.theme.get()

		if (!theme) {
			this.log('themeConfig not found', { theme, this: this })
			throw new Error(`Theme not found.`)
		}

		this.log(c('applyTheme') + '()', { theme: theme.title, this: this })
		const css = this.#generateCSS(theme)

		if (this.#style.innerHTML !== css) {
			this.#style.innerHTML = css
		}

		if (document.body.getAttribute('theme') !== theme.title) {
			document.body.setAttribute('theme', theme.title)
		}

		return this
	}

	/**
	 * Updates Themer state from JSON.
	 */
	fromJSON(json: ThemerJSON) {
		const isNewTheme = this.theme.get().title !== json.activeTheme

		let theme = json.themes.find((t) => t.title === json.activeTheme)
		theme ??= this.themes.get().find((t) => t.title === json.activeTheme)

		if (!theme) {
			this.log(r('Error') + ': `activeTheme` not found in `themes` array.', {
				activeTheme: json.activeTheme,
				json,
				this: this,
			})
			throw new Error(`Theme not found.`)
		}

		this.themes.set(json.themes)
		this.mode.set(json.mode)

		if (isNewTheme) {
			this.applyTheme()
		}
	}

	/**
	 * Serializes the current Themer state to JSON.
	 */
	toJSON() {
		return {
			themes: this.themes.get(),
			activeTheme: this.theme.get().title,
			mode: this.mode.get(),
		} satisfies ThemerJSON
	}

	/**
	 * Loads Themer state from localStorage.
	 * @returns The JSON that was loaded (if found).
	 */
	load() {
		this.log(c('load') + '()', { this: this })

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
		this.log(c('save') + '()', { this: this })

		if (!('localStorage' in globalThis)) return
		if (!this.#persistent) return

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
		this.log(c('clear') + '()', { this: this })
		if (!('localStorage' in globalThis)) return
		localStorage.removeItem('fractils::themer')
		this.themes.set([THEME_DEFAULT])
		this.theme.set(THEME_DEFAULT)
		this.mode.set('system')
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

		return `body[theme="${config.title}"] {\n${css}\n}`
	}

	dispose() {
		for (const unsub of this.#unsubs) {
			unsub()
		}
	}

	//! svelte/svelte-preprocess don't seem to be up to date
	//! with typescript 5.2 features like the `using` keyword
	// [Symbol.dispose]() {
	// 	for (const unsub of this.#unsubs) {
	// 		unsub()
	// 	}
	// }
}

// using themer = new Themer()

// export { themer }
