import { Tooltip } from '../../actions/tooltip'
import { create } from '../../utils/create'
import { append } from '../../utils/mount'

export class CopyButton {
	button: HTMLDivElement
	icon: ReturnType<typeof this.copySvg>
	text: () => string

	active = false
	outro = false

	cooldown!: ReturnType<typeof setTimeout>
	outroCooldown!: ReturnType<typeof setTimeout>

	tooltip: Tooltip

	constructor(container: HTMLElement, text: () => string) {
		const button = create<HTMLDivElement>('div', {
			classes: ['copy-button'],
			title: 'Copy',
			attributes: {
				'aria-label': 'Copy',
			},
			variables: {
				'--copy-button-width': '1rem',
				'--copy-button-height': '1rem',
			},
		})

		const svgContainer = create('div', {
			classes: ['copy-button-svg-container'],
		})

		this.button = button
		this.icon = this.copySvg()
		this.text = text

		this.button.addEventListener('click', this.copy)

		append(container, this.button, svgContainer, this.icon.svg)

		this.tooltip = new Tooltip(this.button, {
			text: 'Copy',
			placement: 'top',
		})
	}

	copy = () => {
		if (typeof navigator === 'undefined') return
		if (this.active) return

		const text = this.text()
		if (!text) return

		navigator.clipboard?.writeText?.(text)
		this.#animateIn()
	}

	#animateIn = () => {
		this.active = true

		this.tooltip.show()
		this.button.blur()

		this.button.classList.add('active')
		this.icon.svg.classList.add('active')

		this.icon.front.setAttribute('x', '5.5')
		this.icon.front.setAttribute('y', '5.5')
		this.icon.front.setAttribute('rx', '10')
		this.icon.front.setAttribute('ry', '10')

		this.tooltip.text = 'Copied!'

		setTimeout(this.#animateOut, 1250)
	}

	#animateOut = () => {
		this.active = false
		this.outro = true

		this.button.classList.remove('active')
		this.icon.svg.classList.remove('active')
		this.icon.svg.classList.add('outro')
		this.button.classList.add('outro')

		this.icon.front.setAttribute('x', '9')
		this.icon.front.setAttribute('y', '9')
		this.icon.front.setAttribute('rx', '2')
		this.icon.front.setAttribute('ry', '2')

		setTimeout(this.#complete, 500)
	}

	#complete = () => {
		this.button.classList.remove('outro')
		this.icon.svg.classList.remove('outro')
		this.outro = false

		this.tooltip.text = 'Copy'
		this.tooltip.hide()
	}

	copySvg = () => {
		const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
		s.classList.add('icon', 'copy')
		s.setAttribute('width', '100%')
		s.setAttribute('height', '100%')
		s.setAttribute('viewBox', '0 0 24 24')
		s.setAttribute('fill', 'none')
		s.setAttribute('stroke', 'currentColor')
		s.setAttribute('stroke-width', '2')
		s.setAttribute('stroke-linecap', 'round')
		s.setAttribute('stroke-linejoin', 'round')

		const back = document.createElementNS('http://www.w3.org/2000/svg', 'path')
		back.classList.add('back')
		back.setAttribute('d', 'M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1')
		s.appendChild(back)

		const front = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
		front.classList.add('front')
		front.setAttribute('width', '13')
		front.setAttribute('height', '13')
		front.setAttribute('rx', '2')
		front.setAttribute('ry', '2')
		front.setAttribute('x', '9')
		front.setAttribute('y', '9')
		s.appendChild(front)

		const check = document.createElementNS('http://www.w3.org/2000/svg', 'path')
		check.classList.add('check')
		check.setAttribute('d', 'M17 9l-7 7-4-4')
		s.appendChild(check)

		return {
			svg: s,
			back,
			front,
			check,
		}
	}
}
