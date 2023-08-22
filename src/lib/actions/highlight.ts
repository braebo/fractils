import type { Action } from 'svelte/action'

import type { LanguageFn } from 'highlight.js/lib'
import hljs from 'highlight.js/lib/core'
import './highlight.css'

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

export type ValidLanguage = (typeof VALID_LANGUAGES)[number]
const VALID_LANGUAGES = [
	'json',
	'js',
	'javascript',
	'ts',
	'typescript',
	'svelte',
	'xml',
	'css',
] as const

export interface HighlightOptions {
	/**
	 * The language to highlight.
	 * @defaultValue 'javascript'
	 */
	lang?: ValidLanguage
	/**
	 * Stringifies the code before highlighting.
	 * @defaultValue false
	 */
	stringify?: boolean
	/**
	 * A utility that shows the class name of the element being moused over.
	 * @defaultValue false
	 */
	inspector?: boolean
}

const HIGHLIGHT_DEFAULTS = {
	lang: 'javascript',
	stringify: false,
	inspector: true,
} as const satisfies HighlightOptions

export interface HighlightAttr {
	'on:highlight'?: (event: HighlightEvent) => void
}

const langs = new Map<ValidLanguage, LanguageFn>()

/**
 * A syntax highlighter.
 * @example
 * ```svelte
 * <pre use:highlight={{ lang: 'json' }}>
 * 	{JSON.stringify({ hello: 'world' }, null, 2)}
 * </pre>
 * ```
 */
export const highlight: Action<Element, HighlightOptions, HighlightAttr> = (node, options = {}) => {
	const opts = { ...HIGHLIGHT_DEFAULTS, ...options }
	let code = node.textContent || ''

	let lang = opts.lang || ('javascript' as const)
	if (lang === 'js') lang = 'javascript' as const
	if (lang === 'ts') lang = 'typescript' as const

	langs.set(lang, true)

	async function loadJson() {
		hljs.registerLanguage('json', (await import('highlight.js/lib/languages/json')).default)
	}

	async function loadJs() {
		hljs.registerLanguage(
			'javascript',
			(await import('highlight.js/lib/languages/javascript')).default,
		)
	}

	async function loadTs() {
		hljs.registerLanguage(
			'typescript',
			(await import('highlight.js/lib/languages/typescript')).default,
		)
	}

	async function loadXml() {
		hljs.registerLanguage('xml', (await import('highlight.js/lib/languages/xml')).default)
	}

	async function loadCss() {
		hljs.registerLanguage('css', (await import('highlight.js/lib/languages/css')).default)
	}

	async function loadSvelte() {
		if (!langs.has('xml')) await loadXml()
		// if (!langs.has('javascript')) await loadJs()
		if (!langs.has('typescript')) await loadTs()
		if (!langs.has('css')) await loadCss()
		langs.set('svelte', true)
		;(await import('./hljs-svelte.js')).default(hljs)
	}

	async function highlight() {
		switch (lang) {
			case 'json': {
				await loadJson()
				break
			}
			case 'javascript': {
				await loadJs()
				break
			}
			case 'typescript': {
				await loadJs()
				break
			}
			case 'svelte': {
				await loadSvelte()
				break
			}
			case 'xml': {
				await loadXml()
				break
			}
		}

		if (opts.stringify) {
			code = JSON.stringify(JSON.parse(code), null, 2)
		}

		const highlighted = hljs.highlight(lang, code).value

		node.innerHTML = highlighted.replaceAll(' *{}', '')
	}

	let activeFocus: HTMLElement | null = null
	let label: HTMLElement | null = null
	let style: HTMLStyleElement | null = null
	if (opts.inspector) {
		label = document.createElement('div')
		label.classList.add('focus-label')

		style = document.createElement('style')

		style.innerHTML = /*css*/ `
			.focus {
				outline: 1px dashed #aaaa;
				position: relative;
			}

			.focus .focus-label {
				position: absolute;
				bottom: 100%;
				left: 100%;
				
				padding: 0.15rem;
				
				background: var(--bg-a);
				outline: 1px dashed #aaaa;
				
				font-size: 0.8rem;
				font-family: var(--mono);
			}
		`

		document.head.appendChild(style)

		node.addEventListener('mousemove', focusPart)
	}

	function focusPart(e: Event) {
		const target = e.target as HTMLElement
		if (activeFocus) {
			label?.remove()
			activeFocus.classList.remove('focus')
		}
		activeFocus = target
		target.classList.add('focus')

		label!.textContent = target.className.replace('focus', '').trim()

		target.appendChild(label!)
	}

	highlight()

	return {
		update: (newOptions) => (options = { ...options, ...newOptions }),
		destroy() {
			node.innerHTML = code
			if (opts.inspector) {
				label?.remove()
				node.removeEventListener('mousemove', focusPart)
				document.head.removeChild(style!)
			}
		},
	}
}
