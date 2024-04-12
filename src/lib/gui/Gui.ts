import './gui.scss'

import type { WindowManagerOptions } from '../utils/windowManager'
import type { FolderElements, FolderOptions } from './Folder'
import type { Placement, PlacementOptions } from './place'
import type { ResizableOptions } from '../utils/resizable'
import type { DraggableOptions } from '../utils/draggable'
import type { ThemerOptions } from '../themer/Themer'
import type { PrimitiveState } from '../utils/state'
import type { Tooltip } from '../actions/tooltip'
import type { ThemeMode } from '../themer/types'

import { WindowManager, WINDOWMANAGER_DEFAULTS } from '../utils/windowManager'
import { RESIZABLE_DEFAULTS } from '../utils/resizable'
import { resolveOpts } from './shared/resolveOpts'
import { DRAG_DEFAULTS } from '../utils/draggable'
import { deepMerge } from '../utils/deepMerge'
import { ThemeEditor } from '../themer/Themer'
import { Themer } from '../themer/Themer'
import { VAR_PREFIX } from './GUI_VARS'
import { Logger } from '../utils/logger'
import { create } from '../utils/create'
import { GUI_VARS } from './GUI_VARS'
import { state } from '../utils/state'
import { Folder } from './Folder'
import { BROWSER } from 'esm-env'
import { place } from './place'

type GuiTheme = 'default' | 'minimal' | (string & {})

export interface GuiElements extends FolderElements {
	toolbar: {
		container: HTMLElement
		settingsButton: HTMLButtonElement & { tooltip?: Tooltip }
	}
}
/**
 * @todo
 *!	Refactor options into two separate properties, i.e.:
 *!		windowManager: boolean | Partial<GuiStorageOptions>
 *!			👇
 *!		windowManager?: false
 *!		windowManagerOptions?: Partial<WindowManagerOptions>
 */
export interface GuiOptions extends Omit<FolderOptions, 'parentFolder'> {
	/**
	 * Persist the gui's state to localStorage.  Specify what
	 * properties to persist, and under what key.  If `true`,
	 * the {@link GUI_STORAGE_DEFAULTS} will be used.
	 * @default false
	 */
	storage?: boolean | Partial<GuiStorageOptions>
	/**
	 * The container to append the gui to.
	 * @default document.body
	 */
	container?: HTMLElement
	/**
	 * Optional {@link Themer} instance for syncing the gui's theme
	 * with your app's theme.  If `true`, a new themer will be created
	 * for you. If `false` or `undefined`, no themer will be created.
	 * @default true
	 */
	themer: Themer | boolean
	/**
	 * Options for the {@link Themer} instance when `themer` is `true`.
	 */
	themerOptions: Partial<ThemerOptions>
	/**
	 * The title of the theme to use for the gui.  To add your own themes,
	 * use {@link themerOptions.themes}.
	 */
	theme?: GuiTheme
	/**
	 * {@link WindowManager} controls behaviors like dragging,
	 * resizing, and z-index management.  Defaults to {@link WINDOWMANAGER_DEFAULTS}.
	 * - `false` disables the window manager.
	 * - `true` uses default options.
	 */
	windowManager: boolean | WindowManager | Partial<WindowManagerOptions>
	placement?: boolean | GuiPlacementOptions
	closed: boolean
	/**
	 * `parentFolder` should always be `undefined` for the root gui.
	 */
	parentFolder: undefined
}

export interface GuiPlacementOptions extends PlacementOptions {
	/**
	 * The position to place the gui.
	 */
	position: Placement | { x: number; y: number }
}

export const GUI_PLACEMENT_DEFAULTS: GuiPlacementOptions = {
	position: 'top-right',
	bounds: 'window',
	margin: 16,
} as const

export interface GuiStorageOptions {
	/**
	 * Prefix to use for localStorage keys.
	 * @default "fractils::gui"
	 */
	key: string
	/**
	 * Whether to persist the folder's expanded state.
	 * @default true
	 */
	closed?: boolean
	/**
	 * Whether to persist the theme.
	 * @default true
	 */
	theme?: boolean
}

