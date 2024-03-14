let svg: SVGElement
export const svgCopy = () => {
	if (svg) return svg

	svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
	svg.classList.add('icon', 'copy')

	svg.setAttribute('width', '24')
	svg.setAttribute('height', '24')
	svg.setAttribute('viewBox', '0 0 24 24')
	svg.setAttribute('fill', 'none')
	svg.setAttribute('stroke', 'currentColor')
	svg.setAttribute('stroke-width', '2')
	svg.setAttribute('stroke-linecap', 'round')
	svg.setAttribute('stroke-linejoin', 'round')

	const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
	rect.setAttribute('width', '13')
	rect.setAttribute('height', '13')
	rect.setAttribute('rx', '2')
	rect.setAttribute('ry', '2')
    svg.appendChild(rect)

	const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
	path.setAttribute('d', 'M17 9l-7 7-4-4')
	svg.appendChild(path)

	return svg
}
