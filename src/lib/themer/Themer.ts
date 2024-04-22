import type { StructuredVars } from '../css/custom-properties'
import type { PrimitiveState, State } from '../utils/state'
import type { ElementOrSelector } from '../utils/select'
import type { InputOptions } from '../gui/inputs/Input'
import type { GuiOptions } from '../gui/Gui'
import type { Folder } from '../gui/Folder'
import type {
	VariableDefinition,
	ThemeDefinition,
	ExtendedVars,
	ThemeTitle,
	BaseColors,
	ModeColors,
	ThemeMode,
	Theme,
} from './types'

import { restructureVars, CSS_VAR_INNER } from '../css/custom-properties'
import { resolveTheme } from './resolveTheme'

import { Gui } from '../gui/Gui'

import theme_default from './themes/default'
import theme_scout from './themes/scout'
import theme_flat from './themes/flat'

import { DRAG_DEFAULTS } from '../utils/draggable'
import { deepMerge } from '../utils/deepMerge'
import { partition } from '../utils/partition'
import { hexToRgb } from '../utils/hexToRgb'
import { entries } from '../utils/object'
import { Logger } from '../utils/logger'
import { isColor } from '../color/color'
import { select } from '../utils/select'
import { c, g, o, r } from '../utils/l'
import { state } from '../utils/state'

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
	wrapper?: HTMLElement
	/**
	 * Additional variables to apply to the theme.
	 * @default {}
	 */
	vars?: ExtendedVars
}

/**
 * Default {@link ThemerOptions} object.
 */
export const THEMER_DEFAULTS: ThemerOptions = {
	autoInit: true,
	persistent: true,
	theme: theme_default,
	themes: [theme_default, theme_flat, theme_scout],
	mode: 'system',
	localStorageKey: 'fractils::themer',
	vars: {},
}