export const GUI_STORAGE_DEFAULTS: GuiStorageOptions = {
	key: 'fracgui',
	closed: true,
	theme: true,
} as const

export const GUI_DEFAULTS: GuiOptions = {
	title: 'gui',
	controls: new Map(),
	children: [],
	themer: true,
	themerOptions: {
		localStorageKey: 'fracgui::themer',
	},
	windowManager: {
		resizable: {
			localStorageKey: 'fracgui::resizable',
			grabberSize: 9,
			color: 'var(--bg-d)',
			sides: ['right'],
			corners: [],
		},
		draggable: {
			localStorageKey: 'fracgui::draggable',
		},
	},
	storage: false,
	closed: false,
	placement: false,
	theme: 'default',
	hidden: false,
	parentFolder: undefined,
} as const

/**
 * The root Gui instance.  This is the entry point for creating
 * a gui.  You can create multiple root guis, but each gui
 * can only have one root.
 */
export class Gui extends Folder {
	isRoot = true as const

	declare elements: GuiElements

	windowManager?: WindowManager

	opts: GuiOptions

	container!: HTMLElement
	wrapper!: HTMLElement

	themer?: Themer
	themeEditor?: ThemeEditor
	settingsFolder: Folder

	closed: PrimitiveState<boolean>

	private _theme: GuiOptions['theme']

	#log: Logger

