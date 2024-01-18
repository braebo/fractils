import type { State } from '../utils/state'
import type { Folder } from './Folder'

import { create } from '../utils/create'
import { state } from '../utils/state'

export type InputType =
	| 'Text'
	| 'Number'
	| 'Boolean'
	| 'Color'
	| 'Range'
	| 'Select'
	| 'Button'
	| 'Folder'
	| 'Textarea'

export type InputValue<T = InputType> = T extends 'Text'
	? string
	: T extends 'Number'
		? number
		: T extends 'Boolean'
			? boolean
			: T extends 'Color'
				? string
				: T extends 'Range'
					? number
					: T extends 'Select'
						? string
						: T extends 'Button'
							? void
							: T extends 'Folder'
								? Folder
								: T extends 'Textarea'
									? string
									: never

export interface InputOptions<T = InputType, V = InputValue<T>> {
	value: V
	title: string
	type: string
	folder: Folder
}

export class Input<T = InputType, V = InputValue<T>> {
	state: State<V>
	title: string
	type: string
	folder: Folder
	element: HTMLElement

	constructor(options: InputOptions<T, V>) {
		this.state = state(options.value)
		this.title = options.title
		this.type = options.type
		this.folder = options.folder
		this.element = this.#createElement()
	}

	#createElement() {
		const element = create('div', {
			classes: ['gui-control'],
			parent: this.folder.contentElement,
		})

		create('label', {
			classes: ['gui-label'],
			parent: element,
			textContent: this.title,
		})

		return element
	}
}
