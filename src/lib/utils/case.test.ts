import { describe, it, expect } from 'vitest'
import { convertCase } from './case'

describe('convertCase', () => {
	describe('camel', () => {
		it('camelCase -> snake_case', () =>
			expect(convertCase('helloWorld', 'camel', 'snake')).toBe('hello_world'))
		it('camel -> kebab', () =>
			expect(convertCase('helloWorld', 'camel', 'kebab')).toBe('hello-world'))
		it('camel -> pascal', () =>
			expect(convertCase('helloWorld', 'camel', 'pascal')).toBe('HelloWorld'))
		it('camel -> constant', () =>
			expect(convertCase('helloWorld', 'camel', 'constant')).toBe('HELLO_WORLD'))
		it('camel -> capitalized', () =>
			expect(convertCase('helloWorld', 'camel', 'capitalized')).toBe('Hello World'))
	})

	describe('snake', () => {
		it('snake_case -> camelCase', () =>
			expect(convertCase('hello_world', 'snake', 'camel')).toBe('helloWorld'))
		it('snake_case -> kebab-case', () =>
			expect(convertCase('hello_world', 'snake', 'kebab')).toBe('hello-world'))
		it('snake_case -> PascalCase', () =>
			expect(convertCase('hello_world', 'snake', 'pascal')).toBe('HelloWorld'))
		it('snake_case -> CONSTANT_CASE', () =>
			expect(convertCase('hello_world', 'snake', 'constant')).toBe('HELLO_WORLD'))
		it('snake_case -> Capitalized Case', () =>
			expect(convertCase('hello_world', 'snake', 'capitalized')).toBe('Hello World'))
	})

	describe('kebab', () => {
		it('kebab-case -> camelCase', () =>
			expect(convertCase('hello-world', 'kebab', 'camel')).toBe('helloWorld'))
		it('kebab-case -> snake_case', () =>
			expect(convertCase('hello-world', 'kebab', 'snake')).toBe('hello_world'))
		it('kebab-case -> PascalCase', () =>
			expect(convertCase('hello-world', 'kebab', 'pascal')).toBe('HelloWorld'))
		it('kebab-case -> CONSTANT_CASE', () =>
			expect(convertCase('hello-world', 'kebab', 'constant')).toBe('HELLO_WORLD'))
		it('kebab-case -> Capitalized Case', () =>
			expect(convertCase('hello-world', 'kebab', 'capitalized')).toBe('Hello World'))
	})

	describe('pascal', () => {
		it('PascalCase -> camelCase', () =>
			expect(convertCase('HelloWorld', 'pascal', 'camel')).toBe('helloWorld'))
		it('PascalCase -> snake_case', () =>
			expect(convertCase('HelloWorld', 'pascal', 'snake')).toBe('hello_world'))
		it('PascalCase -> kebab', () =>
			expect(convertCase('HelloWorld', 'pascal', 'kebab')).toBe('hello-world'))
		it('PascalCase -> CONSTANT_CASE', () =>
			expect(convertCase('HelloWorld', 'pascal', 'constant')).toBe('HELLO_WORLD'))
		it('PascalCase -> Capitalized Case', () =>
			expect(convertCase('HelloWorld', 'pascal', 'capitalized')).toBe('Hello World'))
	})

	describe('constant', () => {
		it('CONSTANT_CASE -> camelCase', () =>
			expect(convertCase('HELLO_WORLD', 'constant', 'camel')).toBe('helloWorld'))
		it('CONSTANT_CASE -> snake_case', () =>
			expect(convertCase('HELLO_WORLD', 'constant', 'snake')).toBe('hello_world'))
		it('CONSTANT_CASE -> kebab', () =>
			expect(convertCase('HELLO_WORLD', 'constant', 'kebab')).toBe('hello-world'))
		it('CONSTANT_CASE -> PascalCase', () =>
			expect(convertCase('HELLO_WORLD', 'constant', 'pascal')).toBe('HelloWorld'))
		it('CONSTANT_CASE -> Capitalized Case', () =>
			expect(convertCase('HELLO_WORLD', 'constant', 'capitalized')).toBe('Hello World'))
	})

	describe('capitalized', () => {
		it('Capitalized -> camelCase', () =>
			expect(convertCase('Hello world', 'capitalized', 'camel')).toBe('helloWorld'))
		it('Capitalized -> snake_case', () =>
			expect(convertCase('Hello world', 'capitalized', 'snake')).toBe('hello_world'))
		it('Capitalized -> kebab', () =>
			expect(convertCase('Hello world', 'capitalized', 'kebab')).toBe('hello-world'))
		it('Capitalized -> PascalCase', () =>
			expect(convertCase('Hello world', 'capitalized', 'pascal')).toBe('HelloWorld'))
		it('Capitalized -> CONSTANT_CASE', () =>
			expect(convertCase('Hello world', 'capitalized', 'constant')).toBe('HELLO_WORLD'))
	})
})
