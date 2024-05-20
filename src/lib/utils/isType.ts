export function isType<const T extends any, const U extends string = string>(
	value: T | boolean | undefined,
	type: U,
): value is NonNullable<T> & { __type: U }
export function isType(value: any, type: 'number'): value is number
export function isType(value: any, type: 'string'): value is string
export function isType(value: any, type: 'boolean'): value is boolean
export function isType(value: any, type: 'function'): value is (...args: any[]) => any
export function isType<const _T extends any, const U extends string>(
	value: any,
	type: U | 'number' | 'string' | 'boolean' | 'function' | 'object',
): boolean {
	if (typeof value !== 'object' || value === null || ['object', 'function'].includes(type)) {
		return typeof value === type
	}
	return '__type' in value && (value as any)['__type'] === type
}

// interface A {
// 	__type?: 'a'
// 	bar: 'baz'
// }

// const a: A = {
// 	__type: 'a',
// 	bar: 'baz',
// }

// const isA = isType(a, 'a')
// if (isA) {
// 	a //=>
// } else {
// 	a //=>
// }
// // console.log(`a is ${isA ? 'A' : 'not A'}`)

// const b = {
// 	__type: 'b',
// 	bar: 'baz',
// }

// const isB = isType(b, 'a')
// if (isB) {
// 	b //=>
// } else {
// 	b //=>
// }
// // console.log(`b is ${isB ? 'A' : 'not A'}`)

// const number = 1 as any
// const isNumber = isType(number, 'number')

// if (isNumber) {
// 	number //=>
// } else {
// 	number //=>
// }
// // console.log(`number is ${isNumber ? 'number' : 'not number'}`)

// const string = 'string' as any
// const isString = isType(string, 'string')
// if (isString) {
// 	string //=>
// } else {
// 	string //=>
// }
// // console.log(`string is ${isString ? 'string' : 'not string'}`)

// const boolean = true as any
// const isBoolean = isType(boolean, 'boolean')
// if (isBoolean) {
// 	boolean //=>
// } else {
// 	boolean //=>
// }
// // console.log(`boolean is ${isBoolean ? 'boolean' : 'not boolean'}`)

// const func = (() => {}) as any
// const isFunction = isType(func, 'function')
// if (isFunction) {
// 	func //=>
// } else {
// 	func //=>
// }
// // console.log(`func is ${isFunction ? 'function' : 'not function'}`)

// const obj = {} as any
// const isObject = isType(obj, 'object')
// if (isObject) {
// 	obj //=>
// } else {
// 	obj //=>
// }
// // console.log(`object is ${isObject ? 'object' : 'not object'}`)
