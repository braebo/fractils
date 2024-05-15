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

		s.setAttribute('fill', 'none')
		s.setAttribute('stroke', 'currentColor')
		s.setAttribute('stroke-width', '2')
		s.setAttribute('stroke-linecap', 'round')
		s.setAttribute('stroke-linejoin', 'round')

		const front = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
		front.classList.add('front')
		front.setAttribute('width', '13')
		front.setAttribute('height', '13')
		front.setAttribute('rx', '1')
		front.setAttribute('ry', '1')
		front.setAttribute('x', '8')
		front.setAttribute('y', '8')

		const back = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
		back.classList.add('back')
		back.setAttribute('width', '15')
		back.setAttribute('height', '15')
		back.setAttribute('rx', '1')
		back.setAttribute('ry', '1')
		back.setAttribute('x', '1')
		back.setAttribute('y', '1')

		const check = document.createElementNS('http://www.w3.org/2000/svg', 'path')
		check.classList.add('check')
		check.setAttribute('d', 'M17 9l-7 7-4-4')
		check.setAttribute('fill', 'none')
		check.setAttribute('stroke-width', '2')

		s.appendChild(front)
		s.appendChild(back)
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
