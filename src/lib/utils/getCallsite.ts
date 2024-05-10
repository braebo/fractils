//- wip

import { DEV, BROWSER } from './env'

/**
 * Gets the call site of a logger function.
 * @returns A url to the file, the file name, line number, and column number of the call site.
 *
 * @todo I got pretty close with this, but iirc, it's not working well enough to use reliably
 * both on the server and in the browser yet.
 */
export function getCallSite() {
	if (import.meta.env.VITEST) return failed(true)
	const err = new Error()
	const stackLines = err.stack?.split('\n').slice(2).filter(Boolean)

	let match: string | undefined
	let matches = [] as (string | undefined)[]

	// Everything
	while (!match && stackLines?.length) {
		match = matchLine(stackLines.shift())
	}

	if (!match) return failed()

	try {
		const url = new URL(match || import.meta.url)
		const [_t, lineNumber, columnNumber] = url.searchParams.get('t')?.split(':') || []
		const callsite = `${url.pathname}:${lineNumber}:${columnNumber}`
		const filename = url.pathname.split('/').pop()

		return {
			callsite,
			filename,
			url,
		}
	} catch (error) {
		return failed()
	}

	function matchLine(line: any) {
		if (!line) return ''
		if (line.includes('logger.ts')) return ''

		const regex = /https?:\/\/[^\s)]+(?=\)?)/g //? advanced
		const match = line.match(regex)?.[0]
		return match || ''
	}

	function failed(silent = DEV && BROWSER) {
		if (!silent) {
			console.warn('getCallSite(): Failed to parse call site from stack trace.')

			console.groupCollapsed('getCallSite(): debug info')
			console.log('match:', match)
			console.log('match attempts:', matches)
			console.log('stackLines:', stackLines)
			console.log('err:', err)
			console.groupEnd()
		}
		return {
			callsite: '/unknown:0:0',
			filename: 'unknown',
			url: new URL('about:blank'),
		}
	}
}
