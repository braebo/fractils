import type { State } from '../../utils/state'
import type { Input } from '../inputs/Input'

import { disableable, type Disableable } from '../../decorators/disableable-class-decorator'
import { getScrollParent } from '../../dom/scrollParent'
import { EventManager } from '../../utils/EventManager'
import { isState } from '../../utils/state'
import { values } from '../../utils/object'
import { create } from '../../utils/create'
import { Logger } from '../../utils/logger'

export type LabeledOption<T> = { label: string; value: T }
export type Option<T> = T | LabeledOption<T>

export interface SelectInputOptions<T> {
	readonly __type?: 'SelectInputOptions'
	input: Input
	container: HTMLDivElement
	disabled: boolean | (() => boolean)
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
	labelKey?: T extends Record<infer K, any> ? K : never
	/**
	 * When `true`, options will be automatically selected when a user
	 * hovers over them in the dropdown.  If none are selected, the
	 * original value will be restored.
	 * @default true
	 */
	selectOnHover?: boolean
	/**
	 * Just used internally for the logger label.
	 * @internal
	 */
	title?: string
}

export type SelectElements = {
	container: HTMLDivElement
	selected: HTMLDivElement
	dropdown: HTMLDivElement
	options: HTMLDivElement[]
}

interface SelectInputEvents<T> {
	change: LabeledOption<T>
	refresh: void
	open: void
	close: void
	cancel: void
}

export interface Select<T> extends Disableable {}

@disableable
export class Select<T> {
	readonly __type = 'Select' as const
	element: HTMLDivElement

	private _opts: SelectInputOptions<T> & {
		selected: LabeledOption<T>
		options: LabeledOption<T>[]
		selectOnHover: boolean
	}
	elements: SelectElements

	/**
	 * All options in the select controller.
	 */
	options: LabeledOption<T>[]

	/**
	 * A map of all options by their (internally generated) id.
	 */
	optionMap = new Map<
		string,
		{
			option: LabeledOption<T>
			element: HTMLDivElement
		}
	>()

	/**
	 * Whether the dropdown is currently visible.
	 */
	expanded = false

	/**
	 * The initial selected option.
	 */
	initialValue: LabeledOption<T>

	/**
	 * The initial options array.
	 */
	initialOptions: LabeledOption<T>[]

	/**
	 * When true, clicking clicks will be ignored.
	 */
	disableClicks = false

	/**
	 * Used to prevent infinite loops when updating internally.
	 */
	bubble = true

	/**
	 * The currently selected option.
	 */
	private _selected: LabeledOption<T>

	/**
	 * The currently selected option preserved when hot-swapping on:hover.
	 */
	private _currentSelection: LabeledOption<T>

	/**
	 * The parent element that the selected element is scrolling in.
	 */
	private _scrollParent: Element | undefined

	private _evm = new EventManager<SelectInputEvents<T>>([
		'change',
		'refresh',
		'cancel',
		'open',
		'close',
	])

	/**
	 * Used to subscribe to {@link SelectInputEvents}.
	 */
	on = this._evm.on.bind(this._evm)

	private _log: Logger

	constructor(options: SelectInputOptions<T>) {
		const opts = {
			...options,
			selected: toLabeledOption(options.selected ? options.selected : options.options[0]),
			options: options.options.map(o => toLabeledOption(o)),
			selectOnHover: options.selectOnHover ?? true,
		}
		this._opts = opts

		if (options?.title) {
			this._log = new Logger(`Select ${options.title}`, { fg: 'burlywood' })
		} else {
			this._log = new Logger('Select', { fg: 'blueviolet' })
		}

		this._selected = this._currentSelection = this.initialValue = this._opts.selected
		this.options = this.initialOptions = this._opts.options

		const container = create('div', {
			classes: ['fracgui-controller-select-container'],
			parent: options.container,
		})
		this.element = container

		const selected = create('div', {
			classes: ['fracgui-controller-select-selected'],
			parent: container,
			textContent: String(this.getLabel(this.selected)),
		})

		this._evm.listen(selected, 'click', () => {
			if (this.disableClicks) {
				return
			}

			this.toggle()
		})

		const dropdown = create('div', { classes: ['fracgui-controller-select-dropdown'] })

		this.elements = {
			container,
			selected,
			dropdown,
			options: [],
		}

		for (const option of this.options) {
			this.add(option)
		}

		this.disabled = this._opts.disabled

		this._log.fn('constructor').debug({ opts: this._opts, this: this })
	}

