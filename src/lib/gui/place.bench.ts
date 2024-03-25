import type { Placement, PlacementOptions, Vec2 } from './place'

import { place_old, place } from './place'
import { start } from '$lib/utils/time'

/**
 * @fileoverview
 * Just a simple benchmark to compare the performance
 * of the old place function with the new one.
 *
 * Results:
 * - place      0.3s
 * - place_old  5.8s
 */

const benchCount = 1e6

// @ts-ignore
globalThis.window = {
	innerWidth: 1920,
	innerHeight: 1080,
} as Window

const size = 10
const node = {
	offsetWidth: size,
	offsetHeight: size,
} as HTMLElement

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

const end1 = start('place')
for (let i = 0; i < benchCount; i++) {
	for (const { placement } of testOptions) {
		const result = place_old(node, placement)
		result.x = Math.round(result.x)
		result.y = Math.round(result.y)
	}
}
end1()

const end2 = start('place2')
for (let i = 0; i < benchCount; i++) {
	for (const { placement, options } of testOptions) {
		const result = place(node, placement, options)
		result.x = Math.round(result.x)
		result.y = Math.round(result.y)
	}
}
end2()
