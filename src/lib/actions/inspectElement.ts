import type { Action } from 'svelte/action'

import { create } from '$lib/utils/create'

export const inspectElement: Action = (node: HTMLElement) => {
	const elements = node.querySelectorAll('*')
	const labelHeight = -20
	const hue_offset = 30

	elements.forEach((element) => {
		;(element as HTMLElement).addEventListener('pointerenter', handlePointerEnter)
	})

	let handlePointerLeave = () => void 0

	let labels = new Set<HTMLElement>()
	let abortFns = new Set<() => void>()
	let largestLabel = 0

	let activeLabel: HTMLElement | undefined = undefined
	let og_filter = 'none'

	let disabled = true

	const toggle = (e: KeyboardEvent) => {
		if (e.metaKey && e.key === 'Alt') {
			disabled = false
			window.addEventListener(
				'keyup',
				(e) => {
					disabled = true
					abortFns.forEach((fn) => fn())
				},
				{ once: true },
			)
		}
	}
	window.addEventListener('keydown', toggle)

	const updateClientXY = (e: PointerEvent) => {
		if (disabled) return
		for (const label of labels) {
			label.style.transform = `translate(${e.clientX + 10}px, ${e.clientY - labels.size * labelHeight}px)`
		}
	}
	window.addEventListener('pointermove', updateClientXY, { passive: true })

	function handlePointerEnter(e: PointerEvent) {
		if (disabled) return

		const element = e.target as HTMLElement

		const label = create('div', {
			classes: ['inspect-element-label'],
			parent: document.body,
		})
		labels.add(label)
		setActiveLabel(label)

		const tagName = element.tagName
		const classes = [...element.classList].join('.')

		const elRect = element.getBoundingClientRect()

		label.classList.add('inspect-element-label')
		label.innerHTML = `${wrap(tagName, `hsl(${(labels.size * hue_offset) % 360}, 100%, 50%)`)}.${wrap(classes, 'var(--theme-b)')} · ${wrap(Math.round(elRect.width), 'var(--theme-c)')}${wrap('x', 'gray')}${wrap(Math.round(elRect.height), 'var(--theme-c)')}`

		// Position the popover atop the hovered node
		label.style.cssText = /*css*/ `
        .{
            position: absolute;

            height: ${labelHeight}px;
            white-space: nowrap;
            padding: 3px;
            
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(5px);
            border-radius: 5px;
            
            font-family: monospace;
            font-size: 0.66rem;

			z-index: ${9900 + labels.size};
			pointer-events: none;
        }
        `.replaceAll(/(\.{|})/g, '')

		//? Position the label
		largestLabel = Math.max(largestLabel, label.offsetWidth)

		label.style.top = labels.size * labelHeight + 'px'

		const og_outline = element.style.outline
		const og_outlineOffset = element.style.outlineOffset

		element.style.outline = `1px dotted hsla(${(labels.size * hue_offset) % 360}, 100%, 50%, 0.5)`

		handlePointerLeave = () => {
			labels.delete(label)
			element.style.outline = og_outline
			element.style.outlineOffset = og_outlineOffset
			label.remove()
			largestLabel = 0
		}
		abortFns.add(handlePointerLeave)

		let i = 0
		for (const label of labels) {
			i++
			if (i === labels.size) continue
			label.style.opacity = String((1 / labels.size) * i)
		}

		// Remove the outline when the popover is removed
		;(element as HTMLElement).addEventListener('pointerleave', handlePointerLeave, {
			once: true,
		})
	}

	function setActiveLabel(newLabel: HTMLElement) {
		if (activeLabel) {
			activeLabel.style.filter = og_filter
		}
		activeLabel = newLabel
		og_filter = activeLabel.style.filter

		activeLabel.style.filter = 'brightness(1.5)'
	}

	function wrap(str: string | number, color: string) {
		return `<span style="color: ${color}">${str}</span>`
	}

	return {
		destroy() {
			globalThis.window?.removeEventListener('keydown', toggle)
			// @ts-expect-error - I need to read up on this passive event thing ig
			globalThis.window?.removeEventListener('pointermove', updateClientXY, { passive: true })
			elements.forEach((element) => {
				;(element as HTMLElement).removeEventListener('pointerenter', handlePointerEnter)
			})
		},
	}
}
