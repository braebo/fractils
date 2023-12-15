import type { HighlighterCore } from 'shikiji/core'
import type { Lang } from 'shiki'

import { bundledLanguages } from 'shikiji'
import { logger } from '$lib/utils/logger'

const log = logger('loader', { fg: '#94b8ff' })
const langs = new Set<string>()

export async function loadLanguage(highlighter: HighlighterCore, lang: Lang) {
	if (langs.has(lang)) return

	log('pending | ' + lang)
	await highlighter.loadLanguage(bundledLanguages[lang])
	log('loaded | ' + lang)

	langs.add(lang)
}