	constructor(options?: Partial<GuiOptions>) {
		//· Setup ····························································¬

		const opts = deepMerge(GUI_DEFAULTS, options ?? {}) as GuiOptions
		// Resolve storage separately since GUI_DEFAULTS.storage is `false`.
		opts.storage = resolveOpts(opts.storage, GUI_STORAGE_DEFAULTS)
		opts.container ??= document.body

		super(opts as any as FolderOptions, opts.container)

		this.opts = opts
		this.root = this
		this.container = opts.container

		this.#log = new Logger('Gui:' + opts.title, { fg: 'palevioletred' })
		this.#log.fn('constructor').info({ options, opts, this: this })

		this.wrapper = create('div', {
			classes: ['fracgui-wrapper'],
			style: {
				display: 'contents',
			},
		})
		//⌟

		//· State ····························································¬

		const storageOpts = resolveOpts(opts.storage, GUI_STORAGE_DEFAULTS)

		if (typeof storageOpts === 'object') {
			storageOpts.key =
				storageOpts.key + '::' + opts.title?.toLowerCase().replaceAll(/\s/g, '-')
		}
		if (storageOpts && storageOpts.closed) {
			this.closed = state(this.opts.closed, {
				key: storageOpts.key + '::closed',
			})
		} else {
			this.closed = state(this.opts.closed)
		}
		//⌟

		//· Themer ···························································¬

		const { themer, themerOptions } = opts

		if (!BROWSER) console.log('asdf')

		if (themer) {
			if (themerOptions) {
				themerOptions.persistent = (opts?.storage as GuiStorageOptions)?.theme ?? true

				// Load up the default generated theme vars.
				themerOptions.vars = deepMerge(GUI_VARS, themerOptions.vars)
			}

			if (themer === true) {
				themerOptions.wrapper = this.wrapper
				this.themer = new Themer(this.root.element, themerOptions)
			} else {
				this.themer = themer
			}
		}
		//⌟

		this.settingsFolder = this.#createSettingsFolder()

		//· Window Manager ···················································¬

		if (!this.windowManager) {
			const dragOpts = resolveOpts<DraggableOptions>(
				// @ts-expect-error // todo - Fix this.
				opts.windowManager?.['draggable'],
				DRAG_DEFAULTS,
			)
			if (dragOpts) {
				dragOpts.handle = this.elements.header
				dragOpts.bounds = this.container
			}

			const resizeOpts = resolveOpts<ResizableOptions>(
				// @ts-expect-error // todo - Fix this.
				opts.windowManager?.['resizable'],
				RESIZABLE_DEFAULTS,
			)
			if (resizeOpts) {
				resizeOpts.bounds = this.container
			}

			// Use the provided window manager if it's an instance.
			if (options?.windowManager instanceof WindowManager) {
				this.windowManager = options.windowManager

				this.windowManager.add(this.element, {
					draggable: dragOpts,
					resizable: resizeOpts,
				})
			} else {
				const windowManagerOpts = resolveOpts<WindowManagerOptions>(
					opts.windowManager as WindowManagerOptions,
					WINDOWMANAGER_DEFAULTS,
				)
				if (storageOpts && storageOpts.key && windowManagerOpts) {
					if (typeof windowManagerOpts.draggable === 'object') {
						windowManagerOpts.draggable.localStorageKey = `${storageOpts.key}::${windowManagerOpts.draggable.localStorageKey}`
					}
					if (typeof windowManagerOpts.resizable === 'object') {
						windowManagerOpts.resizable.localStorageKey = `${storageOpts.key}::${windowManagerOpts.resizable.localStorageKey}`
					}
				}

				this.#log
					.fn('constructor')
					.info({ options, opts, dragOptions: dragOpts, resizeOpts })

				this.windowManager = new WindowManager({
					...windowManagerOpts,
					draggable: dragOpts,
					resizable: resizeOpts,
				})

				this.windowManager.add(this.element, {
					draggable: dragOpts,
					resizable: resizeOpts,
				})
			}
		}
		//⌟

		//· Theme Editor ·····················································¬

		//! TODO - Uncomment this once beats is done.
		// if (this.themer) {
		// 	this.themeEditor = new ThemeEditor(this, {
		// 		title: 'Theme Editor',
		// 		themer: false, // Prevents infinite recursion.
		// 		windowManager: this.windowManager, // Recycling!
		// 		storage: {
		// 			// This is smelly.
		// 			key: storageOpts ? storageOpts.key : '',
		// 		},
		// 		hidden: true
		// 	})
		// }
		//⌟

		if (this.closed.value) this.close()

		//· Reveal Animation ···································································¬

		// Wait until the gui is fully constructed before positioning it
		// to make sure we can calculate the correct size and position.
		// todo - This works great but feels ghetto. What's a better way
		// todo - to do this... maybe debouncing in `add`?
		Promise.resolve().then(() => {
			Promise.resolve().then(() => {
				// Append a non-animating, full-size clone to get the proper rect.
				const ghost = this.element.cloneNode(true) as HTMLElement
				document.querySelector('.page')?.prepend(ghost)
				const rect = ghost.getBoundingClientRect()
				ghost.remove()

				Promise.resolve().then(() => {
					// todo - This placement stuff should go into `Draggable`
					const placementOpts = resolveOpts(opts.placement, GUI_PLACEMENT_DEFAULTS)

					if (placementOpts) {
						const { position: placement, margin } = placementOpts
						const bounds =
							placementOpts.bounds ?? this.container.getBoundingClientRect()

						if (typeof placement === 'object') {
							console.log(placement)
							this.windowManager?.windows.at(-1)?.draggableInstance?.moveTo(placement, 0)
						} else {
							console.log(placement)
							const placementPosition = place(rect, placement, {
								bounds,
								margin,
							})
							this.windowManager?.windows.at(-1)?.draggableInstance?.moveTo(
								placementPosition,
								0,
							)
						}
					}

					this.wrapper.appendChild(this.element)
					this.container.appendChild(this.wrapper)
					this.element.animate([{ opacity: 0 }, { opacity: 1 }], {
						fill: 'none',
						duration: 400,
					})
				})
			})
		})
		//⌟

		return this
	}

	// createPresetManager() {
	// 	const presetsFolder = this.settingsFolder.addFolder({
	// 		title: 'presets',
	// 	})
	// }

	set theme(theme: GuiTheme) {
		if (!this.themer) return
		this._theme = theme
		this.root.element.setAttribute('theme', theme)
		this.root.element.setAttribute('mode', this.themer.mode.value)
	}
	get theme() {
		return this._theme!
	}

	#createSettingsFolder() {
		const folder = this.addFolder({
			title: 'Settings',
			closed: true,
			header: false,
			hidden: false,
		})

