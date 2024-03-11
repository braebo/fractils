// import { Controller } from './Controller'

import { values } from '../../utils/object'
import { create } from '../../utils/create'
import { nanoid } from '../../utils/nanoid'

export type NamedOption<T> = { text: string; value: T }
export type Option<T> = T | NamedOption<T>

export interface SelectOptions<T> {
	container: HTMLDivElement
	selected?: Option<T>
	options: Option<T>[]
}

export type SelectElements = {
	container: HTMLDivElement
	selected: HTMLDivElement
	dropdown: HTMLDivElement
	options: HTMLDivElement[]
}

export class Select<T> {
	opts: {
		container: HTMLDivElement
		selected: NamedOption<T>
		options: NamedOption<T>[]
	}
	elements: SelectElements

	#selected: NamedOption<T>
	/** All options in the select controller. */
	options: NamedOption<T>[]
	/** A map of all options by their (internally generated) id. */
	optionMap = new Map<
		string,
		{
			option: NamedOption<T>
			element: HTMLDivElement
		}
	>()

	/** Whether the dropdown is currently visible. */
	expanded = false
	/** The initial selected option. */
	initialValue: NamedOption<T>
	/** The initial options array. */
	initialOptions: NamedOption<T>[]

	#disposeCallbacks = new Map<string, () => void>()
	#onChangeCallbacks = new Set<(value: NamedOption<T>) => void>()

	constructor(options: SelectOptions<T>) {
		if (!options.options?.length) {
			throw new Error('Select controller must have at least one option')
		}

		this.opts = {
			container: options.container,
			selected: this.#toNamedOption(options.selected ? options.selected : options.options[0]),
			options: options.options.map((o) => this.#toNamedOption(o)),
		}

		this.#selected = this.initialValue = this.opts.selected
		this.options = this.initialOptions = this.opts.options

		const container = create<HTMLDivElement>('div', {
			classes: ['fracgui-controller-select-container'],
			parent: options.container,
		})

		const selected = create<HTMLDivElement>('div', {
			classes: ['fracgui-controller-select-selected'],
			parent: container,
			text: this.selected,
		})

		selected.addEventListener('click', this.toggle)
		this.#disposeCallbacks.set('fracgui-select-element', () =>
			selected.removeEventListener('click', this.toggle),
		)

		const dropdown = create<HTMLDivElement>('div', {
			classes: ['fracgui-controller-select-dropdown'],
			parent: container,
		})

		this.elements = {
			container,
			selected,
			dropdown,
			options: [],
		}

		for (const option of this.options) {
			this.add(option)
		}
	}

	/** The currently selected option. Assigning a new value will update the UI. */
	get selected(): NamedOption<T> {
		return this.#selected
	}
	set selected(v: Option<T>) {
		const option = this.#toNamedOption(v)
		this.#selected = option
		this.elements.selected.textContent = option.text

		this.#callOnChange(this.#selected)
	}

	/**
	 * Adds an option to the select controller.
	 * @param option The option to add.
	 * @returns The id of the added option.
	 */
	add = (option: Option<T>): string => {
		const opt = this.#toNamedOption(option)

		const id = nanoid()

		const el = create<HTMLDivElement>('div', {
			classes: ['fracgui-controller-select-option'],
			parent: this.elements.dropdown,
			innerText: opt.text,
			dataset: { optionId: id },
		})

		el.addEventListener('click', this.select)
		this.#disposeCallbacks.set(id, () => el.removeEventListener('click', this.select))

		this.optionMap.set(id, {
			option: opt,
			element: el,
		})
		this.elements.options.push(el)

		return id
	}

	/**
	 * Removes an option from the select controller.
	 * @param id The id of the option to remove.
	 */
	remove = (id: string) => {
		const found = this.optionMap.get(id)
		if (!found) {
			console.error({ this: this })
			throw new Error('No option found in map for id: ' + id)
		}

		const { option, element } = found

		// If the selected option is being removed, select the next option in the list.
		if (JSON.stringify(this.selected.value) === JSON.stringify(option.value)) {
			const nextIndex = this.options.indexOf(option) + 1
			const next = this.options[nextIndex % this.options.length]
			this.selected = next
		}

		this.elements.options = this.elements.options.filter((el) => el !== element)
		this.optionMap.delete(id)
		this.#disposeCallbacks.get(id)?.()

		element.remove()
	}

	select = (v: Option<T> | Event) => {
		if (v instanceof Event) {
			const target = v.target as HTMLDivElement

			const id = target.dataset.optionId
			if (typeof id !== 'string') {
				console.error({ target })
				throw new Error('No option id found on select click')
			}

			const option = this.optionMap.get(id)
			if (!option) {
				console.error({ target })
				throw new Error('No option found in map')
			}

			this.selected = option.option
			this.close()
		}
	}

	/** A callback that will be called whenever the selected option changes. */
	onChange = (callback: (value: NamedOption<T>) => void) => {
		this.#onChangeCallbacks.add(callback)
		return this
	}

	/** Updates the UI to reflect the current state of the source color. */
	refresh = () => {
		// Make sure the selected value text is in the selected div.
		this.elements.selected.textContent = this.selected.text
	}

	/** Toggles the dropdown's visibility. */
	toggle = (e: MouseEvent) => {
		e.preventDefault()
		e.stopPropagation()
		this.expanded ? this.close() : this.open()
	}

	/** Shows the dropdown. */
	open = () => {
		this.expanded = true
		this.elements.dropdown.classList.add('expanded')
		this.elements.selected.classList.add('active')
		addEventListener('click', this.#clickOutside)
		setTimeout(() => {
			this.elements.dropdown.style.pointerEvents = 'all'
		}, 200)
	}

	/** Hides the dropdown. */
	close = () => {
		this.expanded = false
		this.elements.dropdown.classList.remove('expanded')
		this.elements.selected.classList.remove('active')
		this.elements.dropdown.style.pointerEvents = 'none'
		removeEventListener('click', this.#clickOutside)
	}

	#clickOutside = (e: MouseEvent) => {
		if (!e.composedPath().includes(this.elements.container)) {
			this.close()
		}
	}

	isOption = (v: any): v is NamedOption<T> => {
		return typeof v === 'object' && Object.values(v).length === 2 && 'text' in v && 'value' in v
	}

	#toNamedOption = (v: Option<T>): NamedOption<T> => {
		if (typeof v === 'string') {
			return {
				text: v,
				value: v,
			} as NamedOption<T>
		}

		if (this.isOption(v)) return v

		throw new Error('Invalid option:' + JSON.stringify(v))
	}

	#callOnChange = (v = this.selected) => {
		for (const cb of this.#onChangeCallbacks) cb(v)
	}

	dispose() {
		for (const cb of this.#disposeCallbacks.values()) cb()

		for (const el of values(this.elements)) {
			if (Array.isArray(el)) {
				el.forEach((e) => e.remove())
			} else el.remove()
		}
	}
}
