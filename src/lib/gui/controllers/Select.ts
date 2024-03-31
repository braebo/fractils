import type { State } from '../../utils/state'

import { getScrollParent } from '../../dom/scrollParent'
import { stringify } from '../../utils/stringify'
import { debrief } from '../../utils/debrief'
import { isState } from '../../utils/state'
import { values } from '../../utils/object'
import { create } from '../../utils/create'
import { nanoid } from '../../utils/nanoid'
import { Logger } from '../../utils/logger'
import { Controller } from './Controller'

export type LabeledOption<T> = { label: string; value: T }
export type Option<T> = T | LabeledOption<T>

export interface SelectInputOptions<T> {
	container: HTMLDivElement
	disabled: boolean
	/**
	 * The default selected option. If not provided, the first option in
	 * the `options` array will be selected.
	 * @todo - We need a 'blank' state where no option is selected.
	 */
	selected?: Option<T>
	/**
	 * The options to display in the select controller.  Pass each
	 * option as a {@link LabeledOption} (`{ label: string, value: T }`)
	 * to specify text to display for each option.  Alternatively, if the
	 * label you want to display is already on the option object, use the
	 * `labelKey` property to specify the key to use as the label.
	 */
	options: Option<T>[]
	/**
	 * An optional key on each {@link Option} to use as the `label` when
	 * converting to a {@link LabeledOption}.
	 */
	labelKey?: string
	/** Just used internally for the logger label. */
	title?: string
	/**
	 * When `true`, options will be automatically selected when a user
	 * hovers over them in the dropdown.  If none are selected, the
	 * original value will be restored.
	 * @default true
	 */
	selectOnHover?: boolean
}

export type SelectElements = {
	container: HTMLDivElement
	selected: HTMLDivElement
	dropdown: HTMLDivElement
	options: HTMLDivElement[]
}

export class Select<T> extends Controller<LabeledOption<T>, SelectElements> {
	input = undefined as never
	element: HTMLDivElement

	opts: SelectInputOptions<T> & {
		selected: LabeledOption<T>
		options: LabeledOption<T>[]
		selectOnHover: boolean
	}
	elements: SelectElements

	/** The currently selected option. */
	#selected: LabeledOption<T>
	/** The currently selected option preserved when hot-swapping on:hover. */
	#currentSelection: LabeledOption<T>
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
	bubble = true
	/** The parent element that the selected element is scrolling in. */
	#scrollParent: Element | undefined

	#log: Logger