		if (this.themer) {
			// themeFolder.add({
			folder.add({
				title: 'theme',
				// todo - labelKey: 'title',
				options: this.themer.themes.value.map(t => ({
					label: t.title,
					value: t,
				})),
				// todo - Use this once `state` is changed from `LabeledOption<T>` to `T`.
				binding: {
					target: this.themer,
					key: 'theme',
					initial: {
						label: this.themer.theme.value.title,
						value: this.themer.theme,
					},
				},
			})

			folder.addButtonGrid({
				title: 'mode',
				grid: [
					['light', 'dark', 'system'].map(m => ({
						label: m,
						onClick: () => this.themer?.mode.set(m as ThemeMode),
						isActive: () => this.themer?.mode.value === m,
					})),
				],
			})
		}

		folder.elements.contentWrapper.style.setProperty(
			`box-shadow`,
			`0px 0px 10px 0px hsl(10deg, 0%, var(--${VAR_PREFIX}-shadow-lightness), inset`,
		)
		for (const child of Array.from(folder.elements.content.children)) {
			;(child as HTMLElement).style.setProperty('background', `var(--${VAR_PREFIX}-bg-b)`)
			;(child as HTMLElement).style.setProperty(
				`--${VAR_PREFIX}-controller_background`,
				`var(--${VAR_PREFIX}-bg-c)`,
			)
			;(child as HTMLElement).style.setProperty(
				`--${VAR_PREFIX}-controller-dim_background`,
				`var(--${VAR_PREFIX}-bg-a)`,
			)
			;(child as HTMLElement).style.setProperty('border-radius', 'none', 'important')
		}
		folder.elements.content.style.setProperty(
			'background',
			`var(--${VAR_PREFIX}-bg-c)`,
		)

		// const attr = this.#attr.bind(this)
		// const prop = this.#prop.bind(this)

		// setTimeout(() => {
		// 	const styles = [
		// 		attr('background', prop('fg-c')),
		// 		attr('controller_background', prop('bg-c')),
		// 		attr('controller-dim_background', prop('bg-a')),
		// 		attr('controller_color', prop('fg-a')),
		// 		attr('controller-dim_color', prop('fg-c')),
		// 		attr('controller-outline', `1px solid rgba(${prop('bg-c-rgb')}, 0.1)`),
		// 		attr(
		// 			'controller-dim-outline',
		// 			prop('1px solid rgba(' + prop('bg-a-rgb)' + ', 0.1')),
		// 		),
		// 		attr(
		// 			'controller_box-shadow',
		// 			'0 0 10px 0 hsl(10deg, 0%, ' + prop('shadow-lightness') + ')',
		// 		),
		// 		attr(
		// 			'controller-dim_box-shadow',
		// 			'0 0 10px 0 hsl(10deg, 0%, ' + prop('shadow-lightness') + '), inset',
		// 		),
		// 	]

		// 	const css = styles.join('; ')
		// }, 0)

		// folder.addButton({
		// 	title: 'log',
		// 	text: 'console.log(gui)',
		// 	onClick: () => {
		// 		console.log(this)
		// 	},
		// })F

		return folder
	}

	// #prop(str: string) {
	// 	// return `var(--${VAR_PREFIX}-${str})`
	// 	const attr = `--${VAR_PREFIX}-${str}`
	// 	return getComputedStyle(this.wrapper).getPropertyValue(attr)
	// }

	// #attr<const Attribute extends string, const Value extends string | undefined = undefined>(
	// 	attr: Attribute,
	// 	value?: Value,
	// ) {
	// 	let str = `--${VAR_PREFIX}-${attr}`
	// 	return (value ? (str += `: ${value};`) : str) as Attribute extends string
	// 		? Value extends string
	// 			? `--${typeof VAR_PREFIX}-${Attribute}: ${Value};`
	// 			: `--${typeof VAR_PREFIX}-${Attribute}`
	// 		: never
	// }

	// static initialized = false
	// static #init() {
	// 	if (this.initialized) return
	// 	this.initialized = true

	// 	const style = document.createElement('style')
	// 	style.textContent = this.style
	// 	document.head.appendChild(style)
	// }
	// static style = /*css*/ ``

	dispose = () => {
		super.dispose()

		window.addEventListener
		this.themer?.dispose()
		this.windowManager?.dispose?.()
		for (const window of this.windowManager?.windows ?? []) {
			window
		}
	}
}
