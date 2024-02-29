export const svgChevron = () => {
	const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
	svg.setAttribute('width', '24')
	svg.setAttribute('height', '24')
	svg.setAttribute('viewBox', '-2 -2 28 28')
	svg.setAttribute('stroke', 'currentColor')
	svg.setAttribute('fill', 'none')
	svg.setAttribute('stroke-width', '2')
	svg.setAttribute('stroke-linecap', 'round')
	svg.setAttribute('stroke-linejoin', 'round')

	const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
	path.setAttribute('d', 'm18 15-6-6-6 6')
	svg.appendChild(path)

	return svg
}
