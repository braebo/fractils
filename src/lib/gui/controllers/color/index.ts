// import type { ColorSliderElements, InputColor } from '../../inputs/InputColor'
// import type { ControllerFactory } from '../types'

// import { create } from '../../../utils/create'

// export const colorController: ControllerFactory<HTMLInputElement> = (input, opts, parent) => {
// 	const controller = create('input', {
// 		type: 'color',
// 		classes: ['fracgui-input-color-input'],
// 		value: input.state.value.hex,
// 		parent,
// 	})

// 	input.listen(controller, 'input', input.refresh)

// 	return controller
// }

// export const colorSlidersController: ControllerFactory<ColorSliderElements, InputColor> = (
// 	input,
// 	opts,
// 	parent,
// ) => {
// 	const container = create('div', {
// 		classes: ['fracgui-input-color-sliders-container'],
// 		parent,
// 	})

// 	const sliders = {} as ColorSliderElements

// 	console.log(input.state.value)

// 	for (const [key, title] of [
// 		['a', input.#aTitle],
// 		['b', input.#bTitle],
// 		['c', input.#cTitle],
// 		['d', input.#dTitle],
// 	] as const) {
// 		const c = create('div', {
// 			type: 'range',
// 			classes: [
// 				'fracgui-input-color-sliders-input-container',
// 				`fracgui-input-color-sliders-input-container-${key}`,
// 			],
// 			parent: container,
// 			value: input[key],
// 		})

// 		sliders[key] = {
// 			container: c,
// 			title: create('div', {
// 				classes: ['fracgui-input-color-slider-title', `fracgui-input-color-slider-title-${key}`],
// 				parent: container,
// 				innerText: title,
// 			}),
// 			input: create('input', {
// 				type: 'range',
// 				classes: [
// 					'fracgui-input-number-range',
// 					'fracgui-input-color-range',
// 					`fracgui-input-color-range-${key}`,
// 				],
// 				parent: container,
// 				value: String(input.state.value.rgba.r),
// 			}),
// 		}

// 		input.listen(sliders[key].input, 'input', input.refresh)
// 	}

// 	return sliders
// }
