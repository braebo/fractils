import type { Action } from 'svelte/action'
import type { Lang, Theme } from 'shiki'

import { getHighlighterInstance } from './_highlighter'
import { loadLanguage } from './loadLanguage'
import { logger } from '$lib/utils/logger'

import type { CodeToHastOptions, ShikijiTransformer } from 'shikiji'

const DEBUG = true
const log = logger('highlight', { fg: '#94b8ff', deferred: true, browser: DEBUG })

export interface HighlightEventDetail {
	/**
	 * The element that was highlighted.
	 */
	target: HTMLElement
	/**
	 * The highlighted text.
	 */
	text: string
}

export type HighlightEvent = CustomEvent<HighlightEventDetail>

export type HighlightOptions = Partial<CodeToHastOptions<Lang, Theme>> & {
	/**
	 * The language to highlight.
	 * @defaultValue 'json'
	 */
	lang?: Lang
	/**
	 * The language to highlight.
	 * @defaultValue 'javascript'
	 */
	theme?: Theme | 'serendipity'
	transformers?: ShikijiTransformer[]
}

const HIGHLIGHT_DEFAULTS = {
	lang: 'json',
	// inspector: DEV,
	// stringify: false,
	theme: 'serendipity',
} as const satisfies HighlightOptions

export interface HighlightAttr {
	'on:highlight'?: (event: HighlightEvent) => void
}

const themes = new Set<Theme>()
// The default theme.
themes.add('serendipity' as Theme)

export async function highlight(text: string, options: HighlightOptions) {
	const opts = { ...HIGHLIGHT_DEFAULTS, ...options }

	const lang = opts.lang
	const theme = opts.theme as Theme

	log('highlighting', { lang, theme })
	const start = performance.now()

	const highlighter = await getHighlighterInstance()

	await loadLanguage(highlighter, lang)

	const all = highlighter.getLoadedLanguages()

	if (!all.includes(lang)) {
		log('Language not loaded:', lang, all)
		throw new Error(`Language not loaded: ${lang}`)
	}

	// if (opts.stringify) {
	// 	text = JSON.stringify(JSON.parse(text), null, 2)
	// }

	if (!themes.has(theme)) {
		log('theme | missing |', theme)

		const { bundledThemes } = await import('shikiji')

		await highlighter.loadTheme(bundledThemes[theme])
		themes.add(theme)

		log('theme | loaded |', theme)
	}

	try {
		const highlightedHtml = highlighter.codeToHtml(text, opts)
		log('complete', { lang, theme, ms: performance.now() - start })
		return highlightedHtml
	} catch (error) {
		console.error(error)
		// node.textContent = text
		// node.innerHTML = text
		return text
	}

	// node.innerHTML = highlighted.replaceAll(' *{}', '')
}

/**
 * A syntax highlighter action.
 * @example
 * ```svelte
 * <pre use:highlight={{ lang: 'json' }}>
 * 	{JSON.stringify({ hello: 'world' }, null, 2)}
 * </pre>
 * ```
 */
export const highlighter: Action<HTMLElement, HighlightOptions, HighlightAttr> = (
	node: HTMLElement,
	options: HighlightOptions,
) => {
	const opts = { ...HIGHLIGHT_DEFAULTS, ...options }

	let text = node.textContent || ''
	const lang = opts.lang
	const theme = opts.theme as Theme

	log('initializing', { lang, theme })

	// let outliner: Outliner

	// if (opts.inspector) {
	// 	outliner = new Outliner(node)
	// }

	highlight(text, opts).then((highlighted) => {
		node.innerHTML = highlighted
	})

	return {
		update: (newOptions: HighlightOptions) => (options = { ...options, ...newOptions }),
		destroy() {
			// node.innerHTML = text
			// if (opts.inspector) {
			// 	outliner?.dispose()
			// }
		},
	}
}

// export class Outliner {
// 	styleEl?: HTMLStyleElement
// 	label?: HTMLElement
// 	activeNode?: HTMLElement
// 	static initialized = false

// 	log = logger('outliner', { fg: 'olivedrab', deferred: false, browser: DEBUG })

// 	constructor(public root: HTMLElement) {
// 		if (!Outliner.initialized) {
// 			if (typeof window === 'undefined') return

// 			this.label = document.createElement('div')
// 			this.label.classList.add('focus-label')

// 			this.styleEl = document.createElement('style')

// 			this.styleEl.innerHTML = /*css*/ `
// 			.focus {
// 				outline: 1px dashed #aaaa;
// 				position: relative;
// 			}

// 			.focus .focus-label {
// 				position: absolute;
// 				bottom: 100%;
// 				left: 100%;

// 				padding: 0.15rem;

// 				background: var(--bg-b);
// 				outline: 1px dashed #aaaa;

// 				font-size: 0.8rem;
// 				font-family: var(--font-mono);
// 			}
// 		`

// 			document.head.appendChild(this.styleEl)

