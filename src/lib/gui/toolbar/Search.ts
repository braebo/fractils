import type { Folder } from '../Folder'

import { TOOLTIP_DEFAULTS, Tooltip } from '../../actions/tooltip'
import { EventManager } from '../../utils/EventManager'
import { fuzzysearch } from '../../utils/fuzzySearch'
import { create } from '../../utils/create'

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
	get defaultTooltipText() {
		return 'Search ' + (this.folder.isRoot ? 'All' : this.folder.title)
	}

	private _evm = new EventManager()

	constructor(public folder: Folder) {
		const container = create('div', {
			classes: ['fracgui-toolbar-item', 'fracgui-search-container'],
		})
		folder.elements.toolbar.container.prepend(container)

		const input = create('input', {
			classes: ['fracgui-controller-text', 'fracgui-search-input', 'fracgui-cancel'],
			parent: container,
		})
		this._evm.listen(input, 'input', e => this.search(e.target.value))

		const button = create('button', {
			classes: ['fracgui-search-button', 'fracgui-cancel'],
			parent: container,
		})

		this.tooltip = new Tooltip(button, {
			text: this.defaultTooltipText,
			placement: 'left',
			delay: 500,
		})

		const icon = this._searchIcon()
		button.appendChild(icon)
		this._evm.listen(button, 'click', this.toggle)

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

		for (const [key, controller] of this.folder.allInputs) {
			const search_result = fuzzysearch(this.needle.toLocaleLowerCase(), key.toLowerCase())
				? 'hit'
				: 'miss'
			const result = this.needle === '' ? 'hit' : search_result
			const node = controller.elements.container

			// We already have the right state.
			if (node.dataset['search'] === result) continue

			const style = getComputedStyle(node)

			node.dataset['search_height'] ??= style.minHeight
			node.dataset['search_overflow'] ??= style.overflow ?? 'unset'
			node.dataset['search_contain'] ??= style.contain ?? 'none'
			node.dataset['search_opacity'] ??= style.opacity ?? 1

			if (result === 'hit') {
				this._expandInput(node)
			} else if (result === 'miss') {
				this._collapseInput(node)
			}

			node.dataset['search'] = result
		}
	}

	private _expandInput = async (node: HTMLElement) => {
		if (node.dataset['search'] === 'miss') {
			node.style.setProperty('overflow', node.dataset['search_overflow']!)
			node.style.setProperty('contain', node.dataset['search_contain']!)

			const targetHeight = node.dataset['search_height'] ?? '100%'

			const anim = node.animate(
				[
					{ opacity: 0, height: '0px', minHeight: '0px' },
					{ opacity: 1, height: targetHeight, minHeight: targetHeight },
				],
				{
					duration: 300,
					easing: 'cubic-bezier(0.23, 1, 0.32, 1)',
					fill: 'forwards',
				},
			)

			await anim.finished
			anim.commitStyles()
		}
	}

	private _collapseInput = async (node: HTMLElement) => {
		node.style.setProperty('overflow', 'hidden')
		node.style.setProperty('contain', 'size')

		const anim = node.animate([{ opacity: 0, height: '0px', minHeight: '0px' }], {
			duration: 300,
			easing: 'cubic-bezier(0.23, 1, 0.32, 1)',
			fill: 'forwards',
		})

		await anim.finished
		anim.commitStyles()
	}

	clear = () => {
		for (const [, controller] of this.folder.allInputs) {
			this._expandInput(controller.elements.container)
		}

		// todo - is it nicer to leave the search term in the input, or clear it?
		// this.elements.input.value = ''
	}

	toggle = (e?: MouseEvent) => {
		e?.stopImmediatePropagation()

		this.showing ? this.close() : this.open()
	}

	private _tooltipTimeout!: ReturnType<typeof setTimeout>

	open = () => {
		this.showing = true
		this.elements.container.classList.add('active')
		this.elements.input.focus()

		removeEventListener('click', this._clickOutside)
		addEventListener('click', this._clickOutside)
		removeEventListener('keydown', this._escape)
		addEventListener('keydown', this._escape)

		this.tooltip.hide()
		clearTimeout(this._tooltipTimeout)
		this._tooltipTimeout = setTimeout(() => {
			this.tooltip.text = 'Cancel (esc)'
			this.tooltip.placement = 'top'
			this.tooltip.offsetX = '-40px'
			this.tooltip.offsetY = '-2px'
		}, 100)

		// Open all folders that are closed, and mark them for closing on cancel/close.
		// todo - It would be nice to allow clicking a folder to keep it open after the search.
		for (const folder of this.folder.allChildren) {
			if (!folder.closed.value) continue
			folder.element.dataset['searchclosed'] = 'true'
			folder.open()
		}
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

		removeEventListener('click', this._clickOutside)
		removeEventListener('keydown', this._escape)

		this.tooltip.hide()
		clearTimeout(this._tooltipTimeout)
		this._tooltipTimeout = setTimeout(() => {
			this.tooltip.text = this.defaultTooltipText
			this.tooltip.placement = 'left'
			this.tooltip.offsetX = TOOLTIP_DEFAULTS.offsetX
			this.tooltip.offsetY = TOOLTIP_DEFAULTS.offsetY
		}, 100)

		// Re-close all folders that were opened by the search.
		// todo - It would be better to only open folders if they contain a search hit.
		// todo - It would be nice to allow clicking a folder to keep it open after the search.
		for (const folder of this.folder.allChildren) {
			if (!folder.element.dataset['searchclosed']) continue
			folder.element.dataset['searchclosed'] = ''
			folder.close()
		}
	}

	private _clickOutside = (e: MouseEvent) => {
		if (!this.needle && !e.composedPath().includes(this.elements.container)) {
			this.close()
		}
	}

	private _escape = (e: KeyboardEvent) => {
		if (e.key === 'Escape') {
			this.close()
		}
	}

	private _searchIcon() {
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

	dispose() {
		this._evm.dispose()
		this.tooltip.dispose()
		this.elements.container.remove()
	}
}
