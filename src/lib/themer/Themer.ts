/**
 * @module themer
 *
 * @description
 * Manages multiple customizable application themes.
 */

import type { PrimitiveState, State } from '../utils/state'
import type { ElementsOrSelector } from '../utils/select'
import type { Theme, ThemeDefinition } from './types'

import { deepMerge } from '../utils/deepMerge'
import { partition } from '../utils/partition'
import { hexToRgb } from '../utils/hexToRgb'
import defaultTheme from './themes/default'
import { entries } from '../utils/object'
import { Logger } from '../utils/logger'
import { select } from '../utils/select'
import { c, g, o, r } from '../utils/l'
import { state } from '../utils/state'
import { resolveTheme } from './resolveTheme'

export type ThemeTitle = 'theme-default' | 'theme-a' | 'theme-b' | 'theme-c' | (string & {})
export type ThemeVariant = 'light' | 'dark'
export type ThemeMode = ThemeVariant | 'system'

/**
 * A JSON representation of the {@link Themer} class. Used in the
 * {@link Themer.toJSON | toJSON()} and {@link Themer.fromJSON | fromJSON()},
 * methods, and subsequently, in {@link Themer.save | save()}
 * and {@link Themer.load | load()}.
 */
export interface ThemerJSON {
	themes: Theme[]
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
	theme: ThemeDefinition
	themes: Array<Theme>
	mode: ThemeMode
	/**
	 * The key to store the theme in localStorage.
	 * @default 'fractils::themer'
	 */
	localStorageKey?: string
}

/**
 * Default {@link ThemerOptions} object.
 */
const THEMER_DEFAULTS: ThemerOptions = {
	autoInit: true,
	persistent: true,
	themes: [],
	theme: defaultTheme,
	mode: 'system',
	localStorageKey: 'fractils::themer',
}

/**
 * The Themer class manages multiple customizable application themes.
 *
 * It can be used to store, retrieve, create, and apply themes. It can
 * apply themes to either the root document, or a specific node and
 * its children. Each {@link ThemeDefinition} has light and dark
 * variants (auto-generated if not specified), and the active
 * variant isdetermined by the current {@link ThemeMode},
 * which can be set to 'light', 'dark', or 'system'.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 * 	import { Themer } from 'fractils'
 * 	import my_theme from './themes/my_theme'
 *
 * 	const themer = new Themer('document', {
 * 		theme: my_theme,    // optional theme definition (JS object or JSON)
 * 		themes: [my_theme], // optional array of themes
 * 		mode: 'dark',       // optional initial mode ('light', 'dark', or 'system')
 * 	})
 * </script>
 *
 * <h1>{themer.theme.title}</h1>
 * <button on:click={() => themer.mode = 'dark'}>dark mode</button>
 * <button on:click={() => themer.addTheme({...})}>add theme</button>
 * ```
 */
export class Themer {
	node: HTMLElement
	theme: State<Theme>
	mode: State<'light' | 'dark' | 'system'>
	themes: State<Theme[]>

	#initialized = false
	#persistent: boolean
	#key: string
	#style?: HTMLStyleElement
	#unsubs: Array<() => void> = []

	log = new Logger('themer', {
		fg: 'DarkCyan',
		deferred: false,
		server: false,
	})

	constructor(
		/**
		 * The element to theme.  Can be a selector, id (`#id`), a
		 * DOM element, or the string literal `'document'` to use
		 * the document element.
		 * @default 'document'
		 */
		node: ElementsOrSelector | Document | 'document' = 'document',
		options?: Partial<ThemerOptions>,
	) {
		const opts = deepMerge(THEMER_DEFAULTS, options)
		this.#key = String(opts.localStorageKey)

		this.log.fn(g('constructor')).info({ opts, this: this })

		this.node =
			node === 'document'
				? document.documentElement
				: typeof node === 'string'
					? select(node)[0] ?? document.documentElement
					: (node as HTMLElement)

		this.theme = state(resolveTheme(opts.theme), {
			key: this.#key + '::theme',
		})
		this.mode = state(opts.mode, {
			key: this.#key + '::mode',
		})
		this.themes = state(opts.themes, {
			key: this.#key + '::themes',
		})
		this.#persistent = opts.persistent ?? true

		this.#addSub(this.theme, v => {
			this.log.fn(o('theme.subscribe')).info({ v, this: this })
			if (this.#initialized) this.applyTheme()
		})

