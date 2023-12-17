import { describe, test, expect } from 'vitest'
import { resolveArg, mapArgs, ArgMap } from './args'

const args = ['--name', 'John', '-a', '25', '--pog']

describe('arg', () => {
	describe('long', () => {
		test('spaced', () => {
			const result = resolveArg('name', args)
			expect(result).toBe('John')
		})

		test('=', () => {
			const result = resolveArg('name', args)
			expect(result).toBe('John')
		})

		test('missing arg is undefined', () => {
			const result = resolveArg('height', args)
			expect(result).toBeUndefined()
		})
	})

	describe('short', () => {
		test('spaced', () => {
			const result = resolveArg('name', args)
			expect(result).toBe('John')
		})

		test('missing arg is undefined', () => {
			const result = resolveArg('height', args)
			expect(result).toBeUndefined()
		})
	})
})

describe('mapArgs', () => {
	test('map arguments to values', () => {
		const result = mapArgs(args)
		console.log({ result })
		expect(result.get('name')).toBe('John')
		expect(result.get('age'), 'Long name fails to resolve short name.').toBeUndefined()
		expect(result.get('pog')).toBe(true)
	})

	test('should return an empty map if no arguments are provided', () => {
		const args: string[] = []
		const result = mapArgs(args)
		expect(result.size).toBe(0)
	})
})

describe('ArgMap', () => {
	const argMap = new ArgMap(args)

	test('map arguments to values', () => {
		console.log(argMap.toObject())
		console.log(argMap.map)

		expect(argMap.get('name')).toBe('John')
		expect(argMap.get('age')).toBe(25)
		expect(argMap.get('pog')).toBe(true)
	})
})
