import type { Folder } from './Folder'

import { EventManager } from '../utils/EventManager'
import { fuzzysearch } from '../utils/fuzzySearch'
import { TOOLTIP_DEFAULTS, Tooltip } from '../actions/tooltip'
import { create } from '../utils/create'

export class Search {
	elements: {
		container: HTMLElement
		input: HTMLInputElement
		button: HTMLButtonElement
		icon: SVGElement
	}

	needle = ''
	showing = false
	tooltip: Tooltip

	#evm = new EventManager()

	constructor(public folder: Folder) {
		const container = create('div', {
			classes: ['fracgui-search-container'],
			parent: folder.elements.toolbar,
		})

		const input = create('input', {
			classes: ['fracgui-input-text-input', 'fracgui-search-input', 'fractils-cancel'],
			parent: container,
		})
		this.#evm.listen(input, 'input', (e) => this.search(e.target.value))

		const button = create('button', {
			classes: ['fracgui-search-button', 'fractils-cancel'],
			parent: container,
		})

		this.tooltip = new Tooltip(button, {
			text: 'Search ' + (folder.isGui() ? 'All' : folder.title),
			placement: 'left',
			delay: 500,
		})

		const icon = this.#searchIcon()
		button.appendChild(icon)
		this.#evm.listen(button, 'click', this.toggle)

		this.elements = {
			container,
			input,
			button,
			icon,
		}

		return this
	}

	search = (query: string) => {
		this.needle = query

		if (!this.needle) {
			this.clear()
			return
		}

		for (const [key, controller] of this.folder.allControls) {
			if (fuzzysearch(this.needle, key)) {
				controller.elements.container.classList.add('fracgui-search-hit')
				controller.elements.container.classList.remove('fracgui-search-miss')
			} else {
				controller.elements.container.classList.remove('fracgui-search-hit')
				controller.elements.container.classList.add('fracgui-search-miss')
			}
		}
	}

	clear = () => {
		for (const [, controller] of this.folder.allControls) {
			controller.elements.container.classList.remove('fracgui-search-hit')
			controller.elements.container.classList.remove('fracgui-search-miss')
		}
	}

	toggle = (e?: MouseEvent) => {
		e?.stopImmediatePropagation()

		this.showing ? this.close() : this.open()
	}

	#tooltipTimeout!: ReturnType<typeof setTimeout>

	open = () => {
		this.showing = true
		this.elements.container.classList.add('active')
		this.elements.input.focus()

		addEventListener('click', this.#clickOutside)
		addEventListener('keydown', this.#escape)

		this.tooltip.hide()
		clearTimeout(this.#tooltipTimeout)
		this.#tooltipTimeout = setTimeout(() => {
			this.tooltip.text = 'Cancel (esc)'
			this.tooltip.placement = 'top'
			this.tooltip.offsetX = '-40px'
			this.tooltip.offsetY = '-2px'
		}, 100)
	}

	close = () => {
		this.showing = false
		this.elements.container.classList.remove('active')
		if (
			document.activeElement === this.elements.input ||
			document.activeElement === this.elements.button
		) {
			;(document.activeElement as HTMLElement)?.blur()
		}

		this.clear()

		removeEventListener('click', this.#clickOutside)
		removeEventListener('keydown', this.#escape)

		this.tooltip.hide()
		clearTimeout(this.#tooltipTimeout)
		this.#tooltipTimeout = setTimeout(() => {
			this.tooltip.text = `Search ${this.folder.title}`
			this.tooltip.placement = 'left'
			this.tooltip.offsetX = TOOLTIP_DEFAULTS.offsetX
			this.tooltip.offsetY = TOOLTIP_DEFAULTS.offsetY
		}, 100)
	}

	#clickOutside = (e: MouseEvent) => {
		if (!this.needle && !e.composedPath().includes(this.elements.container)) {
			this.close()
		}
	}

	#escape = (e: KeyboardEvent) => {
		if (e.key === 'Escape') {
			this.close()
		}
	}

	#searchIcon() {
		const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
		svg.setAttribute('aria-hidden', 'true')
		svg.setAttribute('width', '100%')
		svg.setAttribute('height', '100%')
		svg.setAttribute('viewBox', '0 0 20 20')
		svg.setAttribute('fill', 'none')
		svg.setAttribute('stroke', 'currentColor')
		svg.setAttribute('stroke-width', '2')
		svg.setAttribute('stroke-linecap', 'round')
		svg.setAttribute('stroke-linejoin', 'round')

		const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
		path.setAttribute('d', 'M13.34 13.34 L19 19')
		svg.appendChild(path)

		const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
		circle.setAttribute('cx', '8')
		circle.setAttribute('cy', '8')
		circle.setAttribute('r', '7')
		svg.appendChild(circle)

		svg.classList.add('search-icon')
		svg.style.pointerEvents = 'none'

		return svg
	}
}