		this.#addSub(this.mode, v => {
			this.log.fn(o('mode.subscribe')).info('v', v, { this: this })

			if (typeof v === 'undefined') throw new Error('Mode is undefined.')

			if (this.#initialized) this.applyTheme()
		})

		if (opts.autoInit) {
			this.init()
		}
	}

	#addSub<
		S extends PrimitiveState<unknown>,
		V extends Parameters<Parameters<S['subscribe']>[0]>[0],
	>(state: S, cb: (v: V) => void) {
		this.#unsubs.push(state.subscribe(v => cb(v as V)))
	}

	init() {
		const themes = this.themes.value
		const theme = this.theme.value

		this.log.fn(c('init')).info({ theme: this.theme, this: this })
		if (typeof document === 'undefined') return

		if (this.#initialized) return this
		this.#initialized = true

		// Make sure the initial theme is in the themes array.
		if (!themes.find(t => t.title === theme.title)) {
			this.create(theme, { overwrite: true, save: false })
		}

		this.load()?.applyTheme()

		return this
	}

	/**
	 * The current mode, taking into account the system preferences.
	 */
	get activeMode(): 'light' | 'dark' {
		const _mode = this.mode.value
		const mode =
			typeof _mode === 'object' && 'value' in _mode
				? (_mode as { value: 'light' | 'dark' }).value
				: _mode

		console.log(mode)

		if (mode === 'system') {
			return this.#systemPref
		}

		return mode as 'light' | 'dark'
	}

	get #systemPref() {
		if (window.matchMedia('(prefers-color-scheme: light)').matches) {
			return 'light'
		}

		if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
			return 'dark'
		}

		return 'dark'
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
		newTheme: Theme,
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
		this.log.fn(c('addTheme')).info({ newTheme, options, this: this })

		const theme = structuredClone(newTheme)

		const overwrite = options?.overwrite ?? false
		const save = options?.save ?? true

		const [dupes, existing] = partition(this.themes.value, t => t.title === theme.title)
		const alreadyExists = dupes.length > 0

		if (!overwrite && alreadyExists) {
			// Preserve the existing theme while de-duping it.
			existing.push(structuredClone(dupes[0]))

			// Increment the title.
			let i = 0
			while (true) {
				const newTitle = `${theme.title} (${i++})`

				if (!existing.some(t => t.title === newTitle)) {
					theme.title = newTitle
					break
				}

				if (i > 100) {
					this.log.fn(c('addTheme')).info(r('Runaway loop detected.') + ' Aborting.', {
						this: this,
					})
					break
				}
			}
		}

		this.themes.push(theme)

		if (save) this.save()

		return this
	}

	delete(themeOrTitle: ThemeTitle | Theme) {
		this.log.fn(c('deleteTheme')).info({ themeOrTitle, this: this })

		const themeTitle = typeof themeOrTitle === 'string' ? themeOrTitle : themeOrTitle.title

		const themes = this.themes.value

		const theme = themes.find(t => t.title === themeTitle)

		if (!theme) {
			this.log.error('`themeTitle` not found in `themes` array.', {
				themeTitle,
				this: this,
			})
			throw new Error(`Theme not found.`)
		}

		const nextIndex = themes.indexOf(theme) - 1

		const isActive = this.theme.value.title === themeTitle

		this.themes.set(this.themes.value.filter(t => t.title !== themeTitle))

		if (isActive) {
			this.theme.set(themes[nextIndex] ?? themes.at(-1))
		}

		this.save()

		return this
	}

	/**
	 * Resolves a {@link Theme} by title.
	 */
	getTheme(themeTitle: ThemeTitle) {
		return this.themes.value.find(t => t.title === themeTitle)
	}

	/**
	 * Applies the current theme to the document.
	 */
	applyTheme = () => {
		this.log.fn(c('applyTheme')).info({ theme: this.theme.value.title, this: this })
		if (!('document' in globalThis)) return

		const theme = this.theme.value

		if (!theme) {
			this.log.error('theme not found').info({ theme, this: this })
			throw new Error(`Theme not found.`)
		}

		this.#applyStyleProps(theme)
		this.node.setAttribute('theme', theme.title)
		this.node.setAttribute('mode', this.activeMode)

		return this
	}

	/**
	 * Updates Themer state from JSON.
	 */
	fromJSON(json: ThemerJSON) {
		const isNewTheme = this.theme.value.title !== json.activeTheme

		let theme = json.themes.find(t => t.title === json.activeTheme)
		theme ??= this.themes.value.find(t => t.title === json.activeTheme)

		if (!theme) {
			this.log.error('`activeTheme` not found in `themes` array.', {
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
			themes: this.themes.value,
			activeTheme: this.theme.value.title,
			mode: this.mode.value,
		} satisfies ThemerJSON
	}

	/**
	 * Loads Themer state from localStorage.
	 * @returns The JSON that was loaded (if found).
	 */
	load() {
		this.log.fn(c('load')).info({ this: this })

		if (this.#persistent && 'localStorage' in globalThis) {
			const json = localStorage.getItem(this.#key + '::themer')

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
		this.log.fn(c('save')).info({ this: this })

		if (!('localStorage' in globalThis)) return
		if (!this.#persistent) return

		const json = this.toJSON()

		const exists = `${this.#key}themer` in localStorage

		try {
			const identical =
				exists &&
				JSON.parse(JSON.stringify(json)) ===
					JSON.parse(localStorage.getItem(`${this.#key}themer`) || '')

			if (!identical) {
				localStorage.setItem(`${this.#key}themer`, JSON.stringify(json))
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
		this.log.fn(c('clear')).info({ this: this })
		if (!('localStorage' in globalThis)) return
		localStorage.removeItem(`${this.#key}themer`)
		this.themes.set([defaultTheme])
		this.theme.set(defaultTheme)
		this.mode.set('system')
	}

	/**
	 * Generates CSS custom properties from a theme config.
	 * @param config - The theme config to generate CSS from.
	 * @returns A string of CSS custom properties.
	 * @internal
	 */
	#applyStyleProps(config: Theme) {
		this.log.fn(c('applyStyleProps')).info({ config, this: this })

		const themeColors = config.color[this.activeMode]
		if (!themeColors) {
			this.log.error('`theme` not found in `config`.', {
				theme: themeColors,
				config,
				'this.activeMode': this.activeMode,
				this: this,
			})
			throw new Error(`Theme not found.`)
		}

		for (const [key, value] of [...entries(config.color.base), ...entries(themeColors)]) {
			this.node.style.setProperty(`--${key}`, value)
			this.node.style.setProperty(`--${key}-rgb`, hexToRgb(value))
		}
	}

	generateCssVars(obj: Record<string, string>[]) {
		function generate(obj: Record<string, string>) {
			const cssVars: `--${string};`[] = []
			for (const [key, value] of entries(obj)) {
				cssVars.push(`--${key}: ${value};`)
				cssVars.push(`--${key}-rgb: ${hexToRgb(value)};`)
			}

			return cssVars
		}
		return obj.flatMap(generate)
	}

	generateStylesheet() {
		// Create the <style> element.
		if (!this.#style) {
			const style = document.createElement('style')
			style.classList.add('fractils-themer')
			style.setAttribute('type', 'text/css')
			document.head.appendChild(style)
			this.#style = style
		}

		const cssVars = this.generateCssVars([this.theme.value.color[this.activeMode]])
		const css = cssVars.join('\n')

		this.#style.textContent = css
		document.head.appendChild(this.#style)

		return css
	}

	dispose() {
		for (const unsub of this.#unsubs) {
			unsub()
		}
	}

	// /**
	//  * Generates CSS custom properties from a theme config.
	//  * @param config - The theme config to generate CSS from.
	//  * @returns A string of CSS custom properties.
	//  * @internal
	//  */
	// #generateCSS_old(config: Theme) {
	// 	this.log.fn(c('generateCSS')).info({ config, this: this })
	// 	let css = ''

	// 	const theme = config[this.activeMode]
	// 	if (!theme) {
	// 		this.log.error('`theme` not found in `config`.', {
	// 			theme,
	// 			config,
	// 			'this.activeMode': this.activeMode,
	// 			this: this,
	// 		})
	// 		throw new Error(`Theme not found.`)
	// 	}
	// 	for (const [key, value] of entries(theme)) {
	// 		css += `--${key}: ${value};\n`
	// 		css += `--${key}-rgb: ${hexToRgb(value)};\n`
	// 	}

	// 	const target =
	// 		this.node instanceof Document
	// 			? 'html'
	// 			: typeof this.#initialNode === 'string'
	// 				? this.node
	// 				: this.node.id
	// 					? `#${this.node.id}`
	// 					: `.${this.node.classList[0]}`

	// 	return `${target}[theme="${config.title}"] {\n${css}\n}`
	// }

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
