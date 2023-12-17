import { describe, it, expect } from 'vitest'
import { coerce, coerceObject } from './coerce'

describe('coerce', () => {
	it('should coerce string values to boolean or number', () => {
		expect(coerce('true')).toBe(true)
		expect(coerce('false')).toBe(false)
		expect(coerce('123')).toBe(123)
		expect(coerce('123.456')).toBe(123.456)
		expect(coerce('')).toBe('')
	})
})

describe('coerceObject', () => {
	it('should coerce string values in the object', () => {
		const obj = {
			name: 'John',
			age: '30',
			isActive: 'true',
		}

		const result = coerceObject(obj)

		expect(result.name).toBe('John')
		expect(result.age).toBe(30)
		expect(result.isActive).toBe(true)
	})

	it('should not coerce non-string values in the object', () => {
		const obj = {
			name: 'John',
			age: 30,
			isActive: true,
		}

		const result = coerceObject(obj)

		expect(result.name).toBe('John')
		expect(result.age).toBe(30)
		expect(result.isActive).toBe(true)
	})
})
