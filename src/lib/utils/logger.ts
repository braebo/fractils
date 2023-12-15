import { randomColor, type CSSColor } from './color'

import { BROWSER, DEV } from 'esm-env'
import { isSafari } from './safari'
import { defer } from './defer'

const ENABLED = DEV
const bypassStyles = false
const bypassDefer = false

export const logger = (
	title = 'LOG',
	options?: {
		/**
		 * Whether to use the styled logger or the regular console.log.
		 * @defaultValue true
		 */
		styled?: boolean
		/**
		 * Whether to defer the log to the next idle state.  Disabled on Safari to avoid crashing.
		 * @defaultValue true
		 */
		deferred?: boolean
		/**
		 * The foreground color of the log.
		 * @defaultValue randomColor()
		 */
		fg?: CSSColor | (string & {})
		/**
		 * The background color of the log.
		 * @defaultValue transparent
		 */
		bg?: CSSColor | (string & {})
		/**
		 * Any additional CSS to apply to the log.
		 * @defaultValue ''
		 */
		css?: string
		/**
		 * Run the logger on the server.
		 * @defaultValue false
		 */
		server?: boolean
		/**
		 * Run the logger in the browser.
		 * @defaultValue true
		 */
		browser?: boolean
	},
) => {
	options ??= {}

	const fg = options.fg || randomColor()
	const bg = options.bg || 'transparent'
	const css = options.css ?? ''
	const browser = options.browser ?? true
	const server = options.server ?? false

	if (BROWSER && !browser) return () => void 0
	if (!BROWSER && !server) return () => void 0

	options.styled ??= true
	const styled = options.styled && !bypassStyles

	options.deferred ??= true
	const deferred = options.deferred && !bypassDefer && !isSafari()

	if (!ENABLED) return () => void 0

	const { filename } = getCallSite()

	const fn = !styled
		? (...args: any[]) => {
				console.log(`| ${filename} |\n| ${title} |`, ...args)
			}
		: (...args: any[]) => {
				// let messageConfig = '%c%s%c%s%c   ';
				let messageConfig = '%c%s%c '

				args.forEach((argument) => {
					const type = typeof argument
					switch (type) {
						case 'bigint':
						case 'number':
						case 'boolean':
							messageConfig += '%d   '
							break

						case 'string':
							messageConfig += '%s   '
							break

						case 'object':
						case 'undefined':
						default:
							messageConfig += '%o   '
					}
				})

				messageConfig += '%c%s'

				// const width = 10
				// const pad = Math.floor((width - title.length) / 2)
				// const paddedTitle = title.padStart(pad + title.length, ' ').padEnd(width, ' ')

				console.log(
					messageConfig,
					`color:${fg};background:${bg};padding:0.1rem;${css}`,
					// `${paddedTitle} |`,
					`${title.padEnd(10, ' ')} |`,
					`color:initial;background:${bg};padding:0.1rem;${css}`,
					...args,
					`color:#666;background:${bg};padding:0.1rem;${css};font-size:0.66rem;`,
					`${filename}`,
				)
			}

	if (!deferred) return fn

	return (...args: any[]) => defer(() => fn(...args))
}

/**
 * Gets the call site of a logger function.
 * @returns A url to the file, the file name, line number, and column number of the call site.
 */
function getCallSite() {
	const err = new Error()
	const stackLines = err.stack?.split('\n').slice(2)
	const callSite = stackLines?.[1]?.trim()

	// todo - test this on different browsers
	const match = callSite?.split('at ')[1]

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

	function failed() {
		if (DEV) console.warn('Failed to parse call site from stack trace.')
		return {
			callsite: '/unknown:0:0',
			filename: 'unknown',
			url: new URL('about:blank'),
		}
	}
}
