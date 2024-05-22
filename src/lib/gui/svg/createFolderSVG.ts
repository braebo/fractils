import type { Folder } from '../Folder'

import { create } from '../../utils/create'

export function createFolderSvg(folder: Folder) {
	const strokeWidth = 1
	const x = 12
	const y = 12
	const r = 4
	const fill = 'var(--fracgui-theme-a)'
	const theme = 'var(--fracgui-theme-a)'

	const icon = document.createElement('div')
	icon.classList.add('fracgui-folder-icon-container')

	const count = folder.allChildren.length + folder.inputs.size
	icon.style.setProperty('filter', `hue-rotate(${folder.hue}deg)`)

	const circs = [
		{ id: 1, cx: 16.43, cy: 11.93, r: 1.1103 },
		{ id: 2, cx: 15.13, cy: 15.44, r: 0.8081 },
		{ id: 3, cx: 15.13, cy: 8.423, r: 0.8081 },
		{ id: 4, cx: 12.49, cy: 16.05, r: 0.4788 },
		{ id: 5, cx: 12.42, cy: 7.876, r: 0.545 },
		{ id: 6, cx: 10.43, cy: 15.43, r: 0.2577 },
		{ id: 7, cx: 10.43, cy: 8.506, r: 0.2769 },
		{ id: 8, cx: 17.85, cy: 14.59, r: 0.5635 },
		{ id: 9, cx: 17.85, cy: 9.295, r: 0.5635 },
		{ id: 10, cx: 19.19, cy: 12.95, r: 0.5635 },
		{ id: 11, cx: 19.19, cy: 10.9, r: 0.5635 },
		{ id: 12, cx: 20.38, cy: 11.96, r: 0.2661 },
		{ id: 13, cx: 19.74, cy: 14.07, r: 0.2661 },
		{ id: 14, cx: 19.74, cy: 9.78, r: 0.2661 },
		{ id: 15, cx: 20.7, cy: 12.96, r: 0.2661 },
		{ id: 16, cx: 20.7, cy: 10.9, r: 0.2661 },
		{ id: 17, cx: 21.38, cy: 11.96, r: 0.2661 },
	] as const

	function circ(c: { id: number; cx: number; cy: number; r: number }) {
		return /*html*/ `<circle
				class="alt c${c.id}"
				cx="${c.cx * 1.1}"
				cy="${c.cy}"
				r="${c.r}"
				style="transition-delay: ${c.id * 0.05}s;"
			/>`
	}

	function toCircs(ids: number[]) {
		return ids.map(id => circ(circs[id - 1])).join('\n')
	}

	const circMap: Record<number, number[]> = {
		0: [] as number[],
		1: [1],
		2: [2, 3],
		3: [1, 2, 3],
		4: [2, 3, 4, 5],
		5: [1, 2, 3, 4, 5],
		6: [2, 3, 4, 5, 6, 7],
		7: [1, 2, 3, 4, 5, 6, 7],
		8: [1, 2, 3, 4, 5, 6, 7, 8],
		9: [1, 2, 3, 4, 5, 6, 7, 8, 9],
		10: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
		11: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
		12: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
		13: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
		14: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
		15: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
		16: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
		17: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
	}

	const circles = toCircs(circMap[Math.min(count, circs.length)])
	const bounce = 'cubic-bezier(0.36, 0, 0.66, -0.56)'
	const ease = 'cubic-bezier(0.23, 1, 0.320, 1)'

	const css = /*css*/ `
			.fracgui-folder-icon {
				overflow: visible;
				backface-visibility: hidden;
			}

			.fracgui-folder-icon circle, .fracgui-folder-icon line {
				transform-origin: center;

				transition-duration: 0.25s;
				transition-timing-function: ${ease};
				backface-visibility: hidden;
			}

			/*//?	Circle A	*/
			.closed .fracgui-folder-icon circle.a {
				transform: scale(1);
				
				stroke: transparent;
				fill: ${fill};
				
				transition: all .5s ${bounce}, stroke 2s ${bounce}, fill .2s ${bounce} 0s;
			}
			.fracgui-folder-icon circle.a {
				transform: scale(0.66);

				stroke: ${fill};
				fill: ${theme};

				transition: all .33s ${bounce}, stroke 2s ${bounce}, fill .2s ease-in 0.25s;
			}

			/*//?	Circle Alt	*/
			.closed .fracgui-folder-icon circle.alt {
				transform: translate(-3px, 0) scale(1.8);

				transition-duration: 0.5s;
				transition-timing-function: ${ease};
			}
			 .fracgui-folder-icon circle.alt {
				transform: translate(0, 0) scale(0);

				stroke: none;
				fill: ${theme};

				transition-duration: 0.75s;
				transition-timing-function: ${ease};
			}
		`.trim()

	icon.innerHTML = /*html*/ `
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="100%"
			height="100%"
			viewBox="0 0 24 24"
			fill="none"
			stroke-width="${strokeWidth}"
			stroke-linecap="round"
			stroke-linejoin="round"
			class="fracgui-folder-icon"
			overflow="visible"
		>
			<circle class="a" cx="${x}" cy="${y}" r="${r}" stroke="${theme}" fill="${fill}" />

			${circles}

			<style lang="css">
				${css}
			</style>
		</svg>`.trim()

	if (folder.closed.value) icon.classList.add('closed')

	return icon
}