	/**
	 * The currently selected option. Assigning a new value will update the UI.
	 */
	get selected(): LabeledOption<T> {
		return this._selected
	}
	set selected(v: Option<T> | State<Option<T>>) {
		this._log.fn('set selected').debug(v)

		const newValue = isState(v) ? toLabeledOption(v.value) : toLabeledOption(v)

		this._selected = newValue as LabeledOption<T>
		this.elements.selected.innerHTML = newValue.label

		if (!this.bubble) {
			this.bubble = true
			return
		}

		this._evm.emit('change', this.selected)
	}

	getLabel(v: LabeledOption<T> | State<LabeledOption<T>>) {
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
	add(option: Option<T>) {
		const opt = toLabeledOption(option)

		const el = create('div', {
			classes: ['fracgui-controller-select-option'],
			parent: this.elements.dropdown,
			innerText: opt.label,
		})

		const id = this._evm.listen(el, 'click', this.select)
		el.dataset['optionId'] = id

		this.optionMap.set(id, {
			option: opt,
			element: el,
		})

		this.elements.options.push(el)

		this._log.fn('add').debug({ option, added: this.optionMap.get(id), id, this: this })

		return this
	}

	/**
	 * Removes an option from the select controller by id.
	 */
	remove(
		/**
		 * The id of the option to remove.
		 */
		id: string,
		/**
		 * If false, the select controller will not attempt to select a new fallback option
		 * when the removed option is also the currently selection one.
		 * @default false
		 */
		autoSelectFallback = false,
	) {
		const found = this.optionMap.get(id)
		if (!found) {
			console.error({ this: this })
			throw new Error('No option found in map for id: ' + id)
		}

		const btn = found

		this._log.fn('remove').debug({ btn, id, this: this })

		// If the selected option is being removed, select the next option in the list.
		if (
			autoSelectFallback &&
			JSON.stringify(this.selected.value) === JSON.stringify(btn.option.value)
		) {
			const nextIndex = this.options.indexOf(btn.option) + 1
			const fallback = this.options[nextIndex % this.options.length]
			// this.selected = next
			// this.select(next)
			this._log
				.fn('remove')
				.debug('Auto-selecting fallback btn', { fallback, btn, id, this: this })

			this.select(fallback, false)
		}

		this.elements.options = this.elements.options.filter(el => el !== btn.element)
		btn.element.remove()

		this.options = this.options.filter(o => o.label !== btn.option.label)
		this.optionMap.delete(id)
	}

	/**
	 * Removes all options and their elements.
	 */
	clear() {
		this._log.fn('clear').debug({ this: this })
		for (const id of this.optionMap.keys()) {
			this.remove(id, false)
		}
		this.options = []
		this.optionMap.clear()
	}

	select = (
		v: LabeledOption<T> | Event,
		/**
		 * When `false`, the select controller won't call {@link onChange}
		 * to notify the parent Input or other listeners of the change.
		 * @default true
		 */
		bubble = true,
	) => {
		if (this.disabled) {
			return this
		}

		this._log.fn('select').debug('v', v, { this: this })

		if (v instanceof Event) {
			const target = v.target as HTMLDivElement

			const id = target.dataset['optionId']
			if (typeof id !== 'string') {
				console.error({ target })
				throw new Error('No option id found on select click')
			}

			const option = this.optionMap.get(id)
			if (!option) {
				console.error({ target })
				throw new Error('No option found in map')
			}

			for (const [, { element }] of this.optionMap) {
				element.classList.toggle('selected', element === option.element)
			}

			this.close()
			this.selected = option.option
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

	/**
	 * Updates the UI to reflect the current state of the source.
	 */
	refresh = () => {
		this._log.fn('refresh').debug({ this: this })
		// Make sure the selected value text is in the selected div.
		this.elements.selected.innerHTML = this.selected.label

		return this
	}

	/**
	 * Toggles the dropdown's visibility.
	 */
	toggle = () => {
		this._log.fn('toggle').debug({ this: this })
		if (this.expanded) {
			this._evm.emit('cancel')
			this.close()
		} else {
			this.open()
		}
	}

	// private _groupId = nanoid()

	/**
	 * Shows the dropdown.
	 */
	open = () => {
		this.expanded = true
		this._opts.input.folder.gui!.wrapper.appendChild(this.elements.dropdown)
		this.elements.dropdown.classList.add('expanded')
		this.elements.selected.classList.add('active')
		this.updatePosition()

		// We need to monitor the selected element's scroll parent for scroll events to keep the dropdown position synced up.
		this._scrollParent ??= getScrollParent(this.elements.selected)
		this._scrollParent?.addEventListener('scroll', this.updatePosition)

		this._evm.listen(window, 'keydown', this._closeOnEscape, {}, 'dropdown')
		this._evm.listen(window, 'click', this._clickOutside, {}, 'dropdown')

		if (this._opts.selectOnHover) {
			this._currentSelection = this.selected

			for (const [, { option, element }] of this.optionMap) {
				element.classList.toggle('selected', option.label === this.selected.label)

				// todo - these listeners could be one listener on the dropdown that gets the option id from the target's dataset.
				const select = () => {
					this._log
						.fn('on(mouseenter)')
						.debug('currentSelection', { option, element, this: this })
					this.select(option)
				}
				this._evm.listen(element, 'mouseenter', select, {}, 'dropdown')
			}
		}

		this._evm.emit('open')

		setTimeout(() => {
			this.elements.dropdown.style.pointerEvents = 'all'
		}, 200)
	}

	/**
	 * Positions the dropdown to the selected element.
	 */
	updatePosition = () => {
		if (!this.expanded) return

		this.elements.dropdown.style.setProperty('width', 'unset')
		this.elements.dropdown.style.setProperty('top', 'unset')

		const { dropdown, selected } = this.elements
		const guiScrollTop = this._opts.input.folder.root.elements.content.scrollTop
		const { top, left } = selected.getBoundingClientRect()

		this.elements.dropdown.style.setProperty(
			'width',
			`${Math.max(selected.offsetWidth, dropdown.offsetWidth)}px`,
		)
		this.elements.dropdown.style.setProperty(
			'top',
			`${top + selected.offsetHeight - guiScrollTop}px`,
		)
		this.elements.dropdown.style.setProperty(
			'left',
			`${left + selected.offsetWidth / 2 - dropdown.offsetWidth / 2}px`,
		)
	}

	/**
	 * Hides the dropdown.
	 */
	close = () => {
		this.expanded = false
		this.elements.dropdown.classList.remove('expanded')
		this.elements.selected.classList.remove('active')
		this.elements.dropdown.style.pointerEvents = 'none'

		this._evm.clearGroup('dropdown')

		this._evm.emit('close')

		setTimeout(() => {
			this.elements.dropdown.remove()
		}, 200)
	}

	/**
	 * Closes the dropdown if the escape key was pressed.  If {@link selectOnHover}
	 * is enabled, the current selection will be re-selected to restore the original
	 * value.
	 */
	private _closeOnEscape = (e: KeyboardEvent) => {
		if (e.key === 'Escape') {
			this._cancel()
		}
	}

	private _clickOutside = (e: MouseEvent) => {
		const path = e.composedPath()
		if (!path.includes(this.elements.selected) && !path.includes(this.elements.dropdown)) {
			this._cancel()
		}
	}

	private _cancel() {
		this.close()
		if (this._opts.selectOnHover) {
			this.select(this._currentSelection)
		}
		this._evm.emit('cancel')
	}

	enable() {
		this.elements.selected.classList.remove('disabled')
		this.elements.selected.removeAttribute('disabled')
		return this
	}

	disable() {
		this.elements.selected.classList.add('disabled')
		this.elements.selected.setAttribute('disabled', 'true')
		return this
	}

	dispose() {
		for (const el of values(this.elements)) {
			if (Array.isArray(el)) {
				el.forEach(e => e.remove())
			} else el.remove()
		}

		this._scrollParent?.removeEventListener('scroll', this.updatePosition)
		removeEventListener('click', this._clickOutside)

		this._evm.dispose()
	}
}

export function isLabeledOption<T>(v: any): v is LabeledOption<T> {
	return typeof v === 'object' && Object.keys(v).length === 2 && 'label' in v && 'value' in v
}

export function toLabeledOption<T>(v: Option<T>): LabeledOption<T> {
	if (isLabeledOption(v)) return v

	if (['string', 'number'].includes(typeof v)) {
		return {
			label: String(v),
			value: v,
		} as LabeledOption<T>
	}

	if (isState(v)) {
		if (isLabeledOption(v.value)) return v.value as LabeledOption<T>

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

	throw new Error('Missing label:' + JSON.stringify(v), { cause: { v } })
}

export function fromLabeledOption<T>(v: Option<T> | State<Option<T>>): T {
	function rtrn(v: any) {
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
