import type { CSSColorName } from '../color/css'
import type { ChalkInstance } from 'chalk'

import { CSS_COLORS, randomCSSColorName } from '../color/css'
import { r, y, gr, dim, hex } from './l'
import { stringify } from './stringify'
import { DEV, BROWSER } from './env'
import { isSafari } from './safari'
import { debrief } from './debrief'
import { defer } from './defer'

export interface LoggerOptions {
	/**
	 * Whether to use the styled logger or the regular console.log.
	 * @default true
	 */
	styled?: boolean
	/**
	 * Whether to defer the log to the next idle state.  Disabled on Safari to avoid crashing.
	 * @default true
	 */
	deferred?: boolean
	/**
	 * The foreground color of the log.
	 * @default randomColor()
	 */
	fg?: CSSColorName | (string & {})
	/**
	 * The background color of the log.
	 * @default transparent
	 */
	bg?: CSSColorName | (string & {})
	/**
	 * Any additional CSS to apply to the log.
	 * @default ''
	 */
	css?: string
	/**
	 * Run the logger on the server.
	 * @default false
	 */
	server?: boolean
	/**
	 * Run the logger in the browser.
	 * @default true
	 */
	browser?: boolean
	/**
	 * Whether to only run the logger in development mode.
	 * @default true
	 */
	devOnly?: boolean
	/**
	 * Print's the url of the file that called the logger.
	 */
	callsite?: boolean
	/**
	 * The title of the logger.  Prepended to all logs.
	 * @default ''
	 */
	title?: string
}

// todo - Is there a reliable way to type an ImportMetaEnv entry globally for consumers?
const ENABLED =
	DEV &&
	import.meta.env.VITE_FRACTILS_LOG_LEVEL !== 'off' &&
	!(import.meta.env.VITEST && !import.meta.env.VITE_FRACTILS_LOG_VITEST)

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal' | 'off'

export class Logger {
	private static _BYPASS_STYLES = false
	private static _BYPASS_DEFER = true

	title = ''
	options: LoggerOptions
	color: ChalkInstance

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

		const colorname = options?.fg?.toLowerCase() ?? randomCSSColorName()
		const fg = colorname in CSS_COLORS ? CSS_COLORS[colorname as CSSColorName] : colorname

		this.color = hex(fg)
		this.#logger = Logger.createLogger(this.title, this.options)

		return this
	}

	get deferred() {
		return !Logger._BYPASS_DEFER && this.options?.deferred
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
			this.consolidateBuffer()
			this.#logger(...this.buffer, ...args)
		} else {
			this.#logger(...args)
		}

		this.buffer = []
	}

	debug(...args: any[]) {
		if (import.meta.env.VITE_FRACTILS_LOG_LEVEL === 'debug') this.dump('🐞', ...args)
		return this
	}

	i = hex('#426685')('ⓘ')
	info(...args: any[]) {
		this.dump(this.i, ...args)
		return this
	}

	warn(...args: any[]) {
		this.dump(y('⚠'), ...args)
		return this
	}

	error(...args: any[]) {
		this.dump(r('⛔'), ...args)
		return this
	}

	fatal(...args: any[]) {
		this.dump(r('💀'), ...args)
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
	 * Replaces any sequentially repeating strings in the buffer with a single instance and a count.
	 */
	consolidateBuffer() {
		const buff = new Map<string, number>()

		for (const item of this.buffer) {
			buff.set(item, (buff.get(item) ?? 0) + 1)
		}

		this.buffer = Array.from(buff).map(([item, count]) =>
			count > 1 ? `${item}x${dim(count)}` : item,
		)
	}

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
		const styled = options.styled && !Logger._BYPASS_STYLES

		options.deferred ??= true
		const deferred = options.deferred && !Logger._BYPASS_DEFER && !isSafari()

		if (!ENABLED) return () => void 0

		let callsite: URL | undefined = undefined

		let messageConfigBase = '%c%s%c'

		// This is my debatably desirable attempt to dim trailing
		// title parts and separate the rest onto a newline.
		const [t, ...rest] = title.split(' ')
		let restParts = [] as string[]
		if (rest.length) {
			for (const part of rest) {
				restParts.push(
					`color:#666;background:${bg};padding:0.1rem;filter:saturate(0.25);${css}`,
					` ${part}`,
				)
			}
			const i = restParts.indexOf(restParts.at(-1) ?? '')
			if (i >= 0) {
				restParts[i] = `${restParts[i]}\n`
			}
			messageConfigBase = '%c%s'.repeat(rest.length) + `${messageConfigBase}`
			title = t
		} else {
			title = `${title}\n`
		}

		const log = !styled
			? (...args: any[]) => {
					console.log(`| ${callsite} |\n| ${title} |`, ...args)
				}
			: (...args: any[]) => {
					let messageConfig = messageConfigBase

					args.forEach(argument => {
						const type = typeof argument
						switch (type) {
							case 'bigint':
							case 'number':
								messageConfig += '%d '
								break

							case 'string':
								messageConfig += '%s '
								break

							case 'object':
							case 'boolean':
							case 'undefined':
							default:
								messageConfig += '%o '
						}
					})

					console.log(
						messageConfig + '%c%s',
						`color:${fg};background:${bg};padding:0.1rem;${css}`,
						`${title}`,
						...restParts,
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
