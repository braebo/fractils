import type { InputNumber, NumberInputOptions } from '../inputs/InputNumber'

import { svgChevron } from '../svg/chevronSvg'
import { create } from '../../utils/create'

export class NumberButtonsController {
	elements = {} as {
		container: HTMLDivElement
		increment: HTMLDivElement
		decrement: HTMLDivElement
	}

	constructor(
		public input: InputNumber,
		public opts: NumberInputOptions,
		public parent?: HTMLElement,
	) {
		this.elements.container = create('div', {
			classes: ['fracgui-input-number-buttons-container'],
			parent,
		})

		this.elements.increment = create('div', {
			classes: [
				'fracgui-controller',
				'fracgui-input-number-button',
				'fracgui-input-number-buttons-increment',
			],
			parent: this.elements.container,
		})
		this.elements.increment.appendChild(svgChevron())
		input.listen(this.elements.increment, 'pointerdown', this.rampChangeUp.bind(this))

		this.elements.decrement = create('div', {
			classes: [
				'fracgui-controller',
				'fracgui-input-number-button',
				'fracgui-input-number-buttons-decrement',
			],
			parent: this.elements.container,
		})
		const upsideDownChevron = svgChevron()
		upsideDownChevron.setAttribute('style', 'transform: rotate(180deg)')
		this.elements.decrement.appendChild(upsideDownChevron)
		input.listen(this.elements.decrement, 'pointerdown', this.rampChangeDown.bind(this))
	}

	rampChange(direction = 1) {
		const step = 'step' in this.opts ? (this.opts.step as number) : 1

		let delay = 300
		let stop = false
		let delta = 0
		let timeout: ReturnType<typeof setTimeout>

		const change = () => {
			clearTimeout(timeout)
			if (stop) return

			delta += delay
			if (delta > 1000) {
				delay /= 2
				delta = 0
			}

			this.input.set(this.input.state.value + step * direction)
			timeout = setTimeout(change, delay)
		}

		const stopChanging = () => {
			stop = true
			window.removeEventListener('pointerup', stopChanging)
			window.removeEventListener('pointercancel', stopChanging)
		}

		window.addEventListener('pointercancel', stopChanging, { once: true })
		window.addEventListener('pointerup', stopChanging, { once: true })

		change()
	}

	rampChangeUp() {
		this.rampChange(1)
	}

	rampChangeDown() {
		this.rampChange(-1)
	}
}
