import { describe, expect, it } from 'vitest'
import { resolveArg, mapArgs, ArgMap } from './args'

const args = ['--name', 'John', '-a', '25', '--foo=true', '-b', '=', 'true']

describe('args', () => {
	describe('resolveArg', () => {
		it('should resolve longhand', () => {
			const result = resolveArg('name', args)
			expect(result).toBe('John')
		})

		it('should handle longhand = sign', () => {
			const result = resolveArg('foo', args)
			expect(result).toBeTruthy()
		})

		it('should not work if = sign is used with shorthand', () => {
			const result = resolveArg('b', args)
			expect(result).toBe('true')
		})

		it('missing arg is undefined', () => {
			const result = resolveArg('height', args)
			expect(result).toBeUndefined()
		})
	})

	describe('mapArgs', () => {
		it('should map arguments to values', () => {
			const result = mapArgs(args)
			expect(result.get('name')).toBe('John')
			expect(result.get('age'), 'Long name fails to resolve short name.').toBeUndefined()
			expect(result.get('b')).toBe(true)
		})

		it('should return an empty map if no arguments are provided', () => {
			const args: string[] = []
			const result = mapArgs(args)
			expect(result.size).toBe(0)
		})
	})

	describe('ArgMap', () => {
		const argMap = new ArgMap(args)

		it('should map arguments to values', () => {
			expect(argMap.get('name')).toBe('John')
			expect(argMap.get('age')).toBe(25)
			expect(argMap.get('b')).toBe(true)
		})
	})
})
