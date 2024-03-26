import { getScrollParent } from '../../dom/scrollParent'
import { isState, type State } from '../../utils/state'
import { values } from '../../utils/object'
import { create } from '../../utils/create'
import { nanoid } from '../../utils/nanoid'
import { Logger } from '../../utils/logger'

export type LabeledOption<T> = { label: string; value: T }
export type Option<T> = T | LabeledOption<T>

export interface SelectOptions<T> {
	container: HTMLDivElement
	selected?: Option<T>
	options: Option<T>[]
	/** Just used internally for the logger label. */
	title?: string
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
		selected: LabeledOption<T>
		options: LabeledOption<T>[]
	}
	elements: SelectElements

	/** The currently selected option. */
	#selected: LabeledOption<T>
	/** All options in the select controller. */
	options: LabeledOption<T>[]
	/** A map of all options by their (internally generated) id. */
	optionMap = new Map<
		string,
		{
			option: LabeledOption<T>
			element: HTMLDivElement
		}
	>()
	/** Whether the dropdown is currently visible. */
	expanded = false
	/** The initial selected option. */
	initialValue: LabeledOption<T>
	/** The initial options array. */
	initialOptions: LabeledOption<T>[]

	/** Used to prevent infinite loops when updating internally. */
	#bubble = true
	/** The parent element that the selected element is scrolling in. */
	#scrollParent: Element | undefined
	/** Cleanup function to run in {@link dispose}. */
	#disposeCallbacks = new Map<string, () => void>()
	/** Callbacks to run when the selected option changes. */
	#onChangeCallbacks = new Set<(value: LabeledOption<T>) => void>()
	#log: Logger

	constructor(options: SelectOptions<T>) {
		if (!options.options?.length) {
			throw new Error('Select controller must have at least one option')
		}

		if (options?.title) {
			this.#log = new Logger('Select:' + options.title, { fg: 'bisque' })
		} else {
			this.#log = new Logger('Select', { fg: 'blueviolet' })
		}

		this.opts = {
			container: options.container,
			selected: toLabeledOption(options.selected ? options.selected : options.options[0]),
			options: options.options.map(o => toLabeledOption(o)),
		}

		this.#selected = this.initialValue = this.opts.selected
		this.options = this.initialOptions = this.opts.options

		const container = create('div', {
			classes: ['fracgui-controller-select-container'],
			parent: options.container,
		})

		const selected = create('div', {
			classes: ['fracgui-controller-select-selected'],
			parent: container,
			textContent: String(this.getText(this.selected)),
		})

		selected.addEventListener('click', this.toggle)
		this.#disposeCallbacks.set('fracgui-select-element', () =>
			selected.removeEventListener('click', this.toggle),
		)

		const dropdown = create('div', {
			classes: ['fracgui-controller-select-dropdown'],
			parent: document.body,
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

		this.#log.fn('constructor').info({ opts: this.opts, this: this })
	}

	/** The currently selected option. Assigning a new value will update the UI. */
	get selected(): LabeledOption<T> {
		return this.#selected
	}
	set selected(v: Option<T> | State<Option<T>>) {
		this.#log.fn('set selected', v).debug()

		const newValue = isState(v) ? toLabeledOption(v.value) : toLabeledOption(v)

		this.#selected = newValue as LabeledOption<T>
		this.elements.selected.textContent = newValue.label

		if (!this.#bubble) {
			this.#bubble = true
			return
		}

		this.#callOnChange(this.#selected)
	}

	getText = (v: LabeledOption<T> | State<LabeledOption<T>>) => {
		if (isState(v)) {
			return v.value.label
		} else {
			return v.label
		}
	}

	/**
	 * Adds an option to the select controller.
	 * @param option The option to add.
	 * @returns The id of the added option.
	 */
	add = (option: Option<T>): string => {
		const opt = toLabeledOption(option)

		const id = nanoid()

		const el = create('div', {
			classes: ['fracgui-controller-select-option'],
			parent: this.elements.dropdown,
			innerText: opt.label,
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

		this.elements.options = this.elements.options.filter(el => el !== element)
		this.optionMap.delete(id)
		this.#disposeCallbacks.get(id)?.()

		element.remove()
	}

	select = (v: Option<T> | Event, bubble = true) => {
		this.#log.fn('select').info('v', v, { this: this })

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
		} else {
			const newValue = toLabeledOption(v)

			if (isState(newValue)) {
				this.selected = newValue.value as LabeledOption<T>
			} else if (isLabeledOption(newValue)) {
				this.#bubble = bubble
				this.selected = newValue
			} else {
				throw new Error('Invalid value: ' + newValue)
			}
		}
	}

	/** A callback that will be called whenever the selected option changes. */
	onChange = (callback: (value: LabeledOption<T>) => void) => {
		this.#onChangeCallbacks.add(callback)
		return this
	}

	/** Updates the UI to reflect the current state of the source color. */
	refresh = () => {
		// Make sure the selected value text is in the selected div.
		this.elements.selected.textContent = this.selected.label
	}

	/** Toggles the dropdown's visibility. */
	toggle = (e: MouseEvent) => {
		e.preventDefault()
		e.stopPropagation()

		this.#log.fn('toggle').info({ this: this })

		this.expanded ? this.close() : this.open()
	}

	/** Shows the dropdown. */
	open = () => {
		this.expanded = true
		this.elements.dropdown.classList.add('expanded')
		this.elements.selected.classList.add('active')

		this.updatePosition()

		// We need to monitor the selected element's scroll parent for scroll events to keep the dropdown position synced up.
		this.#scrollParent ??= getScrollParent(this.elements.selected)
		this.#scrollParent?.addEventListener('scroll', this.updatePosition)

		addEventListener('click', this.#clickOutside)
		setTimeout(() => {
			this.elements.dropdown.style.pointerEvents = 'all'
		}, 200)
	}

	/** Positions the dropdown to the selected element. */
	updatePosition = () => {
		const { top, left, width, height } = this.elements.selected.getBoundingClientRect()
		const scrollTop = this.elements.selected.scrollTop

		const dropdownWidth = this.elements.dropdown.getBoundingClientRect().width

		this.elements.dropdown.style.setProperty('top', `${top + height + scrollTop}px`)
		this.elements.dropdown.style.setProperty('width', `${Math.max(width, dropdownWidth)}px`)
		// We need to calculate the left position needed to center the dropdown agains the selected element.
		this.elements.dropdown.style.setProperty(
			'left',
			`${left + width / 2 - this.elements.dropdown.offsetWidth / 2}px`,
		)
	}

	/** Hides the dropdown. */
	close = () => {
		this.expanded = false
		this.elements.dropdown.classList.remove('expanded')
		this.elements.selected.classList.remove('active')
		this.elements.dropdown.style.pointerEvents = 'none'
		removeEventListener('click', this.#clickOutside)
		this.#scrollParent?.removeEventListener('scroll', this.updatePosition)
	}

	#clickOutside = (e: MouseEvent) => {
		if (!e.composedPath().includes(this.elements.container)) {
			this.close()
		}
	}

	#callOnChange = (v = this.selected) => {
		this.elements.selected.dispatchEvent(new CustomEvent('change', { detail: v }))
		for (const cb of this.#onChangeCallbacks) cb(v)
	}

	dispose() {
		for (const cb of this.#disposeCallbacks.values()) cb()

		for (const el of values(this.elements)) {
			if (Array.isArray(el)) {
				el.forEach(e => e.remove())
			} else el.remove()
		}

		this.#scrollParent?.removeEventListener('scroll', this.updatePosition)
		removeEventListener('click', this.#clickOutside)
	}
}

export function isLabeledOption<T>(v: any): v is LabeledOption<T> {
	return typeof v === 'object' && Object.keys(v).length === 2 && 'label' in v && 'value' in v
}

export function toLabeledOption<T>(v: Option<T>): LabeledOption<T> {
	if (isLabeledOption(v)) return v

	if (['string', 'number'].includes(typeof v)) {
		return {
			label: v,
			value: v,
		} as LabeledOption<T>
	}

	if (isState(v)) {
		return {
			label: String(v.value),
			value: v,
		}
	}

	if (v && typeof v === 'object') {
		console.log('')
		console.error('v', JSON.stringify(v))
		console.error('isNamedOption(v):', isLabeledOption(v))
		console.log('2 keys ===', Object.keys(v).length === 2)
		console.log('has label ===', 'label' in v)
		console.log('has value ===', 'value' in v)
		console.log('')

		return {
			label: JSON.stringify(v),
			value: v,
		}
	}

	console.error(
		'Invalid option:',
		v,
		'. Please provide a named option ({ label: string, value: T })' +
			'and place your value in the `value` property.',
	)
	throw new Error('Missing label:' + JSON.stringify(v))
}