// 			this.root.addEventListener('mousemove', this.watch)

// 			Outliner.initialized = true

// 			this.log('initialized', { this: this })
// 		}
// 	}

// 	watch = (e: Event) => {
// 		const target = e.target as HTMLElement

// 		// if (this.activeNode) {
// 		// 	this.blur(this.activeNode)
// 		// }

// 		if (target.isSameNode(this.root)) {
// 			return
// 		}
// 		if (this.activeNode && target.isSameNode(this.activeNode)) {
// 			return
// 		}
// 		if (this.label && target.isSameNode(this.label)) {
// 			return
// 		}

// 		this.focus(target)

// 		if (!this.label) {
// 			// this.label = document.createElement('div')
// 			// this.label.classList.add('focus-label')
// 			this.log('Error:', { initialized: Outliner.initialized, label: this.label })
// 			throw new Error('No label')
// 		}
// 	}

// 	focus = (node: HTMLElement) => {
// 		node.classList.add('focus')
// 		this.label!.textContent = node.className.replace('focus', '').trim()
// 		node.appendChild(this.label!)

// 		this.log('adding listeners:', 'mouseleave, blur')
// 		node.addEventListener('mouseleave', this.#blurEvent, { once: true })
// 		// node.addEventListener('blur', this.#blurEvent, { once: true })

// 		this.activeNode = node
// 	}

// 	#blurEvent = (e: Event) => this.blur(e.target as HTMLElement)
// 	blur(target: HTMLElement) {
// 		if (target.classList.contains('focus')) {
// 			this.log('blurring:', target)
// 			if (this.label) target.removeChild(this.label)
// 			target.classList.remove('focus')

// 			this.log('removing listeners:', 'mouseleave, blur')
// 			target.removeEventListener('mouseleave', this.#blurEvent)
// 			// target.removeEventListener('blur', this.#blurEvent)
// 		}
// 	}

// 	dispose() {
// 		this.label?.remove()
// 		this.blur({ target: this.activeNode } as any)
// 		this.root.removeEventListener('mousemove', this.watch)
// 		if (this.styleEl) document.head.removeChild(this.styleEl)
// 	}
// }

// import type { CssStyle } from '$lib/types/css'
// import type { Action } from 'svelte/action'
// import type { Lang, Theme } from 'shiki'

// import { getHighlighterInstance } from './_highlighter'
// import { logger } from '$lib/utils/logger'

// export interface HighlightEventDetail {
// 	target: HTMLElement
// 	text: string
// }

// export type HighlightEvent = CustomEvent<HighlightEventDetail>

// export interface HighlightOptions {
// 	lang: Lang
// 	theme?: Theme | 'serendipity'
// 	outliner?: boolean
// }

// const log = logger('highlight', { fg: '#94b8ff' })

// export const highlight: Action<HTMLElement, HighlightOptions> = (
// 	node: HTMLElement,
// 	options: HighlightOptions,
// ) => {
// 	const lang = options.lang ?? 'json'
// 	const theme = options.theme ?? 'serendipity'
// 	const outliner = options.outliner ?? false

// 	let themes = new Set<string>()

// 	let langs = new Set<string>()

// 	let str = ''

// 	log('initializing', { lang, theme, outliner })

// 	const updateHighlight = async () => {
// 		const text = node.textContent || ''

// 		str = text

// 		const highlighter = await getHighlighterInstance()

// 		// Dynamically load language and theme if they are not already loaded.
// 		if (!themes.has(theme)) {
// 			log('Missing theme, loading:', theme)

// 			themes.add(theme)

// 			await highlighter.loadTheme(import(`shikiji/themes/${theme}.mjs`))
// 		}

// 		if (!langs.has(lang)) {
// 			log('Missing language, loading:', lang)

// 			langs.add(lang)

// 			if (lang === 'svelte') {
// 				const { svelte } = await import('./highlight-svelte')
// 				await highlighter.loadLanguage(svelte)
// 			} else {
// 				await highlighter.loadLanguage(import(`shikiji/langs/${lang}`))
// 			}
// 		}

// 		try {
// 			const highlightedHtml = highlighter.codeToHtml(text, { lang, theme })
// 			node.innerHTML = highlightedHtml
// 		} catch (error) {
// 			console.error('Error highlighting:', error)
// 			node.textContent = str
// 		}
// 	}

// 	updateHighlight()

// 	return {
// 		update: updateHighlight,
// 		destroy() {
// 			node.textContent = str
// 		},
// 	}
// }

// export class Outliner {
// 	active = false
// 	constructor(public root: HTMLElement) {}

// 	/**
// 	 * Activate the outliner.
// 	 */
// 	activate() {
// 		this.active = true
// 		this.style('border', '1px solid var(--color-accent)')
// 	}

// 	style(attr: CssStyle, value: string | number) {
// 		this.root.style.setProperty(attr as string, String(value))
// 	}
// }
