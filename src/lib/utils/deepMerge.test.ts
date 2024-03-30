import { describe, it, expect } from 'vitest'
import { deepMerge } from './deepMerge'

type Obj = Record<string, any>

describe('deepMerge', () => {
	it('should merge two simple objects', () => {
		const obj1: Obj = { a: 1 }
		const obj2: Obj = { b: 2 }
		const result = deepMerge(obj1, obj2)
		expect(result).toEqual({ a: 1, b: 2 })
	})

	it('should merge nested objects', () => {
		const obj1: Obj = { a: { x: 1 } }
		const obj2: Obj = { a: { y: 2 }, b: 3 }
		const result = deepMerge(obj1, obj2)
		expect(result).toEqual({ a: { x: 1, y: 2 }, b: 3 })
	})

	it('should not mutate the original objects', () => {
		const obj1: Obj = { a: 1, b: { x: 1 } }
		const obj2: Obj = { b: { y: 2 } }
		deepMerge(obj1, obj2)
		expect(obj1).toEqual({ a: 1, b: { x: 1 } })
		expect(obj2).toEqual({ b: { y: 2 } })
	})

	it('should override undefined values', () => {
		const obj1: Obj = { a: undefined, b: 1 }
		const obj2: Obj = { a: 2 }
		const result = deepMerge(obj1, obj2)
		expect(result).toEqual({ a: 2, b: 1 })
	})

	it('should override `true`, but not `false`', () => {
		const obj1: Obj = { a: 'foo', b: true }
		const obj2: Obj = { a: 'bar', b: { x: 1 } }
		const result = deepMerge(obj1, obj2)
		expect(result).toEqual({ a: 'bar', b: { x: 1 } })
	})

	it('should preserve objects when encountering `true`', () => {
		const obj1: Obj = { a: { x: 1 } }
		const obj2: Obj = { a: true }
		const result = deepMerge(obj1, obj2)
		expect(result).toEqual({ a: { x: 1 } })
	})

	it('should replace objects with `false`', () => {
		const obj1: Obj = { a: { x: 1 } }
		const obj2: Obj = { a: false }
		const result = deepMerge(obj1, obj2)
		expect(result).toEqual({ a: false })
	})

	it('should not replace a value with `true`', () => {
		const obj1: Obj = { a: { x: 1 } }
		const obj2: Obj = { a: true }
		const result = deepMerge(obj1, obj2)
		expect(result).toEqual({ a: { x: 1 } })
	})

	it('should always replace a value with `false`', () => {
		const obj1: Obj = { a: { x: 1 } }
		const obj2: Obj = { a: false }
		const result = deepMerge(obj1, obj2)
		expect(result).toEqual({ a: false })
	})

	it('should replace booleans with booleans', () => {
		const obj1: Obj = { a: false, b: true }
		const obj2: Obj = { a: true, b: false }
		const result = deepMerge(obj1, obj2)
		expect(result).toEqual({ a: true, b: false })
	})

	it('should not replace a value with `undefined`', () => {
		const obj1: Obj = { a: 1, b: { x: 1 } }
		const obj2: Obj = { a: undefined, b: undefined }
		const result = deepMerge(obj1, obj2)
		expect(result).toEqual({ a: 1, b: { x: 1 } })
	})

	it('should concatenate arrays', () => {
		const obj1: Obj = { a: [1, 2] }
		const obj2: Obj = { a: [3, 4] }
		const result = deepMerge(obj1, obj2)
		expect(result).toEqual({ a: [1, 2, 3, 4] })
	})

	it('should de-duplicate arrays', () => {
		const obj1: Obj = { a: [1, 2] }
		const obj2: Obj = { a: [2, 3] }
		const result = deepMerge(obj1, obj2)
		expect(result).toEqual({ a: [1, 2, 3] })
	})
})
