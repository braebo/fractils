import type { ColorSliderElements, InputColor } from '../inputs/Color'
import type { ControllerFactory } from './types'

import { create } from '../../utils/create'

export const colorController: ControllerFactory<HTMLInputElement> = (input, opts, parent) => {
	const controller = create<HTMLInputElement>('input', {
		type: 'color',
		classes: ['gui-input-color-input'],
		value: input.state.value.hex,
		parent,
	})

	input.listen(controller, 'input', input.updateState)

	return controller
}

export const colorSlidersController: ControllerFactory<ColorSliderElements, InputColor> = (
	input,
	opts,
	parent,
) => {
	const container = create('div', {
		classes: ['gui-input-color-sliders-container'],
		parent,
	})

	const sliders = {} as ColorSliderElements

	console.log(input.state.value)

	for (const [key, title] of [
		['a', input.aTitle],
		['b', input.bTitle],
		['c', input.cTitle],
		['d', input.dTitle],
	] as const) {
		const c = create<HTMLDivElement>('div', {
			type: 'range',
			classes: [
				'gui-input-color-sliders-input-container',
				`gui-input-color-sliders-input-container-${key}`,
			],
			parent: container,
			value: input[key],
		})

		sliders[key] = {
			container: c,
			title: create('div', {
				classes: ['gui-input-color-slider-title', `gui-input-color-slider-title-${key}`],
				parent: container,
				innerText: title,
			}),
			input: create<HTMLInputElement>('input', {
				type: 'range',
				classes: [
					'gui-input-number-range',
					'gui-input-color-range',
					`gui-input-color-range-${key}`,
				],
				parent: container,
				value: String(input.state.value.rgba.r),
			}),
		}

		input.listen(sliders[key].input, 'input', input.updateState)
	}

	return sliders
}
