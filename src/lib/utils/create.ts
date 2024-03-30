import type { TooltipOptions, Tooltip } from '../actions/tooltip'
import type { ElementStyle } from '$lib/color/css'

import { entries } from './object'

let tooltip: typeof Tooltip

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
	tooltip?: TooltipOptions
	innerHtml?: string
	children?: Element[]
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
					new tooltip(el, options.tooltip)
				})
			} else {
				new tooltip(el, options.tooltip)
			}
		}

		if (options.children) {
			for (const child of options.children ?? []) el.appendChild(child)
		}
}
