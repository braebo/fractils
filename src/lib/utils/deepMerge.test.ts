import { describe, it, expect } from 'vitest'
import { deepMerge } from './deepMerge' // Adjust the import based on your file structure

describe('deepMerge', () => {
	it('should merge two simple objects', () => {
		const obj1 = { a: 1 }
		const obj2 = { b: 2 }
		const result = deepMerge(obj1, obj2)
		expect(result).toEqual({ a: 1, b: 2 })
	})

	it('should merge nested objects', () => {
		const obj1 = { a: { x: 1 } }
		const obj2 = { a: { y: 2 }, b: 3 }
		const result = deepMerge(obj1, obj2)
		expect(result).toEqual({ a: { x: 1, y: 2 }, b: 3 })
	})

	it('should not mutate the original objects', () => {
		const obj1 = { a: 1, b: { x: 1 } }
		const obj2 = { b: { y: 2 } }
		deepMerge(obj1, obj2)
		expect(obj1).toEqual({ a: 1, b: { x: 1 } })
		expect(obj2).toEqual({ b: { y: 2 } })
	})

	it('should handle merging with undefined values', () => {
		const obj1 = { a: undefined, b: 1 }
		const obj2 = { a: 2 }
		const result = deepMerge(obj1, obj2)
		expect(result).toEqual({ a: 2, b: 1 })
	})

	// Add more tests as needed to cover other scenarios
})
