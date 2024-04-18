import type { ControllerFactory } from './types'

import { create } from '../../utils/create'

export const textareaController: ControllerFactory<HTMLInputElement> = (input, _opts, parent) => {
	const controller = create('input', {
		type: 'textarea',
		classes: ['fracgui-controller', 'fracgui-controller-textarea'],
		value: input.state.value,
		parent,
		attributes: {
			spellcheck: 'false',
		},
	})

	return controller
}
