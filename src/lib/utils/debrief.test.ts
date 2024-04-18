import { describe, expect, it } from 'vitest'
import { debrief } from './debrief'

const obj = {
	arr: Array.from({ length: 10 }, (_, i) => i),
	one: {
		two: {
			three: {
				four: 5,
			},
		},
	},
	sibling: 'test',
}

describe('debrief', () => {
	it('should be correct with options: { depth: 0 }', () => {
		expect(debrief(obj, { depth: 0 })).toEqual({
			arr: '[...10 items]',
			one: '{...1 entry}',
			sibling: 'test',
		})
	})

	it('should be correct with options: { depth: 1, siblings: 3 }', () => {
		expect(debrief(obj, { depth: 1, siblings: 3 })).toEqual({
			arr: [0, 1, 2, '...7 more'],
			one: {
				two: '{...1 entry}',
			},
			sibling: 'test',
		})
	})

	it('should be correct with options: { depth: 2, siblings: 10 }', () => {
		expect(debrief(obj, { depth: 2, siblings: 10 })).toEqual({
			arr: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
			one: {
				two: {
					three: '{...1 entry}',
				},
			},
			sibling: 'test',
		})
	})

	it('should be correct with options: { depth: 2, siblings: 2 }', () => {
		expect(debrief(obj, { depth: 2, siblings: 2 })).toEqual({
			arr: [0, 1, '...8 more'],
			one: {
				two: {
					three: '{...1 entry}',
				},
			},
			'...': '1 more',
		})
	})

	it('should preserve all top-level keys if `preserveRootSiblings` is `true` with options: { depth: 2, siblings: 2, preserveRootSiblings: true }', () => {
		expect(debrief(obj, { depth: 2, siblings: 2, preserveRootSiblings: true })).toEqual({
			arr: [0, 1, '...8 more'],
			one: {
				two: {
					three: '{...1 entry}',
				},
			},
			sibling: 'test',
		})
	})

	it('Only truncate objects and arrays at the depth limit with options: { depth: 3, siblings: 5 }', () => {
		const arr = [
			{
				some: 'some',
				nested: 'nested',
				sibling: [],
				arrs: [
					{
						string: 'string',
						number: 5,
						arr: [...Array(21).keys()],
					},
					{
						string: 'string',
						number: 5,
						arr: [
							{
								entry1: 1,
								entry2: 2,
								entry3: [...Array(21).keys()],
							},
						],
					},
				],
			},
		]

		const breif = debrief(arr, { depth: 3, siblings: 5 })

		expect(breif).toEqual([
			{
				some: 'some',
				nested: 'nested',
				sibling: [],
				arrs: [
					{
						string: 'string',
						number: 5,
						arr: '[...21 items]',
					},
					{
						string: 'string',
						number: 5,
						arr: '[...1 item]',
					},
				],
			},
		])
	})
})
