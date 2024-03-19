export class CopySVG {
	svg: SVGSVGElement
	back: SVGRectElement
	front: SVGRectElement
	check: SVGPathElement

	constructor() {
		const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
		s.classList.add('icon', 'copy')
		s.setAttribute('width', '100%')
		s.setAttribute('height', '100%')
		s.setAttribute('viewBox', '0 0 24 24')
		s.setAttribute('fill', 'currentColor')
		s.setAttribute('stroke', 'none')
		s.setAttribute('stroke-width', '2')
		s.setAttribute('stroke-linecap', 'round')
		s.setAttribute('stroke-linejoin', 'round')

		// const back = document.createElementNS('http://www.w3.org/2000/svg', 'path')
		// back.classList.add('back')
		// back.setAttribute('d', 'M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1')
		// s.appendChild(back)

		const back = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
		back.classList.add('back')
		back.setAttribute('width', '15')
		back.setAttribute('height', '15')
		back.setAttribute('rx', '2')
		back.setAttribute('ry', '2')
		back.setAttribute('x', '0')
		back.setAttribute('y', '0')

		const front = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
		front.classList.add('front')
		front.setAttribute('width', '13')
		front.setAttribute('height', '13')
		front.setAttribute('rx', '2')
		front.setAttribute('ry', '2')
		front.setAttribute('x', '9')
		front.setAttribute('y', '9')

		const check = document.createElementNS('http://www.w3.org/2000/svg', 'path')
		check.classList.add('check')
		check.setAttribute('d', 'M17 9l-7 7-4-4')

		s.appendChild(back)
		s.appendChild(front)
		s.appendChild(check)

		this.svg = s
		this.back = back
		this.front = front
		this.check = check

		return this
	}

	appendTo(container: HTMLElement) {
		container.appendChild(this.svg)
	}
}
