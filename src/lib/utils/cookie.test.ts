import { describe, it, expect } from 'vitest'
import { parse } from './cookie'

describe('parse(str)', () => {
	it('should parse cookie string to object', () => {
		expect(parse('foo=bar')).toEqual({ foo: 'bar' })
		expect(parse('foo=123')).toEqual({ foo: '123' })
	})

	it('should ignore OWS', () => {
		expect(parse('FOO    = bar;   baz  =   raz')).toEqual({ FOO: 'bar', baz: 'raz' })
	})

	it('should parse cookie with empty value', () => {
		expect(parse('foo= ; bar=')).toEqual({ foo: '', bar: '' })
	})

	it('should URL-decode values', () => {
		expect(parse('foo="bar=123456789&name=Magic+Mouse"')).toEqual({
			foo: 'bar=123456789&name=Magic+Mouse',
		})
		expect(parse('email=%20%22%2c%3b%2f')).toEqual({ email: ' ",;/' })
	})

	it('should return original value on escape error', () => {
		expect(parse('foo=%1;bar=bar')).toEqual({ foo: '%1', bar: 'bar' })
	})

	it('should ignore cookies without value', () => {
		expect(parse('foo=bar;fizz  ;  buzz')).toEqual({ foo: 'bar' })
		expect(parse('  fizz; foo=  bar')).toEqual({ foo: 'bar' })
	})

	it('should ignore duplicate cookies', () => {
		expect(parse('foo=%1;bar=bar;foo=boo')).toEqual({ foo: '%1', bar: 'bar' })
		expect(parse('foo=false;bar=bar;foo=true')).toEqual({ foo: 'false', bar: 'bar' })
		expect(parse('foo=;bar=bar;foo=boo')).toEqual({ foo: '', bar: 'bar' })
	})
})
