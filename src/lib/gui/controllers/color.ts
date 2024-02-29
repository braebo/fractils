import type { ElementMap } from '../inputs/Input'
import type { ControllerFactory } from './types'

import { create } from '../../utils/create'
import type { InputColor } from '../inputs/Color'

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

interface ColorSliderElements extends ElementMap {
	container: HTMLDivElement
	a: HTMLInputElement
	b: HTMLInputElement
	c: HTMLInputElement
	d: HTMLInputElement
}

export const colorSlidersController: ControllerFactory<ColorSliderElements, InputColor> = (
	input,
	opts,
	parent,
) => {
	const container = create('div', {
		classes: ['gui-input-color-range-container'],
		parent,
	})

	const sliders = {} as ColorSliderElements

	// for (const key of ['a', 'b', 'c', 'd'] as const) {
	// 	sliders[key] = create<HTMLInputElement>('input', {
	// 		type: 'range',
	// 		classes: [
	// 			'gui-input-number-range',
	// 			'gui-input-color-range',
	// 			`gui-input-color-range-${key}`,
	// 		],
	// 		parent: container,
	// 		value: String(input.state.value[key]),
	// 	})
	// 	input.listen(sliders[key], 'input', input.updateState)
	// }

    console.log(input.state.value)

    sliders.a = create<HTMLInputElement>('input', {
        type: 'range',
        classes: [
            'gui-input-number-range',
            'gui-input-color-range',
            `gui-input-color-range-a`,
        ],
        parent: container,
        value: String(input.state.value.rgba.r),
    })

    sliders.b = create<HTMLInputElement>('input', {
        type: 'range',
        classes: [
            'gui-input-number-range',
            'gui-input-color-range',
            `gui-input-color-range-b`,
        ],
        parent: container,
        value: String(input.state.value.rgba.g),
    })

    sliders.c = create<HTMLInputElement>('input', {
        type: 'range',
        classes: [
            'gui-input-number-range',
            'gui-input-color-range',
            `gui-input-color-range-c`,
        ],
        parent: container,
        value: String(input.state.value.rgba.b),
    })

    sliders.d = create<HTMLInputElement>('input', {
        type: 'range',
        classes: [
            'gui-input-number-range',
            'gui-input-color-range',
            `gui-input-color-range-d`,
        ],
        parent: container,
        value: String(input.state.value.rgba.a),
    })

	return sliders
}
