import type { TooltipOptions, Tooltip } from '../actions/tooltip'
import type { JavascriptStyleProperty } from '$lib/css/types'

import type { PropertiesHyphen } from 'csstype'
import { entries } from './object'
import { DEV } from 'esm-env'

let tooltip: typeof Tooltip

export type CreateOptions<
	T extends HTMLElement | HTMLInputElement = HTMLElement,
	K extends keyof T = keyof T,
	TK extends T[K] = T[K],
> = {
	parent?: Element | Document
	classes?: string[]
	id?: string
	dataset?: Record<string, string>
	textContent?: string
	innerText?: string
	cssText?: string
	styles?: Partial<Record<JavascriptStyleProperty, string | number>>
	variables?: Record<`--${string}`, string | number>
	type?: string
	attributes?: Record<string, string>
	value?: any
	tooltip?: Partial<TooltipOptions>
	innerHTML?: string
	children?: HTMLElement[]
	min?: number
	max?: number
	step?: number
	onclick?: (e: MouseEvent) => void
} & Partial<Record<K, TK | unknown>>

export interface PropSetters {
	setProp<
		TCustomProperties extends (string & {})[] = (string & {})[],
		K extends keyof PropertiesHyphen | TCustomProperties[number] = keyof PropertiesHyphen,
	>(
		prop: K,
		value: PropertiesHyphen<keyof PropertiesHyphen>,
	): void
	setProps<
		// TCustomProperties extends (string & {})[] = (string & {})[],
		TCustomProperties extends (string & {})[] = [''],
		K extends keyof PropertiesHyphen | TCustomProperties[number] = keyof PropertiesHyphen,
		V = K extends keyof PropertiesHyphen ? PropertiesHyphen[K] | (string & {}) : string & {},
	>(
		props: Partial<Record<K, V>>,
	): void
}

export function create<
	const K extends keyof HTMLElementTagNameMap,
	TOptions extends CreateOptions<HTMLElementTagNameMap[K]>,
	TElement = HTMLElementTagNameMap[K] & { dataset: TOptions['dataset'] },
>(
	tagname: K,
	options?: TOptions,
): TOptions extends { tooltip: Partial<TooltipOptions> }
	? TElement & { tooltip: Tooltip } & PropSetters
	: TElement & PropSetters {
	const el = globalThis?.document?.createElement(tagname)

	if ('style' in el) {
		;(el as TElement & PropSetters).setProp = (prop, value) => {
			el.style.setProperty(prop, `${value}`)
		}
		;(el as TElement & PropSetters).setProps = props => {
			for (const [key, value] of entries(props)) {
				el.style.setProperty(key, `${value}`)
			}
		}
	}

	if (options) {
		if (options.classes) el.classList.add(...options.classes)
		if (options.id) el.id = options.id
		if (options.innerHTML) el.innerHTML = options.innerHTML
		if (options.textContent) el.textContent = options.textContent
		if (options.innerText) el.innerText = options.innerText
		if (options.cssText) el.style.cssText = options.cssText
		if (options.dataset) Object.assign(el.dataset, options.dataset)
		if (options.value && el instanceof HTMLInputElement) el.value = options.value
		if (options.type) el.setAttribute('type', options.type)
		if (options.min) el.setAttribute('min', String(options.min))
		if (options.max) el.setAttribute('max', String(options.max))
		if (options.step) el.setAttribute('step', String(options.step))

		if (options.attributes) {
			for (const [key, value] of entries(options.attributes)) {
				el.setAttribute(key, value)
			}
		}

		if (options.styles) {
			for (const [key, value] of entries(options.styles)) {
				el.style[key] = String(value)
			}
		}

		if (options.variables) {
			for (const [key, value] of entries(options.variables)) {
				el.style.setProperty(key, String(value))
			}
		}

		if (options.parent) options.parent.appendChild(el)

		if (options.tooltip) {
			if (!tooltip) {
				import('../actions/tooltip').then(({ Tooltip }) => {
					tooltip = Tooltip
					const tip = new tooltip(el, options.tooltip)
					// @ts-expect-error
					el.tooltip = tip
				})
			} else {
				const tip = new tooltip(el, options.tooltip)
				// @ts-expect-error
				el.tooltip = tip
			}
		}

		if (options.children) {
			for (const child of options.children ?? []) {
				if (el === null) throw new Error('This should never happen')
				if (child) {
					el.appendChild(child)
				}
			}
		}

		if (options.onclick) {
			el.addEventListener('click', options.onclick as EventListener)
		}
	}

	if (DEV) {
		const stack = new Error().stack as string
		maybeAddOpenInEditorEventListener(stack, el)
	}

	return el as TOptions extends { tooltip: Partial<TooltipOptions> }
		? TElement & { tooltip: Tooltip } & PropSetters
		: TElement & PropSetters
}

