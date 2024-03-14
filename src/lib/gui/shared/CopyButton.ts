import { tooltip } from '$lib/actions/tooltip'
import { svgCopy } from '../svg/svgCopy'

export class CopyButton {
	button: HTMLButtonElement
	icon: SVGElement
	text: () => string

	active = false
	outro = false

	cooldown!: ReturnType<typeof setTimeout>
	outroCooldown!: ReturnType<typeof setTimeout>

	constructor(container: HTMLElement, text: () => string) {
		this.button = document.createElement('button')
		this.button.classList.add('copy-button')
		this.button.title = 'Copy'
		this.button.setAttribute('aria-label', 'Copy')

		this.icon = svgCopy()
		this.button.appendChild(this.icon)

		this.text = text
		this.button.addEventListener('click', this.copy)

		container.appendChild(this.button)

		tooltip(this.button, {
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

		clearTimeout(this.cooldown)
		clearTimeout(this.outroCooldown)

		this.active = true

		this.cooldown = setTimeout(() => {
			this.button.blur() // remove :active and :focus styles
			this.active = false
			this.outro = true

			clearTimeout(this.outroCooldown)
			this.outroCooldown = setTimeout(() => {
				this.outro = false
			}, 500)
		}, 1250)
	}
}
