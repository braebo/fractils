import { describe, it, expect } from 'vitest'
import { isType } from './isType'

describe('isType', () => {
	it('should correctly identify custom types', () => {
		const aAny: any = { __type: 'a', bar: 'baz' }
		if (isType(aAny, 'a')) {
			// @ts-expect-error
			const _: { __type: 'a'; bar: string } = aAny
		}
	})

	it('should correctly identify primitive types', () => {
		const numberAny: any = 1
		const stringAny: any = 'test'
		const booleanAny: any = true
		const funcAny: any = () => {}
		const objAny: any = {}

		if (isType(numberAny, 'number')) {
			// @ts-expect-error
			const _: number = numberAny
		}
		if (isType(stringAny, 'string')) {
			// @ts-expect-error
			const _: string = stringAny
		}
		if (isType(booleanAny, 'boolean')) {
			// @ts-expect-error
			const _: boolean = booleanAny
		}
		if (isType(funcAny, 'function')) {
			// @ts-expect-error
			const _: Function = funcAny
		}
		if (isType(objAny, 'object')) {
			// @ts-expect-error
			const _: object = objAny
		}
	})

	it('should return false for incorrect types', () => {
		const aAny: any = { __type: 'a', bar: 'baz' }
		const numberAny: any = 1
		const stringAny: any = 'test'
		const booleanAny: any = true
		const funcAny: any = () => {}
		const objAny: any = {}

		expect(isType(aAny, 'b')).toBe(false)
		expect(isType(numberAny, 'string')).toBe(false)
		expect(isType(stringAny, 'number')).toBe(false)
		expect(isType(booleanAny, 'string')).toBe(false)
		expect(isType(funcAny, 'object')).toBe(false)
		expect(isType(objAny, 'function')).toBe(false)
	})
})
