import type { Placement, PlacementOptions, Vec2 } from './place'

import { describe, it, expect, beforeEach } from 'vitest'
import { place_old } from './place_old'

beforeEach(() => {
	Object.defineProperties(HTMLElement.prototype, {
		offsetWidth: {
			get() {
				return parseFloat(this.style.width) || 0
			},
		},
		offsetHeight: {
			get() {
				return parseFloat(this.style.height) || 0
			},
		},
	})
})

describe('place function tests', () => {
	const size = 10
	const node = document.createElement('div')
	node.style.setProperty('width', `${size}px`)
	node.style.setProperty('height', `${size}px`)
	document.body.appendChild(node)

	const bound = { x: 0, y: 0, width: 100, height: 100 }
	const margin = 10

	const testObj: Record<Placement, Vec2> = {
		center: { x: bound.width / 2 - size / 2, y: bound.height / 2 - size / 2 },
		'top-left': { x: margin, y: margin },
		'top-center': { x: bound.width / 2 - size / 2, y: margin },
		'top-right': { x: bound.width - size - margin, y: margin },
		'bottom-left': { x: margin, y: bound.height - size - margin },
		'bottom-center': { x: bound.width / 2 - size / 2, y: bound.height - size - margin },
		'bottom-right': { x: bound.width - size - margin, y: bound.height - size - margin },
		'left-top': { x: margin, y: margin },
		'left-center': { x: margin, y: bound.height / 2 - size / 2 },
		'left-bottom': { x: margin, y: bound.height - size - margin },
		'right-top': { x: bound.width - size - margin, y: margin },
		'right-center': { x: bound.width - size - margin, y: bound.height / 2 - size / 2 },
		'right-bottom': { x: bound.width - size - margin, y: bound.height - size - margin },
		'center-top': { x: bound.width / 2 - size / 2, y: margin },
		'center-bottom': { x: bound.width / 2 - size / 2, y: bound.height - size - margin },
		'center-left': { x: margin, y: bound.height / 2 - size / 2 },
		'center-right': { x: bound.width - size - margin, y: bound.height / 2 - size / 2 },
		'center-center': { x: bound.width / 2 - size / 2, y: bound.height / 2 - size / 2 },
	}

	const testOptions: { placement: Placement; options: PlacementOptions; expected: Vec2 }[] =
		Object.entries(testObj).map(([placement, expected]) => ({
			placement: placement as Placement,
			options: { bounds: bound, margin },
			expected,
		}))

	for (const { placement, options, expected } of testOptions) {
		it(`should place the element correctly for ${placement}`, () => {
			const result = place_old(node, placement, options)
			expect(result.x).toBeCloseTo(expected.x)
			expect(result.y).toBeCloseTo(expected.y)
		})
	}
})
