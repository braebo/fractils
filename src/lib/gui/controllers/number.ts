import type { Input, ElementMap, InputOptions, NumberInputOptions } from '../inputs/Input'

import { create } from '../../utils/create'
import { svgChevron } from '../svg/chevron'

/**
 * Controller factory funtions create the DOM elements that are
 * used to control the input, and bind their change events to
 * the input's {@link Input.updateState | updateState} method.
 */
type ControllerFactory<
	TElement extends Element | ElementMap,
	TInput extends Input = Input<any>,
	TOptions extends InputOptions<any> = InputOptions,
> = (input: TInput, opts: TOptions, parent?: HTMLElement) => TElement

export const numberController: ControllerFactory<HTMLInputElement> = (input, opts, parent) => {
	const controller = create<HTMLInputElement>('input', {
		type: 'number',
		classes: ['gui-input-number-input'],
		value: String(input.state.value),
		parent,
	})

	if ('step' in opts) {
		controller.step = String(opts.step as NumberInputOptions['step'])
	}

	input.listen(controller, 'input', input.updateState)

	return controller
}

export const rangeController: ControllerFactory<HTMLInputElement> = (input, opts, parent) => {
	const range = create<HTMLInputElement>('input', {
		type: 'range',
		classes: ['gui-input-number-range'],
		value: String(input.state.value),
		parent,
	})

	if ('min' in opts) range.min = String(opts.min)
	if ('max' in opts) range.max = String(opts.max)
	if ('step' in opts) range.step = String(opts.step)

	input.listen(range, 'input', input.updateState)

	return range
}

export const numberControllerButtons: ControllerFactory<{
	container: HTMLDivElement
	increment: HTMLDivElement
	decrement: HTMLDivElement
}> = (input, opts, parent) => {
	const container = create<HTMLDivElement>('div', {
		classes: ['gui-input-number-buttons-container'],
		parent,
	})

	const increment = create<HTMLDivElement>('div', {
		classes: ['gui-input-number-button', 'gui-input-number-buttons-increment'],
		parent: container,
	})
	increment.appendChild(svgChevron())
	input.listen(increment, 'pointerdown', rampChangeUp)

	const decrement = create<HTMLDivElement>('div', {
		classes: ['gui-input-number-button', 'gui-input-number-buttons-decrement'],
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

			input.updateState(input.state.value + step * direction)
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