export function createFolderConnector(folder: Folder) {
	const container = create('div', {
		classes: ['fracgui-connector-container'],
	})

	const width = 20
	const height = folder.element.clientHeight
	const stroke = 1

	//? SVG
	const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
	svg.setAttribute('class', 'fracgui-connector-svg')
	svg.setAttribute('width', `${width}`)
	svg.setAttribute('stroke-width', `${stroke}`)
	svg.setAttribute('viewBox', `0 0 ${width} ${height}`)
	svg.setAttribute('overflow', 'visible')
	svg.setAttribute('backface-visibility', 'hidden')

	svg.setAttribute('preserveAspectRatio', 'xMinYMin slice')

	svg.style.setProperty('filter', `hue-rotate(${folder.hue}deg)`)

	//? Path
	const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
	path.setAttribute('vector-effect', 'non-scaling-stroke')
	path.setAttribute('fill', 'none')
	path.setAttribute('stroke', 'var(--fracgui-theme-a)')
	path.setAttribute('stroke-width', `${stroke}`)
	path.setAttribute('stroke-linecap', 'round')
	path.setAttribute('stroke-linejoin', 'round')
	path.setAttribute('d', `M10,0 Q0,0 0,10 L0,${height}`)
	const headerHeight = folder.elements.header.clientHeight
	path.setAttribute('transform', `translate(0, ${headerHeight / 2})`)

	//? Path Gradient
	const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
	const linearGradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient')
	linearGradient.setAttribute('id', 'gradient')
	linearGradient.setAttribute('x1', '0%')
	linearGradient.setAttribute('y1', '0%')
	linearGradient.setAttribute('x2', '0%')
	linearGradient.setAttribute('y2', '100%')

	function stop(offset: number, opacity: number, color = 'var(--fracgui-theme-a)') {
		const stop = document.createElementNS('http://www.w3.org/2000/svg', 'stop')
		stop.setAttribute('offset', `${offset}%`)
		stop.setAttribute('style', `stop-color: ${color}; stop-opacity: ${opacity}`)
		linearGradient.appendChild(stop)
		return stop
	}

	stop(0, 0.5)
	stop(1, 0.5)
	stop(5, 0.4)
	stop(20, 0.3)
	stop(40, 0.2)
	stop(100, 0.2)

	path.setAttribute('stroke', 'url(#gradient)')

	//? Appending
	defs.appendChild(linearGradient)
	svg.insertBefore(defs, svg.firstChild)
	svg.appendChild(path)
	container.appendChild(svg)

	return {
		container,
		svg,
		path,
	}
}

export function animateConnector(folder: Folder, action: 'open' | 'close') {
	if (!folder.graphics?.connector) return
	const path = folder.graphics.connector.path
	const length = `${path.getTotalLength()}`
	path.style.strokeDasharray = `${length}`

	const { duration, from, to, delay, easing } =
		action === 'open'
			? ({
					duration: 600,
					delay: 0,
					from: length,
					easing: 'cubic-bezier(.29,.1,.03,.94)',
					to: '0',
				} as const)
			: ({
					duration: 150,
					delay: 0,
					from: '0',
					easing: 'cubic-bezier(.15,.84,.19,.98)',
					to: length,
				} as const)

	const keyframes = [{ strokeDashoffset: from }, { strokeDashoffset: to }]

	const timing = {
		duration,
		delay,
		easing,
		fill: 'forwards',
	} as const satisfies KeyframeAnimationOptions

	folder.graphics.connector.path.animate(keyframes, timing)
}

// todo - This will likely be needed when dynamically adding/removing inputs.
export function updateConnector(folder: Folder, svg: SVGSVGElement, path: SVGPathElement) {
	if (!folder.graphics) return

	// const svg = folder.graphics.connector.svg

	const height = folder.element.clientHeight
	svg.setAttribute('height', `${height * 0.1}`)
	// svg.style.setProperty('height', `${height}px`)

	const count = folder.allChildren.length + folder.inputs.size
	svg.style.setProperty('filter', `hue-rotate(${-60 + (count % 360) * 20}deg)`)

	const headerHeight = folder.elements.header.clientHeight
	path.setAttribute('transform', `translate(0, ${headerHeight / 2})`)
	path.setAttribute('d', `M10,0 Q0,0 0,10 L0,${height}`)
	path.setAttribute('d', `M10,0 Q0,0 0,10 L0,${height}`)
}
