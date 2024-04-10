import type { TooltipOptions, Tooltip } from '../actions/tooltip'
import type { ElementStyle } from '$lib/color/css'

import { entries } from './object'

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
	style?: Partial<Record<ElementStyle, string | number>>
	variables?: Record<`--${string}`, string | number>
	type?: string
	attributes?: Record<string, string>
	value?: string
	tooltip?: TooltipOptions
	innerHtml?: string
	children?: HTMLElement[]
	min?: number
	max?: number
	step?: number
} & Partial<Record<K, TK | unknown>>

export function create<
	const K extends keyof HTMLElementTagNameMap,
	TOptions extends CreateOptions<HTMLElementTagNameMap[K]>,
	TElement = HTMLElementTagNameMap[K] & { dataset: TOptions['dataset'] },
>(
	tagname: K,
	options?: TOptions,
): TOptions extends { tooltip: TooltipOptions } ? TElement & { tooltip: Tooltip } : TElement {
	const el = globalThis?.document?.createElement(tagname)

	if (options) {
		if (options.classes) el.classList.add(...options.classes)
		if (options.id) el.id = options.id
		if (options.dataset) Object.assign(el.dataset, options.dataset)
		if (options.textContent) el.textContent = options.textContent
		if (options.innerText) el.innerText = options.innerText
		if (options.cssText) el.style.cssText = options.cssText
		if (options.value && el instanceof HTMLInputElement) el.value = options.value
		if (options.type) el.setAttribute('type', options.type)
		if (options.min) el.setAttribute('min', String(options.min))
		if (options.max) el.setAttribute('max', String(options.max))
		if (options.step) el.setAttribute('step', String(options.step))
		if (options.innerHtml) el.innerHTML = options.innerHtml

		if (options.attributes) {
			for (const [key, value] of entries(options.attributes)) {
				el.setAttribute(key, value)
			}
		}

		if (options.style) {
			for (const [key, value] of entries(options.style)) {
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
			for (const child of options.children ?? []) el.appendChild(child)
		}
	}

	return el as TOptions extends { tooltip: TooltipOptions }
		? TElement & { tooltip: Tooltip }
		: TElement
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
