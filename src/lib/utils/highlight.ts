import type { HighlighterCore } from 'shikiji/core'
import type { CodeToHastOptions } from 'shikiji'
import type { Lang, Theme } from 'shiki'

// import { transformerTwoSlash } from 'shikiji-twoslash'
import { serendipity } from './highlight.serendipity'
import { getHighlighterCore } from 'shikiji/core'
import { getWasmInlined } from 'shikiji/wasm'
import {
	transformerNotationHighlight,
	transformerNotationFocus,
	transformerNotationDiff,
} from 'shikiji-transformers'

import { bundledLanguages } from 'shikiji'
import { logger } from '$lib/utils/logger'
import { fmtTime } from './time'
import { dim } from './l'

const DEBUG = true
const log = logger('highlight', { fg: '#94b8ff', deferred: true, browser: DEBUG })

export type HighlightOptions = CodeToHastOptions<Lang, Theme> & {
	/**
	 * The language to highlight.
	 * @defaultValue 'json'
	 */
	lang: Lang
	/**
	 * The language to highlight.
	 * @defaultValue 'javascript'
	 */
	theme: Theme | 'serendipity'
}

export const HIGHLIGHT_DEFAULTS: HighlightOptions = {
	lang: 'json',
	theme: 'serendipity',
	// transformers: [
	// 	transformerNotationHighlight(),
	// 	transformerNotationFocus(),
	// 	transformerNotationDiff(),
	// ],
} as const

const themes = new Set<Theme>()

// The default theme.
themes.add('serendipity' as Theme)

/**
 * Converts text to HTML with syntax highlighting using shikiji.
 */
export async function highlight(text: string, options?: Partial<HighlightOptions>) {
	const opts = { ...HIGHLIGHT_DEFAULTS, ...options } as HighlightOptions

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

	if (!themes.has(theme)) {
		log('theme | missing |', theme)

		const { bundledThemes } = await import('shikiji')

		await highlighter.loadTheme(bundledThemes[theme])
		themes.add(theme)

		log('theme | loaded |', theme)
	}

	try {
		const highlighted = highlighter.codeToHtml(text, {
			...opts,
			transformers: [
				transformerNotationHighlight(),
				transformerNotationFocus(),
				transformerNotationDiff(),
				// transformerTwoSlash(),
			],
		})
		const time = fmtTime(performance.now() - start)
		log('complete', dim(time), { lang, theme, text, highlighted })
		return highlighted
	} catch (error) {
		console.error(error)
		return text
	}
}

let highlighterInstance: HighlighterCore
/**
 * Highlighter instance singleton.
 * @internal
 */
export async function getHighlighterInstance() {
	if (!highlighterInstance) {
		highlighterInstance = await getHighlighterCore({
			loadWasm: getWasmInlined,
			themes: [serendipity],
			langs: [],
		})
	}
	return highlighterInstance
}

const langs = new Set<string>()
/**
 * Load a language into the highlighter.
 * @internal
 */
export async function loadLanguage(highlighter: HighlighterCore, lang: Lang) {
	if (langs.has(lang)) return

	log('pending | ' + lang)
	await highlighter.loadLanguage(bundledLanguages[lang])
	log('loaded | ' + lang)

	langs.add(lang)
}
