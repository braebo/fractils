import { EventManager } from '$lib/utils/EventManager'
import { create } from '../utils/create'

export class Search {
	elements: {
		container: HTMLElement
		input: HTMLInputElement
		button: HTMLButtonElement
		icon: SVGElement
	}

	showing = false

	#evm = new EventManager()

	constructor(public parent: HTMLElement) {
		const container = create('div', {
			classes: ['fracgui-search-container'],
			parent,
		})

		const input = create('input', {
			classes: ['fracgui-input-text-input', 'fracgui-search-input', 'fractils-cancel'],
			parent: container,
		})

		const button = create('button', {
			classes: ['fracgui-search-button', 'fractils-cancel'],
			parent: container,
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

		// Search.style()

		return this
	}

	toggle = (e?: MouseEvent) => {
		e?.stopImmediatePropagation()
		// e?.preventDefault()

		this.showing ? this.hide() : this.show()
	}

	show = () => {
		this.showing = true
		this.elements.container.classList.add('active')
		this.elements.input.focus()
	}

	hide = () => {
		this.showing = false
		this.elements.container.classList.remove('active')
		if (
			document.activeElement === this.elements.input ||
			document.activeElement === this.elements.button
		) {
			;(document.activeElement as HTMLElement)?.blur()
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

	// static css = /*css*/ ``
	// static style = stylesheet(Search.css)
}
