import type { InputNumber } from '../inputs/InputNumber'
import type { ElementMap } from '../inputs/Input'
import type { ControllerFactory } from './types'

import { svgChevron } from '../svg/chevronSvg'
import { create } from '../../utils/create'

export const numberController: ControllerFactory<HTMLInputElement> = (input, opts, parent) => {
	const controller = create<HTMLInputElement>('input', {
		type: 'number',
		classes: ['fracgui-input-number-input'],
		value: String(input.state.value),
		parent,
	})

	if ('step' in opts) {
		controller.step = String(opts.step)
	}

	let dragEnabled = false
	let dragging = false
	let hovering = false

	const hoverStart = (e: PointerEvent) => {
		hovering = true
		controller.classList.add('hovering')

		maybeEnableDrag(e)

		controller.addEventListener('pointerleave', hoverEnd)
		globalThis.document.addEventListener('keydown', maybeEnableDrag)
	}

	const hoverEnd = (e: PointerEvent) => {
		hovering = false
		controller.classList.remove('hovering')

		cancelDrag(e)

		controller.removeEventListener('pointerleave', hoverEnd)
		globalThis.document.removeEventListener('keydown', maybeEnableDrag)
	}

	const dragKeyHeld = (e: KeyboardEvent | PointerEvent) => {
		return navigator.platform.toUpperCase().includes('MAC') ? e.metaKey : e.ctrlKey
	}

	const cancelDrag = (e: KeyboardEvent | PointerEvent) => {
		dragEnabled = e.type === 'keyup' ? dragKeyHeld(e) : false

		if (!dragEnabled) {
			globalThis.document.removeEventListener('keyup', cancelDrag)
			controller.removeEventListener('pointerleave', cancelDrag)
			controller.removeEventListener('pointerdown', maybeDragStart)

			controller.style.cursor = controller.dataset.cursor ?? 'text'

			if (dragging) {
				dragEnd()
			}
		}
	}

	const maybeEnableDrag = (e: KeyboardEvent | PointerEvent) => {
		if (dragKeyHeld(e)) {
			dragEnabled = true

			document.addEventListener('keyup', cancelDrag)
			controller.addEventListener('pointerleave', cancelDrag)
			controller.addEventListener('pointerdown', maybeDragStart)

			controller.dataset.cursor = getComputedStyle(controller).cursor
			controller.style.cursor = 'ns-resize'
		}
	}

	const maybeDragStart = (e: PointerEvent) => {
		if (hovering && dragEnabled) {
			dragStart(e)
		}
	}

	const dragStart = async (e: PointerEvent) => {
		dragging = true
		controller.addEventListener('pointermove', drag)
		globalThis.document.addEventListener('pointerup', dragEnd)

		controller.classList.add('dragging')
		// ts is wrong -- this _is_ async
		await controller.requestPointerLock()
		controller.blur()
	}

	const dragEnd = () => {
		dragging = false
		controller.classList.remove('dragging')

		controller.removeEventListener('pointermove', drag)
		globalThis.document.removeEventListener('pointerup', dragEnd)

		document.exitPointerLock()
	}

	let delta = 0
	const drag = (e: PointerEvent) => {
		if (!dragging) return

		const multiplier = e.shiftKey ? 0.1 : e.altKey ? 4 : 1

		const direction = Math.sign(e.movementY)
		delta += Math.abs(e.movementY) * multiplier

		if (delta > +controller.step) {
			direction === -1 ? controller.stepUp() : controller.stepDown()
			delta = 0
			controller.dispatchEvent(new Event('input'))
		}
	}

	input.listen(controller, 'pointerenter', hoverStart)

	return controller
}

export const rangeController: ControllerFactory<HTMLInputElement> = (input, opts, parent) => {
	const range = create<HTMLInputElement>('input', {
		type: 'range',
		classes: ['fracgui-input-number-range'],
		value: String(input.state.value),
		parent,
	})

	if ('min' in opts) range.min = String(opts.min)
	if ('max' in opts) range.max = String(opts.max)
	if ('step' in opts) range.step = String(opts.step)

	input.listen(range, 'input', input.setState)

	return range
}

export const numberButtonsController: ControllerFactory<
	{
		container: HTMLDivElement
		increment: HTMLDivElement
		decrement: HTMLDivElement
	},
	InputNumber
> = (input, opts, parent) => {
	const container = create<HTMLDivElement>('div', {
		classes: ['fracgui-input-number-buttons-container'],
		parent,
	})

	const increment = create<HTMLDivElement>('div', {
		classes: [
			'fracgui-controller',
			'fracgui-input-number-button',
			'fracgui-input-number-buttons-increment',
		],
		parent: container,
	})
	increment.appendChild(svgChevron())
	input.listen(increment, 'pointerdown', rampChangeUp)

	const decrement = create<HTMLDivElement>('div', {
		classes: [
			'fracgui-controller',
			'fracgui-input-number-button',
			'fracgui-input-number-buttons-decrement',
		],
		parent: container,
	})
	const upsideDownChevron = svgChevron()
	upsideDownChevron.setAttribute('style', 'transform: rotate(180deg)')
	decrement.appendChild(upsideDownChevron)
	input.listen(decrement, 'pointerdown', rampChangeDown)

	function rampChange(direction = 1) {
		const step = 'step' in opts ? (opts.step as number) : 1

		let delay = 300
		let stop = false
		let delta = 0
		let timeout: ReturnType<typeof setTimeout>

		const change = () => {
			clearTimeout(timeout)
			if (stop) return

			delta += delay
			if (delta > 1000) {
				delay /= 2
				delta = 0
			}

			input.setState(input.state.value + step * direction)
			timeout = setTimeout(change, delay)
		}

		const stopChanging = () => {
			stop = true
			window.removeEventListener('pointerup', stopChanging)
			window.removeEventListener('pointercancel', stopChanging)
		}

		window.addEventListener('pointercancel', stopChanging, { once: true })
		window.addEventListener('pointerup', stopChanging, { once: true })

		change()
	}

	function rampChangeUp() {
		rampChange(1)
	}

	function rampChangeDown() {
		rampChange(-1)
	}

	return {
		container,
		increment,
		decrement,
	} as const satisfies ElementMap
}
