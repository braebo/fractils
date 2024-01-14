import type { Action } from 'svelte/action'

// WIP

export const inspectElement: Action = (node: HTMLElement) => {
	const elements = node.querySelectorAll('*')
	/** popover height  */
	const height = -20

	elements.forEach((element) => {
		;(element as HTMLElement).addEventListener('mouseenter', handleMouseEnter)
	})

	let handleMouseLeave = () => void 0

	let popovers = new Set<HTMLElement>()

	function handleMouseEnter(event: MouseEvent) {
		const element = event.target as HTMLElement

		const popover = createPopover(element)
		document.body.appendChild(popover)

		const outline = element.style.outline
		const outlineOffset = element.style.outlineOffset

		element.style.outline = `1px dotted hsl(${popovers.size * 30}, 100%, 50%)`

		handleMouseLeave = () => {
			popovers.delete(popover)
			element.style.outline = outline
			element.style.outlineOffset = outlineOffset
			// element.style.filter = filter
			popover.remove()
		}

		// Make sure the popovers don't overlap
		// todo - It would be better if the popovers were only moved if they overlap.
		function organize() {
			let i = 0
			for (const popover of popovers) {
				// const top = element.offsetTop
				const top = popover.offsetTop
				popover.style.transform = `translate(${i * 10}px, ${20 * i}px)`
				element.style.outlineOffset = `${-4 * i}px`
				i++
			}
		}

		organize()

		// Remove the outline when the popover is removed
		;(element as HTMLElement).addEventListener('mouseleave', handleMouseLeave, { once: true })
	}

	function wrap(str: string | number, color: string) {
		return `<span style="color: ${color}">${str}</span>`
	}

	function createPopover(element: HTMLElement) {
		const tagName = element.tagName
		const className = element.className

		const popover = document.createElement('div')
		popovers.add(popover)

		const e = element.getBoundingClientRect()
		const p = popover.getBoundingClientRect()
		const vw = window.innerWidth
		const vh = window.innerHeight

		// We need to find out which side of the screen the element is closer to
		// and position the popover on the opposite side.
		function position() {
			const left = e.left
			const right = vw - e.right
			const top = e.top
			const bottom = vh - e.bottom

			const ew = Math.min(left, right)

			if (ew === left) {
				popover.style.left = e.right + p.width + 'px'
			}
			if (ew === right) {
				popover.style.right = vw - e.right + 'px'
			}

			const ns = Math.min(top, bottom)

			if (ns === top) {
				popover.style.top = e.top + 'px'
			}
			if (ns === bottom) {
				popover.style.top = vh - e.bottom + 'px'
			}
		}

		popover.classList.add('popover')
		popover.innerHTML = `${wrap(tagName, `hsl(${popovers.size * 30}, 100%, 50%)`)}.${wrap(className, 'var(--brand-b)')}\n · ${wrap(Math.round(e.width), 'var(--brand-c)')}${wrap('x', 'gray')}${wrap(Math.round(e.height), 'var(--brand-c)')}`

		// Position the popover atop the hovered node
		popover.style.cssText = /*css*/ `
        .{
            position: absolute;
            
            height: ${height}px;
            white-space: nowrap;
            padding: 3px;
            
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(5px);
            border-radius: 5px;
            
            font-family: monospace;
            font-size: 0.66rem;
        }
        `.replaceAll(/(\.{|})/g, '')

		position()

		return popover
	}

	return {
		destroy() {
			elements.forEach((element) => {
				;(element as HTMLElement).removeEventListener('mouseenter', handleMouseEnter)
				;(element as HTMLElement).removeEventListener('mouseleave', handleMouseLeave)
			})
		},
	}
}