/**
 * The `Themer` class manages multiple customizable themes.  These themes
 * can be applied globally to the document, or scoped to a specific node.
 *
 * A {@link Theme} is a collection of CSS custom properties, most
 * importantly, shades / colors.  Themes can be created as JavaScript
 * objects or JSON in the form of a {@link ThemeDefinition}, which is
 * just a Partial<{@link Theme}> run through {@link resolveTheme} to
 * generate `theme.colors.dark` and `theme.colors.light` variants from
 * `theme.colors.base`.  This can be extended arbitrarily (// todo //).
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
	/**
	 * The element to theme.
	 */
	node: HTMLElement
	/**
	 * The currently active theme.  When `theme.set` is called, the new theme
	 * passed in is automatically applied.
	 */
	theme: State<Theme>
	/**
	 * All themes available to the themer.
	 */
	themes: State<Theme[]>
	/**
	 * The title of the currently active {@link theme}.
	 *
	 * When {@link ThemerOptions.persistent} is `true`, this value is
	 * saved to localStorage and used to restore the theme on page load.
	 */
	activeThemeTitle: State<ThemeTitle>
	/**
	 * The current mode ('light', 'dark', or 'system').
	 *
	 * When this state value is re-assigned with `mode.set`, the current theme
	 * is automatically updated.
	 *
	 * When {@link ThemerOptions.persistent} is `true`, this value is saved
	 * to localStorage and used to restore the mode on page load.
	 */
	mode: State<'light' | 'dark' | 'system'>
	/**
	 * If provided, theme css vars will be added to the wrapper.
	 */
	wrapper?: HTMLElement

	#initialized = false
	#persistent: boolean
	#key: string
	#unsubs: Array<() => void> = []
	#targets = new Set<HTMLElement>()

	#log = new Logger('themer', { fg: 'DarkCyan' })

	constructor(
		/**
		 * The element to theme.  Can be a selector, id (`#id`), a
		 * DOM element, or the string literal `'document'` to use
		 * the document element.
		 * @default 'document'
		 */
		node: ElementOrSelector | Document | 'document' = 'document',
		options?: Partial<ThemerOptions>,
	) {
		const opts = deepMerge(THEMER_DEFAULTS, options)
		this.#key = String(opts.localStorageKey)

		this.#log.fn(g('constructor')).info({ opts, this: this })

		if (opts.wrapper) {
			this.wrapper = opts.wrapper
		}

		this.node =
			node === 'document'
				? document.documentElement
				: typeof node === 'string'
					? select(node)[0] ?? document.documentElement
					: (node as HTMLElement)

		this.theme = state(resolveTheme(opts.theme, opts.vars))

		this.themes = state(
			opts.themes.map(t => {
				return resolveTheme(t, opts.vars)
			}),
		)

		this.activeThemeTitle = state(opts.theme.title, {
			key: this.#key + '::activeTheme',
		})

		const storedTitle = this.activeThemeTitle.value
		if (opts.theme.title !== storedTitle) {
			const theme = this.themes.value.find(t => t.title === storedTitle)
			if (theme) this.theme.set(theme)
		}

		this.mode = state(opts.mode, {
			key: this.#key + '::mode',
		})

		this.#persistent = opts.persistent ?? true

		this.#addSub(this.theme, v => {
			this.#log.fn(o('theme.subscribe')).info({ v, this: this })
			if (this.#initialized) {
				this.activeThemeTitle.set(v.title)
				this.applyTheme()
			}
		})

		this.#addSub(this.mode, v => {
			this.#log.fn(o('mode.subscribe')).info('v', v, { this: this })

			if (typeof v === 'undefined') throw new Error('Mode is undefined.')

			if (this.#initialized) this.applyTheme()
		})

		this.#targets.add(this.wrapper ?? this.node.parentElement ?? this.node)

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

		this.#log.fn(c('init')).info({ theme: this.theme, this: this })
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
	 * The active theme's variables based on the current mode.
	 */
	get modeColors(): ModeColors {
		return this.theme.value.vars.color[this.activeMode]
	}
	get baseColors(): BaseColors {
		return this.theme.value.vars.color.base
	}
	get allColors(): ModeColors & BaseColors {
		return { ...this.baseColors, ...this.modeColors }
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
	create = (
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
	) => {
		this.#log.fn(c('addTheme')).info({ newTheme, options, this: this })

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
					this.#log.fn(c('addTheme')).info(r('Runaway loop detected.') + ' Aborting.', {
						this: this,
					})
					break
				}
			}
		}

		if (save) this.save()

		return this
	}

	delete(themeOrTitle: ThemeTitle | Theme) {
		this.#log.fn(c('deleteTheme')).info({ themeOrTitle, this: this })

		const themeTitle = typeof themeOrTitle === 'string' ? themeOrTitle : themeOrTitle.title

		const themes = this.themes.value

		const theme = themes.find(t => t.title === themeTitle)

		if (!theme) {
			this.#log.error('`themeTitle` not found in `themes` array.', {
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
	applyTheme = (targets?: HTMLElement[]) => {
		this.#log
			.fn(c('applyTheme'))
			.info({ theme: this.theme.value.title, targets: this.#targets, this: this })
		if (!('document' in globalThis)) return

		const theme = this.theme.value

		if (!theme) {
			this.#log.error('theme not found').info({ theme, this: this })
			throw new Error(`Theme not found.`)
		}

		this.#applyStyleProps(theme, targets)
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
			this.#log.error('`activeTheme` not found in `themes` array.', {
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
	load = () => {
		this.#log.fn(c('load')).info({ this: this })

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
		this.#log.fn(c('save')).info({ this: this })

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
		this.#log.fn(c('clear')).info({ this: this })
		if (!('localStorage' in globalThis)) return
		localStorage.removeItem(`${this.#key}themer`)
		this.themes.set([theme_default])
		this.theme.set(theme_default)
		this.mode.set('system')
	}

	addTarget(target: HTMLElement) {
		this.#targets.add(target)
		this.applyTheme([target])
	}

	/**
	 * Generates CSS custom properties from a theme config.
	 * @param config - The theme config to generate CSS from.
	 * @returns A string of CSS custom properties.
	 * @internal
	 */
	#applyStyleProps = (themeConfig: Theme, targets = this.#targets as any as HTMLElement[]) => {
		const config = themeConfig
		this.#log.fn(c('applyStyleProps')).info({ config, this: this })

		const themeColors = config.vars.color[this.activeMode]
		if (!themeColors) {
			this.#log.error('`theme` not found in `config`.', {
				theme: themeColors,
				config,
				'this.activeMode': this.activeMode,
				this: this,
			})
			throw new Error(`Theme not found.`)
		}

		const allVars = new Map<string, string>()

		for (const target of targets) {
			for (const [key, value] of entries(config.vars)) {
				if (key === 'color') {
					for (const [k, v] of [
						...entries(value.base),
						...entries(value[this.activeMode]),
					]) {
						target.style.setProperty(`--${config.prefix}-${k}`, v)
						target.style.setProperty(`--${config.prefix}-${k}-rgb`, hexToRgb(v))
					}
				} else {
					const x: VariableDefinition = config.vars[key]

					for (const [mode, vars] of entries(x)) {
						// console.log({ key, value })
						if (mode === 'base') {
							for (const [k, v] of entries(vars)) {
								allVars.set(k, v)
							}
						} else if (mode === this.activeMode) {
							for (const [k, v] of entries(vars)) {
								allVars.set(k, v)
							}
						}
					}
				}
			}

			for (const [k, v] of allVars) {
				target.style.setProperty(`--${config.prefix}-${k}`, v)
			}
		}
	}

	dispose() {
		for (const unsub of this.#unsubs) {
			unsub()
		}
	}
}

export class ThemeEditor {
	gui: Gui
	#unsub: () => void
	#log: Logger

	constructor(
		public targetGui: Gui,
		opts?: Partial<GuiOptions>,
	) {
		this.#log = new Logger('ThemeEditor:' + targetGui.title, {
			fg: 'DarkCyan',
			deferred: false,
		})
		this.gui = new Gui(opts)

		this.targetGui.windowManager?.add(this.gui.wrapper, {
			draggable: {
				...DRAG_DEFAULTS,
				handle: this.gui.elements.header,
				localStorageKey:
					typeof opts?.storage === 'object'
						? opts?.storage?.key ?? 'fracgui::' + targetGui.title + '::theme-editor'
						: DRAG_DEFAULTS.localStorageKey,
			},
		})

		this.targetGui.themer?.addTarget(this.gui.wrapper)

		this.#unsub = this.targetGui.themer!.theme.subscribe(t => {
			this.gui.title = `${opts?.title} · ${t.title}`
		})

		this.targetGui.themer!.applyTheme()

		setTimeout(() => {
			this.generate()
		}, 0)
	}

	dispose() {
		this.#unsub()
		this.gui.dispose()
	}

	get vars() {
		return this.targetGui.themer!.theme.value.vars
	}

	generate = () => {
		const MAX_DEPTH = 0
		let currentFolder: Folder = this.gui

		const add = (
			folder: Folder,
			title: string,
			value: string,
			onChange: InputOptions['onChange'],
		) => {
			this.#log.fn('add').debug({ title, value, onChange, this: this })

			if (value.match(/^\d+(\.\d+)?$/g)) {
				try {
					const v = parseFloat(value)
					if (!isNaN(v)) {
						const av = Math.abs(v)
						folder
							.addNumber({
								title,
								value: v,
								min: Math.min(0, av),
								max: Math.max(0, av < 1 ? 1 : av * 3),
								step: av < 1 ? 0.01 : av < 10 ? 0.1 : 1,
							})
							.onChange(v => onChange!(v))
						return
					}
				} catch (e) {}
			}

			folder.add({ title, value, onChange })
		}

		const traverse = (
			obj: VariableDefinition[keyof VariableDefinition] | StructuredVars,
			parent: Folder,
			_depth = 0,
		) => {
			_depth++
			for (const [k, v] of entries(obj)) {
				const onChange = (v: any) => {
					if (isColor(v)) {
						v = v.hex8String
					}
					this.#log.fn('onChange').info({ k, v, this: this })
					this.targetGui.wrapper.style.setProperty(
						`--${this.targetGui.themer!.theme.value.prefix}-${k}`,
						v,
					)
				}

				if (typeof v === 'string') {
					const vars = [...v.matchAll(CSS_VAR_INNER)].map(m => m[1])

					if (vars.length) {
						add(
							parent,
							k.split('_').at(-1) || k,
							v.replace(CSS_VAR_INNER, (str, match) => {
								return (
									this.targetGui.wrapper.style.getPropertyValue(match).trim() ||
									str
								)
							}),
							onChange,
						)
					} else {
						add(parent, k.split('_').at(-1) || k, v, onChange)
					}
				} else {
					if (currentFolder.title !== k) {
						currentFolder = parent.addFolder({
							title: k,
							closed: _depth > MAX_DEPTH,
						})
					}

					traverse(v, currentFolder, _depth)
				}
			}

			return _depth
		}

		let depth = 1

		const allVars = this.vars

		for (const [title, def] of entries(allVars)) {
			currentFolder = this.gui.addFolder({ title, closed: depth > MAX_DEPTH })

			if (title === 'core' && 'core' in allVars) {
				for (const [mode, vars] of entries(allVars['core'])) {
					currentFolder.addFolder({ title: mode, closed: depth > MAX_DEPTH })
					traverse(restructureVars(vars), currentFolder, depth)
				}
			} else {
				for (const [mode, vars] of entries(def)) {
					traverse(
						vars,
						currentFolder.addFolder({ title: mode, closed: depth > MAX_DEPTH }),
					)
				}
			}
		}

		for (const folder of this.gui.allChildren) {
			// Delete all the empty folders.
			if (!folder.inputs.size && !folder.children.length) {
				folder.dispose()
				continue
			}
		}
	}
}
