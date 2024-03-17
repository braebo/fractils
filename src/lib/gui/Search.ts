import { EventManager } from '$lib/utils/EventManager'
import { trimCss } from '../utils/trimCss'
import { create } from '../utils/create'

export class Search {
	elements: {
		container: HTMLElement
		element: HTMLElement
		input: HTMLInputElement
		button: HTMLButtonElement
		icon: SVGElement
	}

	showing = false

	#evm = new EventManager()

	constructor(public parent: HTMLElement) {
		const container = create('div', {
			classes: ['search-bar'],
			parent,
			cssText: trimCss(/*css*/ `{
				position: absolute;
                left: 0;
                top: 0;
                bottom: 0;

				display: flex;
				align-items: center;
				gap: 0.5rem;

				width: 100%;
				padding: 0.25rem 0.5rem;

				color: var(--fg-c);
				background: var(--bg-a);
				border-radius: var(--radius-sm);
				box-shadow: var(--shadow-inset);

				font-size: var(--font-xs);
				font-family: var(--font-b);

				transition: 0.15s;
			}`),
		})

		const button = create('button', {
			classes: ['search-button'],
			parent: container,
			cssText: trimCss(/*css*/ `{
                all: unset;
                width: 1.5rem;
                height: 1rem;

                color: var(--fg-c);
                background: var(--bg-a);
                border-radius: var(--radius-sm);
                box-shadow: var(--shadow-lg);

                font-size: var(--font-xs);
                font-family: var(--font-b);

                transition: 0.15s;
            }`),
		})

		const icon = this.#searchIcon()
		icon.classList.add('search-icon')
		icon.setAttribute('aria-hidden', 'true')
		icon.style.pointerEvents = 'none'
		button.appendChild(icon)

		const input = create('input', {
			classes: ['fractils-input-text-input', 'fractils-search-input'],
			parent: container,
			cssText: trimCss(/*css*/ `{
                width: 5rem;
                height: 1rem;
                border: none;

                color: var(--fg-c);
                background: var(--bg-a);
                border-radius: var(--radius-sm);
                box-shadow: var(--shadow-lg);
                outline: 1px solid var(--bg-c);

                font-size: var(--font-xs);
                font-family: var(--font-b);

                transition: 0.15s;
                pointer-events: none;
            }`),
		})

		this.#evm.listen(button, 'click', this.toggle, { capture: true })

		this.elements = {
			container,
			element: container,
			input,
			button,
			icon,
		}

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

		this.elements.input.style.outlineColor = 'var(--fg-c)'
		this.elements.input.focus()
	}

	hide = () => {
		this.showing = false
		this.elements.container.classList.remove('active')

		this.elements.input.style.outlineColor = 'var(--bg-a)'

		if (
			document.activeElement === this.elements.input ||
			document.activeElement === this.elements.button
		) {
			;(document.activeElement as HTMLElement)?.blur()
		}
	}

	#searchIcon() {
		const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
		svg.setAttribute('width', '100%')
		svg.setAttribute('height', '100%')
		svg.setAttribute('viewBox', '0 0 24 24')
		svg.setAttribute('fill', 'none')
		svg.setAttribute('stroke', 'currentColor')
		svg.setAttribute('stroke-width', '2')
		svg.setAttribute('stroke-linecap', 'round')
		svg.setAttribute('stroke-linejoin', 'round')

		const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
		path.setAttribute('d', 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z')
		svg.appendChild(path)

		return svg
	}
}
