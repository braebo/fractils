import { randomColor, type CSSColor } from '../color/css'

import { BROWSER } from '../dom/BROWSER'
import { stringify } from './stringify'
import { b, r, y, gr, dim } from './l'
import { isSafari } from './safari'
import { defer } from './defer'
import { DEV } from 'esm-env'
import { debrief } from './debrief'

// todo - Is there a reliable way to type an ImportMetaEnv entry globally for consumers?
const ENABLED =
	DEV &&
	import.meta.env.FRACTILS_LOG_LEVEL !== 'off' &&
	!(import.meta.env.VITEST && !import.meta.env.FRACTILS_LOG_VITEST)
const bypassStyles = false
const bypassDefer = false

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal' | 'off'

export class Logger {
	#logger: ReturnType<typeof logger>

	constructor(
		public title: string,
		public options?: Parameters<typeof logger>[1],
	) {
		this.#logger = logger(title, options)
		return this
	}

	get deferred() {
		return !bypassDefer && this.options?.deferred
	}

	/**
	 * Logs any args as well as any logs in the current buffer.
	 * @param args
	 */
	log = (...args: any[]) => {
		if (this.buffer.length) {
			this.#logger(...this.buffer, ...args)
			this.buffer = []
		} else {
			this.#logger(...args)
		}
	}

	debug(...args: any[]) {
		if (import.meta.env.FRACTILS_LOG_LEVEL === 'debug') this.log('🐞', ...args)
		return this
	}

	info(...args: any[]) {
		this.log(b('ⓘ'), ...args)
		return this
	}

	warn(...args: any[]) {
		this.log(y('⚠'), ...args)
		return this
	}

	error(...args: any[]) {
		this.log(r('⛔'), ...args)
		return this
	}

	fatal(...args: any[]) {
		this.log(r('💀'), ...args)
		return this
	}

	group(label?: string) {
		const title = this.title + (label ? `:${label}` : '')
		if (this.deferred) {
			defer(() => console.group(title))
		} else {
			console.group(title)
		}
		return this
	}

	groupCollapsed(label?: string) {
		const title = this.title + (label ? `:${label}` : '')
		if (this.deferred) {
			defer(() => console.groupCollapsed(title))
		} else {
			console.groupCollapsed(title)
		}
		return this
	}

	groupEnd() {
		if (this.deferred) {
			defer(() => console.groupEnd())
		} else {
			console.groupEnd()
		}
		return this
	}

	buffer = [] as any[]

	/**
	 * Used to display the name of a method being called and the arguments it's being called with.
	 * @param str The name of the method being called.
	 * @param args The arguments being passed to the method.
	 * @returns The logger instance.
	 *
	 * @example
	 * ```typescript
	 * class MyClass {
	 * 	#log = new Logger('MyClass', { fg: 'cyan' })
	 *
	 * 	foo(a: number) {
	 * 		this.#log.fn('foo', a).info()
	 * 	}
	 * }
	 *
	 * new MyClass().foo(1) // MyClass ⓘ   foo(1)
	 * ```
	 */
	fn(str: string, ...args: any[]) {
		this.buffer.push(
			gr(str) +
				dim('(') +
				args.map(a => gr(typeof a === 'object' ? stringify(a) : a)).join(', ') +
				dim(')'),
		)
		return this
	}
}

export const logger = (
	title = 'LOG',
	options?: {
		// todo - Add a log level override option.
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
		/**
		 * Whether to only run the logger in development mode.
		 * @defaultValue true
		 */
		devOnly?: boolean
		/**
		 * Print's the url of the file that called the logger.
		 */
		callsite?: boolean
	},
) => {
	options ??= {}

	const fg = options.fg || randomColor()
	const bg = options.bg || 'transparent'
	const css = options.css ?? ''
	const browser = options.browser ?? true
	const server = options.server ?? false

	if (BROWSER() && !browser) return () => void 0
	if (!BROWSER() && !server) return () => void 0

	options.styled ??= true
	const styled = options.styled && !bypassStyles

	options.deferred ??= true
	const deferred = options.deferred && !bypassDefer && !isSafari()

	if (!ENABLED) return () => void 0

	let callsite: URL | undefined = undefined
	if (options.callsite || true) {
		callsite = getCallSite().url
	}

	const fn = !styled
		? (...args: any[]) => {
				console.log(`| ${callsite} |\n| ${title} |`, ...args)
			}
		: (...args: any[]) => {
				let messageConfig = '%c%s%c '

				args.forEach(argument => {
					const type = typeof argument
					switch (type) {
						case 'bigint':
						case 'number':
							messageConfig += '%d   '
							break

						case 'string':
							messageConfig += '%s   '
							break

						case 'object':
						case 'boolean':
						case 'undefined':
						default:
							messageConfig += '%o   '
					}
				})

				messageConfig += '%c%s'

				console.log(
					messageConfig,
					`color:${fg};background:${bg};padding:0.1rem;${css}`,
					// `${title.padEnd(10, ' ')} |`,
					`${title.padEnd(10, ' ')}`,
					`color:initial;background:${bg};padding:0.1rem;${css}`,
					...args.map(
						a =>
							// Testing console goes nuts with large objects, so we debrief them.
							import.meta.env.VITEST ? debrief(a, { depth: 1, siblings: 1 }) : a,
						// a
					),
					`color:#666;background:${bg};padding:0.1rem;${css};font-size:0.66rem;`,
					options?.callsite ? `${callsite}` : '',
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

	function failed(silent = DEV && BROWSER()) {
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
