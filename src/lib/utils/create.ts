import type { TooltipOptions } from '../actions/tooltip'
import type { JavascriptStyleProperty } from '$lib/css/types'

import { Tooltip } from '../actions/tooltip'
import { entries } from './object'
import { DEV } from 'esm-env'

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
	style?: Partial<Record<JavascriptStyleProperty, string | number>>
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
	tooltipInstance?: Tooltip
	onclick?: (e: MouseEvent) => void
} & Partial<Record<K, TK | unknown>>

export function create<
	const K extends keyof HTMLElementTagNameMap,
	TOptions extends CreateOptions<HTMLElementTagNameMap[K]>,
	TElement = HTMLElementTagNameMap[K] & { dataset: TOptions['dataset'] },
>(
	tagname: K,
	options?: TOptions,
): TOptions extends { tooltip: Partial<TooltipOptions> }
	? TElement & { tooltip: Tooltip }
	: TElement {
	const el = globalThis?.document?.createElement(tagname)

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
			// @ts-expect-error
			el.tooltip = {}

			if (options.tooltipInstance) {
				// @ts-expect-error
				el.tooltip = options.tooltipInstance
			} else {
				// @ts-expect-error
				el.tooltip = new Tooltip(el, options.tooltip)
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
		? TElement & { tooltip: Tooltip }
		: TElement
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
