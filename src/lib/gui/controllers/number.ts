import type { InputNumber } from '../inputs/InputNumber'
import type { ElementMap } from '../inputs/Input'
import type { ControllerFactory } from './types'

import { svgChevron } from '../svg/chevronSvg'
import { create } from '../../utils/create'

export const rangeController: ControllerFactory<HTMLInputElement> = (input, opts, parent) => {
	const range = create('input', {
		type: 'range',
		classes: ['fracgui-controller', 'fracgui-input-number-range'],
		value: String(input.state.value),
		parent,
	})

	if ('min' in opts) range.min = String(opts.min)
	if ('max' in opts) range.max = String(opts.max)
	if ('step' in opts) range.step = String(opts.step)

	input.listen(range, 'input', input.set.bind(input) as EventListener)

	return range
}

export const numberButtonsController: ControllerFactory<
	{
		container: HTMLDivElement
		increment: HTMLDivElement
		decrement: HTMLDivElement
	},
	InputNumber
> = (input, opts, parent) => {
	const container = create('div', {
		classes: ['fracgui-input-number-buttons-container'],
		parent,
	})

	const increment = create('div', {
		classes: [
			'fracgui-controller',
			'fracgui-input-number-button',
			'fracgui-input-number-buttons-increment',
		],
		parent: container,
	})
	increment.appendChild(svgChevron())
	input.listen(increment, 'pointerdown', rampChangeUp)

	const decrement = create('div', {
		classes: [
			'fracgui-controller',
			'fracgui-input-number-button',
			'fracgui-input-number-buttons-decrement',
		],
		parent: container,
	})
	const upsideDownChevron = svgChevron()
	upsideDownChevron.setAttribute('style', 'transform: rotate(180deg)')
	decrement.appendChild(upsideDownChevron)
	input.listen(decrement, 'pointerdown', rampChangeDown)

	function rampChange(direction = 1) {
		const step = 'step' in opts ? (opts.step as number) : 1

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

			input.set(input.state.value + step * direction)
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

	function rampChangeUp() {
		rampChange(1)
	}

	function rampChangeDown() {
		rampChange(-1)
	}

	return {
		container,
		increment,
		decrement,
	} as const satisfies ElementMap
}
