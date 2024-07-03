import type { InputOptions, ValidInput } from '../inputs/Input'
import type { Tooltip } from '../../actions/tooltip'

import { modIcon, modKey } from '../../utils/keys'
import { getStyle } from '../../dom/getStyle'
import { create } from '../../utils/create'
import { Logger } from '../../utils/logger'

export class NumberController<
	TInput extends ValidInput = ValidInput,
	TOptions extends InputOptions<any> = InputOptions,
> {
	element: HTMLInputElement & { tooltip: Tooltip }

	dragEnabled = false
	dragging = false
	hovering = false
	delta = 0

	private _log: Logger

	constructor(
		public input: TInput,
		public opts: TOptions,
		public parent?: HTMLElement,
	) {
		this._log = new Logger(`NumberController ${this.input.title}`, { fg: 'darkgoldenrod' })

		this.element = create('input', {
			type: 'number',
			classes: ['fracgui-controller', 'fracgui-controller-number'],
			value: String(input.state.value),
			parent,
			tooltip: {
				text: /*html*/ `Hold <span class="fractils-hotkey">${modIcon()}</span> to drag`,
				placement: 'top',
				delay: 1500,
				parent,
				styles: {
					background: 'var(--fracgui-bg-a)',
					color: 'var(--fracgui-fg-a)',
					'--fractils-hotkey_background': 'var(--fracgui-bg-b)',
					'--fractils-hotkey_color': 'var(--fracgui-fg-a)',
				},
			},
		})

		if ('step' in opts) {
			this.element.step = String(opts.step)
		}

		input.listen(this.element, 'pointerenter', this.hoverStart)
	}

	hoverStart = (e: PointerEvent) => {
		this._log.fn('hoverStart').debug(e)
		this.hovering = true
		this.element.classList.add('hovering')

		this.maybeEnableDrag(e)

		this.element.removeEventListener('pointerleave', this.hoverEnd)
		this.element.addEventListener('pointerleave', this.hoverEnd)
		document.removeEventListener('keydown', this.maybeEnableDrag)
		document.addEventListener('keydown', this.maybeEnableDrag)
	}

	hoverEnd = (e: PointerEvent) => {
		this._log.fn('hoverEnd').debug(e)
		this.hovering = false
		this.element.classList.remove('hovering')

		this.cancelDrag(e)

		this.element.removeEventListener('pointerleave', this.hoverEnd)
		document.removeEventListener('keydown', this.maybeEnableDrag)
	}

	dragKeyHeld = (e: KeyboardEvent | PointerEvent) => {
		return modKey(e)
	}

	cancelDrag = (e: KeyboardEvent | PointerEvent) => {
		this._log.fn('cancelDrag').debug(e)
		this.dragEnabled = e.type === 'keyup' ? this.dragKeyHeld(e) : false

		document.removeEventListener('keyup', this.cancelDrag)
		this.element.removeEventListener('pointerleave', this.cancelDrag)
		this.element.removeEventListener('pointerdown', this.maybeDragStart)

		if (!this.dragEnabled) {
			this.element.style.cursor = this.element.dataset['cursor'] ?? 'text'

			if (this.dragging) {
				this.dragEnd()
			}
		}
	}

	maybeEnableDrag = (e: KeyboardEvent | PointerEvent) => {
		this._log.fn('maybeEnableDrag').debug(e)
		if (this.dragKeyHeld(e)) {
			this.dragEnabled = true

			document.removeEventListener('keyup', this.cancelDrag)
			document.addEventListener('keyup', this.cancelDrag)

			this.element.removeEventListener('pointerleave', this.cancelDrag)
			this.element.addEventListener('pointerleave', this.cancelDrag)

			this.element.removeEventListener('pointerdown', this.maybeDragStart)
			this.element.addEventListener('pointerdown', this.maybeDragStart)

			this.element.dataset['cursor'] = getStyle(this.element, 'cursor')
			this.element.style.cursor = 'ns-resize'
		}
	}

	maybeDragStart = () => {
		if (this.hovering && this.dragEnabled) {
			this.dragStart()
		}
	}

	dragStart = async () => {
		this._log.fn('dragStart').debug()
		this.dragging = true
		this.element.dispatchEvent(new Event('dragStart'))

		this.element.tooltip.hide()

		this.element.removeEventListener('pointermove', this.drag)
		this.element.addEventListener('pointermove', this.drag)

		document.removeEventListener('pointerup', this.dragEnd)
		document.addEventListener('pointerup', this.dragEnd)

		this.element.classList.add('dragging')
		// https://developer.mozilla.org/en-US/docs/Web/API/Element/requestPointerLock#browser_compatibility
		await this.element.requestPointerLock()
		this.element.blur()
	}

	dragEnd = () => {
		this._log.fn('dragEnd').debug()
		this.dragging = false

		this.element.classList.remove('dragging')

		this.element.removeEventListener('pointermove', this.drag)
		document.removeEventListener('pointerup', this.dragEnd)

		document.exitPointerLock()

		this.element.dispatchEvent(new Event('dragEnd'))
	}

	drag = (e: PointerEvent) => {
		if (!this.dragging) return

		const multiplier = e.shiftKey ? 4 : e.altKey ? 0.1 : 1

		const direction = Math.sign(e.movementY)
		this.delta += Math.abs(e.movementY)

		if (this.delta > +this.element.step) {
			const amount = +this.element.step * multiplier * -direction

			this.element.value = String(this.element.valueAsNumber + amount)

			direction === -1
				? this.element.stepUp(+this.element.step * multiplier)
				: this.element.stepDown(+this.element.step * multiplier)

			this.delta = 0
			this.element.dispatchEvent(new Event('input'))
		}
	}

	dispose() {
		this.element.removeEventListener('pointerenter', this.hoverStart)
		this.element.removeEventListener('pointerleave', this.hoverEnd)
		this.element.removeEventListener('pointermove', this.drag)
		document.removeEventListener('keydown', this.maybeEnableDrag)
		document.removeEventListener('keyup', this.cancelDrag)
		this.element.removeEventListener('pointerleave', this.cancelDrag)
		this.element.removeEventListener('pointerdown', this.maybeDragStart)
		document.removeEventListener('pointerup', this.dragEnd)
		this.element.tooltip.dispose()
		this.element.remove()
	}
}