	constructor(options: SelectInputOptions<T>) {
		const opts = {
			...options,
			selected: toLabeledOption(options.selected ? options.selected : options.options[0]),
			options: options.options.map(o => toLabeledOption(o)),
			selectOnHover: options.selectOnHover ?? true,
		}
		super(opts)

		this.opts = opts

		if (!options.options?.length) {
			throw new Error('Select controller must have at least one option')
		}

		if (options?.title) {
			this.#log = new Logger('Select:' + options.title, { fg: 'bisque' })
		} else {
			this.#log = new Logger('Select', { fg: 'blueviolet' })
		}

		this.#selected = this.#currentSelection = this.initialValue = this.opts.selected
		this.options = this.initialOptions = this.opts.options

		const container = create('div', {
			classes: ['fracgui-controller-select-container'],
			parent: options.container,
		})
		this.element = container

		const selected = create('div', {
			classes: ['fracgui-controller-select-selected'],
			parent: container,
			textContent: String(this.getText(this.selected)),
		})

		this.listen(selected, 'click', this.toggle)

		const dropdown = create('div', {
			classes: ['fracgui-controller-select-dropdown'],
			// parent: document.body
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

		this.disabled = this.opts.disabled

		this.#log.fn('constructor').info({ opts: this.opts, this: this })
	}

	/** The currently selected option. Assigning a new value will update the UI. */
	get selected(): LabeledOption<T> {
		return this.#selected
	}
	set selected(v: Option<T> | State<Option<T>>) {
		this.#log.fn('set selected').debug(v)

		const newValue = isState(v) ? toLabeledOption(v.value) : toLabeledOption(v)

		this.#selected = newValue as LabeledOption<T>
		this.elements.selected.textContent = newValue.label

		if (!this.bubble) {
			this.bubble = true
			return
		}

		this.callOnChange(this.#selected)
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

		this.listen(el, 'click', this.select)
		// el.addEventListener('click', this.select)
		// this.#disposeCallbacks.set(id, () => el.removeEventListener('click', this.select))

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

		element.remove()
	}

	select = (
		v: Option<T> | Event,
		/**
		 * When `false`, the select controller won't call {@link onChange}
		 * to notify the parent Input or other listeners of the change.
		 * @default true
		 */
		bubble = true,
	) => {
		if (this.disabled) {
			this.#log.fn('select').warn('Select is disabled', { this: this })
			return this
		}

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
				this.bubble = bubble
				this.selected = newValue
			} else {
				throw new Error('Invalid value: ' + newValue)
			}
		}

		return this
	}

	/** Updates the UI to reflect the current state of the source color. */
	refresh = () => {
		// Make sure the selected value text is in the selected div.
		this.elements.selected.textContent = this.selected.label
		return this
	}

	/** Toggles the dropdown's visibility. */
	toggle = (e: MouseEvent) => {
		this.#log.fn('toggle').info({ this: this })
		this.expanded ? this.close() : this.open()
	}

	/** Shows the dropdown. */
	open = () => {
		this.expanded = true
		document.body.appendChild(this.elements.dropdown)
		this.elements.dropdown.classList.add('expanded')
		this.elements.selected.classList.add('active')

		this.updatePosition()

		// We need to monitor the selected element's scroll parent for scroll events to keep the dropdown position synced up.
		this.#scrollParent ??= getScrollParent(this.elements.selected)
		this.#scrollParent?.addEventListener('scroll', this.updatePosition)

		addEventListener('keydown', this.#closeOnEscape)
		addEventListener('click', this.#clickOutside)
		setTimeout(() => {
			this.elements.dropdown.style.pointerEvents = 'all'
		}, 200)

		if (this.opts.selectOnHover) {
			this.#currentSelection = this.selected

			for (const [, { option, element }] of this.optionMap) {
				element.addEventListener('mouseenter', () => {
					this.select(option)
				})
			}
		}
	}

	/** Positions the dropdown to the selected element. */
	updatePosition = () => {
		const { top, left, width, height } = this.elements.selected.getBoundingClientRect()
		const scrollTop = this.elements.selected.scrollTop

		this.elements.dropdown.style.setProperty('width', 'unset')
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
		removeEventListener('keydown', this.#closeOnEscape)
		removeEventListener('click', this.#clickOutside)
		this.#scrollParent?.removeEventListener('scroll', this.updatePosition)
		setTimeout(() => {
			this.elements.dropdown.remove()
		}, 200)

		if (this.opts.selectOnHover) {
			// this.select(this.#currentSelection)
			for (const [id, { option, element }] of this.optionMap) {
				element.removeEventListener('mouseenter', () => {
					this.select(option)
				})
			}
		}
	}

	#closeOnEscape = (e: KeyboardEvent) => {
		if (e.key === 'Escape') {
			this.close()
			if (this.opts.selectOnHover) {
				this.select(this.#currentSelection)
			}
		}
	}

	#clickOutside = (e: MouseEvent) => {
		if (!e.composedPath().includes(this.elements.container)) {
			this.close()
			if (this.opts.selectOnHover) {
				this.select(this.#currentSelection)
			}
		}
	}

	enable() {
		this.elements.selected.classList.remove('disabled')
		super.enable()
		return this
	}

	disable() {
		this.elements.selected.classList.add('disabled')
		super.disable()
		return this
	}

	dispose() {
		for (const el of values(this.elements)) {
			if (Array.isArray(el)) {
				el.forEach(e => e.remove())
			} else el.remove()
		}

		this.#scrollParent?.removeEventListener('scroll', this.updatePosition)
		removeEventListener('click', this.#clickOutside)

		super.dispose()
	}
}

const log = new Logger('Select utils', { fg: 'grey' })

export function isLabeledOption<T>(v: any): v is LabeledOption<T> {
	return typeof v === 'object' && Object.keys(v).length === 2 && 'label' in v && 'value' in v
}

export function toLabeledOption<T>(v: Option<T>): LabeledOption<T> {
	if (isLabeledOption(v)) return v
	log.fn('toLabeledOption').debug(v)

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

export function fromLabeledOption<T>(v: Option<T> | State<Option<T>>): T {
	log.fn('fromLabeledOption', debrief(stringify(v))).debug()

	function rtrn(v: any) {
		log.fn('fromLabeledOption').debug('Return Value', v)
		return v
	}

	if (isLabeledOption(v)) return rtrn(v.value)

	if (isState(v)) {
		const t = v.value
		if (isLabeledOption(t)) {
			return rtrn(t.value)
		} else {
			return rtrn(t as T)
		}
	}

	return v as T
}
