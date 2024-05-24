// @ts-nocheck

import type { ColorFormat } from '$lib/color/types/colorFormat'
import type { StandardPropertiesHyphen } from 'csstype'
import type { ValidInput } from '$lib/gui/inputs/Input'
import type { Folder } from '$lib/gui/Folder'
import type { Color } from '$lib/color/color'

import { deepMergeOpts } from '$lib/gui/shared/deepMergeOpts'
import { isColorFormat } from '$lib/color/color'
import { Gui } from '$lib/gui/Gui'
import { DEV } from 'esm-env'

export interface DivTweakerOptions {
	/** The parent element to mount the {@link Gui} to. */
	container: HTMLElement
	/** Fail silently and gracefully. */
	swallowErrors: boolean
	styles: (keyof StandardPropertiesHyphen)[]
}

const DIV_TWEAKER_DEFAULTS: DivTweakerOptions = {
	container: document.body,
	swallowErrors: true,
	// prettier-ignore
	styles: [
		'accent-color',
		'background-color',
		'background-image',
		'background-position',
		'background-size',
		'border-color',
		'border-radius',
		'border-width',
		'outline-color',
		'outline-width',
		'outline-offset',
	],
} as const

export class DivTweaker {
	gui!: Gui
	opts!: DivTweakerOptions
	params = {} as const
	#computedStyle!: CSSStyleDeclaration

	constructor(
		public node: HTMLElement,
		options?: { container: HTMLElement } & Partial<DivTweakerOptions>,
	) {
		if (typeof document === 'undefined' || !node) {
			if (DEV) console.error(`DivTweaker: ${!node ? 'node' : 'document'} is undefined`)
			return
		}

		this.opts = deepMergeOpts([DIV_TWEAKER_DEFAULTS, options])

		this.gui = new Gui({
			title: 'Page Tweaker',
			container: options?.container ?? document.body,
			storage: undefined,
			closed: false,
			_windowManager: false,
			themer: true,
		})

		this.gui.addButton({
			title: '',
			text: 'highlight target div',
			onClick: this.highlightNode,
		})

		this.addStyleBindings()
	}

	#styleBindings = new Map<keyof StandardPropertiesHyphen | (string & {}), ValidInput>()
	folders = new Map<string, Folder>()

	addStyleBindings() {
		this.#computedStyle = window.getComputedStyle(this.node)

		const categories = new Set<string>()

		for (const key of this.opts.styles) {
			if (key.match(/-/g)?.length) {
				const category = key.split('-')[0]
				if (category) categories.add(category)
			}
		}

		for (const category of categories) {
			this.folders.set(category, this.gui.addFolder({ title: category }))
		}

		for (const key of this.opts.styles) {
			const prefix = key.split('-')[0]
			const folder = this.folders.get(prefix)
			// todo - can prolly delete #styleBindings
			this.#styleBindings.set(key, this.addStyleBinding(key, folder))
			// }
		}
	}

	addStyleBinding(key: keyof StandardPropertiesHyphen, folder: Folder = this.gui) {
		const value = this.#computedStyle.getPropertyValue(key as string)
		const prefix = key.split('-')[0]

		let controller: ValidInput

		if (key.includes('color') && isColorFormat(value)) {
			controller = folder.addColor({
				title: key.replace(prefix + '-', '') as string,
				value: value as ColorFormat,
				onChange: (v: Color | ColorFormat) => {
					if (typeof v === 'object' && 'isColor' in v) {
						const newColor = v.hex8String
						// Update the style if we get a valid CSS value.
						if (CSS.supports(key, newColor)) {
							this.node.style.setProperty(key as string, newColor)
						}
					}
				},
			})
		} else {
			controller = folder.add({
				title: key.replace(prefix + '-', '') as string,
				value: value as ColorFormat,
				onChange: v => {
					// Update the style if we get a valid CSS value.
					if (CSS.supports(key, v)) {
						this.node.style.setProperty(key as string, v)
					}
				},
			})
		}

		return controller
	}

	highlightNode = () => {
		const clone = this.node.cloneNode(true) as HTMLElement
		clone.style.setProperty('position', 'absolute')
		clone.style.setProperty(
			'top',
			this.node.getBoundingClientRect().top + this.node.scrollTop + 'px',
		)
		clone.style.setProperty(
			'left',
			this.node.getBoundingClientRect().left + this.node.scrollLeft + 'px',
		)
		clone.style.setProperty('opacity', '0')
		document.body.appendChild(clone)
		// clone.style.setProperty('z-index', '99999')

		// const { filter, opacity } = getComputedStyle(clone)

		clone.animate([{ opacity: 1 }], { duration: 250, fill: 'forwards' }).onfinish = () => {
			clone.animate(
				[
					{
						filter: 'brightness(90%) contrast(90%)',
					},
					{
						filter: 'brightness(110%) contrast(110%)',
					},
				],
				{
					fill: 'auto',
					duration: 300,
					direction: 'alternate',
					easing: 'ease-in-out',
					iterations: 4,
				},
			).onfinish = () => {
				clone.animate([{ opacity: 0 }], { duration: 250, fill: 'forwards' }).onfinish =
					() => clone.remove()
			}
		}
	}
}
