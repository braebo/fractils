import { describe, it, expect } from 'vitest'
import { deepMergeOpts } from './deepMergeOpts'

describe('deepMerge', () => {
	it('should merge simple objects', () => {
		const a = { 0: 1 }
		const b = { 1: 1 }
		const x = { 0: 1, 1: 1 }
		expect(deepMergeOpts([a, b])).toEqual(x)
	})

	it('should merge nested objects', () => {
		const a = { 0: { 0: 0 } }
		const b = { 0: { 1: 0 } }
		const x = { 0: { 0: 0, 1: 0 } }
		expect(deepMergeOpts([a, b])).toEqual(x)
	})

	it('should not mutate the original objects', () => {
		const a = {}
		const b = { 0: 1 }
		const x = {}
		deepMergeOpts([a, b])
		expect(a).toEqual(x)
	})

	it('should always overwrite `undefined`', () => {
		const a = { 0: undefined, 1: undefined, 2: undefined, 3: undefined }
		const b = { 0: 1, 1: '2', 2: true, 3: false }
		const x = { 0: 1, 1: '2', 2: true, 3: false }
		expect(deepMergeOpts([a, b])).toEqual(x)
	})

	it('should accept `0`', () => {
		const a = { 0: 1 }
		const b = { 0: 0 }
		const x = { 0: 0 }
		expect(deepMergeOpts([a, b])).toEqual(x)
	})

	it('should reject `true`', () => {
		const a = { 0: { 0: 0 } }
		const b = { 0: true }
		const x = { 0: { 0: 0 } }
		expect(deepMergeOpts([a, b])).toEqual(x)
	})

	it('should accept `false`', () => {
		const a = { 0: { 0: 0 } }
		const b = { 0: false }
		const x = { 0: false }
		expect(deepMergeOpts([a, b])).toEqual(x)
	})

	it('should reject `undefined`', () => {
		const a = { 0: 0 }
		const b = { 0: undefined }
		const x = { 0: 0 }
		expect(deepMergeOpts([a, b])).toEqual(x)
	})

	it('should merge `true`, but not `false`', () => {
		const a = { 0: true, 1: 1 }
		const b = { 0: 1, 1: false }
		const x = { 0: 1, 1: false }
		expect(deepMergeOpts([a, b])).toEqual(x)
	})

	it('should concatenate arrays', () => {
		const a = { 0: [0] }
		const b = { 0: [1] }
		const x = { 0: [0, 1] }
		expect(deepMergeOpts([a, b])).toEqual(x)
	})

	it('should de-duplicate arrays', () => {
		const a = { 0: [1, 2] }
		const b = { 0: [2, 3] }
		const x = { 0: [1, 2, 3] }
		expect(deepMergeOpts([a, b])).toEqual(x)
	})

	it('should accept strings', () => {
		const a = { 0: { 0: 0 } }
		const b = { 0: '1' }
		const x = { 0: '1' }
		expect(deepMergeOpts([a, b])).toEqual(x)
	})
})
