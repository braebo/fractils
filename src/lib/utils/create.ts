import type { ElementStyle } from '$lib/color/css'

import { entries } from './object'

export type CreateOptions = {
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
} & Partial<Record<keyof HTMLElement | keyof HTMLInputElement, any>>

export function create<const K extends keyof HTMLElementTagNameMap>(
	tagname: K,
	options?: CreateOptions,
	...children: HTMLElement[]
): HTMLElementTagNameMap[K] {
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
	}

	for (const child of children) el.appendChild(child)

	return el
}
