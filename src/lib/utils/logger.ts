import { randomCSSColorName, type CSSColorName } from '../color/css'

import { stringify } from './stringify'
import { b, r, y, gr, dim } from './l'
import { DEV, BROWSER } from './env'
import { isSafari } from './safari'
import { debrief } from './debrief'
import { defer } from './defer'

export interface LoggerOptions {
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
	fg?: CSSColorName | (string & {})
	/**
	 * The background color of the log.
	 * @defaultValue transparent
	 */
	bg?: CSSColorName | (string & {})
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
	/**
	 * The title of the logger.  Prepended to all logs.
	 * @defaultValue ''
	 */
	title?: string
}

// todo - Is there a reliable way to type an ImportMetaEnv entry globally for consumers?
const ENABLED =
	DEV &&
	import.meta.env.FRACTILS_LOG_LEVEL !== 'off' &&
	!(import.meta.env.VITEST && !import.meta.env.FRACTILS_LOG_VITEST)
const bypassStyles = false
const bypassDefer = false

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal' | 'off'

export class Logger {
	title = ''
	options: LoggerOptions

	#logger: (...args: any[]) => void

	constructor(title: string, options?: LoggerOptions)
	constructor(options: LoggerOptions)
	constructor(titleOrOptions: string | LoggerOptions, options?: LoggerOptions) {
		if (typeof titleOrOptions === 'string') {
			this.title = titleOrOptions
			this.options = options ?? {}
		} else {
			this.options = titleOrOptions
			this.title = titleOrOptions.title ?? ''
		}
		this.#logger = Logger.createLogger(this.title, this.options)
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
		this.#logger(...args)
	}

	/**
	 * Logs any args as well as any logs in the current buffer.
	 * @param args
	 */
	dump = (...args: any[]) => {
		if (this.buffer.length) {
			if (args[0].match(/ⓘ|⚠|⛔|💀/)) {
				this.buffer.unshift(args.shift())
			}
			this.#logger(...this.buffer, ...args)
		} else {
			this.#logger(...args)
		}

		this.buffer = []
	}

	debug(...args: any[]) {
		if (import.meta.env.FRACTILS_LOG_LEVEL === 'debug') this.dump('🐞', ...args)
		return this
	}

	info(...args: any[]) {
		this.dump(b('\nⓘ'), ...args)
		return this
	}

	warn(...args: any[]) {
		this.dump(y('\n⚠'), ...args)
		return this
	}

	error(...args: any[]) {
		this.dump(r('\n⛔'), ...args)
		return this
	}

	fatal(...args: any[]) {
		this.dump(r('\n💀'), ...args)
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
	 * const log = new Logger('Foo')
	 * const bar = (a: number) => log.fn('bar', a)
	 * bar(1) // logs:
	 * ⓘ Foo bar(1)
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

	static createLogger(title: string, options?: LoggerOptions) {
		options ??= {}

		const browser = options.browser ?? true
		const server = options.server ?? false

		if (BROWSER && !browser) return () => void 0
		if (!BROWSER && !server) return () => void 0

		const fg = options.fg || randomCSSColorName()
		const bg = options.bg || 'transparent'
		const css = options.css ?? ''

		options.styled ??= true
		const styled = options.styled && !bypassStyles

		options.deferred ??= true
		const deferred = options.deferred && !bypassDefer && !isSafari()

		if (!ENABLED) return () => void 0

		let callsite: URL | undefined = undefined

		const log = !styled
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
						...args.map(a =>
							// Testing console goes nuts with large objects, so we debrief them.
							import.meta.env.VITEST ? debrief(a, { depth: 1, siblings: 1 }) : a,
						),
						`color:#666;background:${bg};padding:0.1rem;${css};font-size:0.66rem;`,
						options?.callsite ? `${callsite}` : '',
					)
				}

		if (!deferred) return log

		return (...args: any[]) => defer(() => log(...args))
	}
}

export const logger = (title = 'LOG', options?: LoggerOptions) => {
	return Logger.createLogger(title, options)
}
