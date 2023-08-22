import type { Language, LanguageDetail, LanguageFn } from 'highlight.js'
import type { HLJSApi } from 'highlight.js'

import typescript from 'highlight.js/lib/languages/typescript'

export const hljsvelte: LanguageFn = (hljs: HLJSApi) => {
	const script = {
		begin: /<script>/,
		end: /<\/script>/,
		subLanguage: 'typescript',
		className: 'script-tag',
		excludeBegin: true,
		excludeEnd: true,
	}

	const templateTags: Language = {
		// begin: /{([#:\/@]?[a-zA-Z0-9_$.]*\s?)/, // Updated pattern
		begin: /{([#:\/@])/,
		end: /}/,
		excludeBegin: true,
		relevance: 10,
		className: 's-template-tag',
		subLanguage: 'typescript',
		contains: [
			{
				match: /(if|else|each|await|then|catch|debug|html|const)/,
				className: 'keyword',
			},
		],
	}

	const styles = {
		begin: /^(\s*)(<style.*>)/gm,
		end: /^(\s*)(<\/style>)/gm,
		subLanguage: 'css',
		excludeBegin: true,
		excludeEnd: true,
	}

	return {
		subLanguage: 'xml',

		contains: [
			hljs.COMMENT('<!--', '-->', {
				relevance: 10,
			}),
			script,
			templateTags,
			// match props like {prop} or prop={prop}
			{
				begin: /=?{(?=[a-zA-Z0-9_$.]+})/,
				end: /}/,
				// match: /(?<==?){[a-zA-Z0-9_]+}/,
				className: 's-prop',
				contains: [
					{
						match: /[a-zA-Z0-9_]+/,
						className: 's-prop-var',
					},
					// match template things like {variable}
					{
						match: /[a-zA-Z0-9_$.]+/,
						className: 'variable'
					}
				],
			},

			// match props that contain js expressions like prop={() => {}}
			{
				begin: /(?<==){/,
				end: /} ?(?=\/>|>|<)/,
				className: 's-prop-js',
				subLanguage: 'typescript',
				contains: [...typescript(hljs).contains],
			},
			styles,
		],
	}
}

export default function registerSvelte(hljs: HLJSApi) {
	hljs.registerLanguage('svelte', hljsvelte)
}