/**
 * Adds an event listener to the element that opens the file in the editor
 * when the element is right-clicked with `meta` and `alt` keys pressed.
 *
 * @todo - This doesn't work yet -- the file/line is inaccurate and doesn't
 * correspond to the locatioin where the {@link create} function was called.
 *
 * @todo - Should this be one event listener that parses the url from the
 * target node's dataset?
 *
 */
function maybeAddOpenInEditorEventListener(stack: string, el: HTMLElement) {
	const file = parseFileFromStack(stack)
	if (file) {
		el.addEventListener(
			'contextmenu',
			e => {
				if ((e as MouseEvent).metaKey && (e as MouseEvent).altKey) {
					e.preventDefault()
					e.stopPropagation()
					console.log(e.target)
					openFileInEditor(file)
				}
			},
			{ capture: false },
		)
	}
}

function openFileInEditor(file: string) {
	const url = '/__open-in-editor?file=' + file
	fetch(url)
		.then(response => {
			console.log(response.status, url)
		})
		.catch(error => {
			console.error('Failed to open file in editor:', error)
		})
}

function parseFileFromStack(stack?: string) {
	const stackLine = stack?.split('\n')[2].trim()
	const url_regex = /http:\/\/[^ )]+/
	const timestamp_regex = /\?t=\d+/
	const url = stackLine?.match(url_regex)?.[0]?.replace(timestamp_regex, '')
	if (url) {
		try {
			const path = new URL(url).pathname.slice(1)
			return path
		} catch (e) {
			console.error('Failed to parse file from stack:', e)
		}
	}
}

// /**
//  * A decorator factory for the {@link create} function.
//  * @param tag - The element's tagname, i.e. `'button' | 'input' | 'div'` etc.
//  */
// function el<TagName extends keyof HTMLElementTagNameMap, Options extends CreateOptions>(
// 	tag: TagName,
// 	options?: Options,
// ) {
// 	return function (target: any, propertyKey: string) {
// 		const element = create(tag, options)
// 		Object.defineProperty(target, propertyKey, {
// 			configurable: false,
// 			enumerable: true,
// 			value: element,
// 		})
// 	}
// }

//-------------------------------------------------------------------------
//-------------------------------------------------------------------------

// interface ElMeta {
// 	tag: keyof HTMLElementTagNameMap
// 	options: CreateOptions
// }

// const __el = Symbol('__el')

// /**
//  * A decorator factory for the {@link create} function.
//  * @param tag - The element's tagname, i.e. `'button' | 'input' | 'div'` etc.
//  */
// function el<K extends ElMeta['tag'], TOptions extends ElMeta['options']>(
// 	tag: K,
// 	options?: TOptions,
// ) {
// 	return function (target: any, propertyKey: string) {
// 		if (!target.__el) {
// 			target.__el = {}
// 		}
// 		target.__el[propertyKey] = { tag, options }
// 	}
// }

// function initEl<
// 	T,
// 	K extends keyof T,
// 	TK extends T[K] extends Record<string, ElMeta> ? T[K] : never,
// >(instance: T, key: K) {
// 	const el = instance[key] as TK
// 	for (const k in el) {
// 		const { tag, options } = el[k]
// 		instance[key] = create(tag, options)
// 	}
// }

// class Test {
// 	@el('button', { classes: ['button'], textContent: 'click me' })
// 	button: HTMLButtonElement //! Property 'button' has no initializer and is not definitely assigned in the constructor.ts(2564)

// 	constructor() {
// 		initEl(this, __el) //! Argument of type 'typeof __el' is not assignable to parameter of type 'keyof this'. Type 'unique symbol' is not assignable to type '"button"'.ts(2345)
// 	}
// }
