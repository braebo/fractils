import type { InputOptions, ValidInput } from '../inputs/Input'

import { create } from '../../utils/create'

export class NumberController<
	TInput extends ValidInput = ValidInput,
	TOptions extends InputOptions<any> = InputOptions,
> {
	element: HTMLInputElement

	dragEnabled = false
	dragging = false
	hovering = false
	delta = 0

	constructor(
		public input: TInput,
		public opts: TOptions,
		public parent?: HTMLElement,
	) {
		this.element = create('input', {
			type: 'number',
			classes: ['fracgui-controller', 'fracgui-controller-number'],
			value: String(input.state.value),
			parent,
			tooltip: {
				text: /*html*/ `Hold <span class="fractils-hotkey">⌘</span> or <span class="fractils-hotkey">ctrl</span> to drag`,
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

		input.listen(this.element, 'pointerenter', this.hoverStart.bind(this))
	}

	hoverStart(e: PointerEvent) {
		this.hovering = true
		this.element.classList.add('hovering')

		this.maybeEnableDrag(e)

		this.element.addEventListener('pointerleave', this.hoverEnd.bind(this))
		globalThis.document.addEventListener('keydown', this.maybeEnableDrag.bind(this))
	}

	hoverEnd(e: PointerEvent) {
		this.hovering = false
		this.element.classList.remove('hovering')

		this.cancelDrag(e)

		this.element.removeEventListener('pointerleave', this.hoverEnd.bind(this))
		globalThis.document.removeEventListener('keydown', this.maybeEnableDrag.bind(this))
	}

	dragKeyHeld(e: KeyboardEvent | PointerEvent) {
		return navigator.platform.toUpperCase().includes('MAC') ? e.metaKey : e.ctrlKey
	}

	cancelDrag(e: KeyboardEvent | PointerEvent) {
		this.dragEnabled = e.type === 'keyup' ? this.dragKeyHeld(e) : false

		if (!this.dragEnabled) {
			globalThis.document.removeEventListener('keyup', this.cancelDrag.bind(this))
			this.element.removeEventListener('pointerleave', this.cancelDrag.bind(this))
			this.element.removeEventListener('pointerdown', this.maybeDragStart.bind(this))

			this.element.style.cursor = this.element.dataset['cursor'] ?? 'text'

			if (this.dragging) {
				this.dragEnd()
			}
		}
	}

	maybeEnableDrag(e: KeyboardEvent | PointerEvent) {
		if (this.dragKeyHeld(e)) {
			this.dragEnabled = true

			document.addEventListener('keyup', this.cancelDrag.bind(this))
			this.element.addEventListener('pointerleave', this.cancelDrag.bind(this))
			this.element.addEventListener('pointerdown', this.maybeDragStart.bind(this))

			this.element.dataset['cursor'] = getComputedStyle(this.element).cursor
			this.element.style.cursor = 'ns-resize'
		}
	}

	maybeDragStart() {
		if (this.hovering && this.dragEnabled) {
			this.dragStart()
		}
	}

	async dragStart() {
		this.dragging = true
		this.element.dispatchEvent(new Event('dragstart'))

		this.element.addEventListener('pointermove', this.drag.bind(this))
		globalThis.document.addEventListener('pointerup', this.dragEnd.bind(this))

		this.element.classList.add('dragging')
		// ts is wrong -- this _is_ async
		await this.element.requestPointerLock()
		this.element.blur()
	}

	dragEnd() {
		this.dragging = false
		this.element.dispatchEvent(new Event('dragEnd'))

		this.element.classList.remove('dragging')

		this.element.removeEventListener('pointermove', this.drag.bind(this))
		globalThis.document.removeEventListener('pointerup', this.dragEnd.bind(this))

		document.exitPointerLock()
	}

	drag(e: PointerEvent) {
		if (!this.dragging) return

		const multiplier = e.shiftKey ? 0.1 : e.altKey ? 4 : 1

		const direction = Math.sign(e.movementY)
		this.delta += Math.abs(e.movementY) * multiplier

		if (this.delta > +this.element.step) {
			direction === -1 ? this.element.stepUp() : this.element.stepDown()
			this.delta = 0
			this.element.dispatchEvent(new Event('input'))
		}
	}
}
