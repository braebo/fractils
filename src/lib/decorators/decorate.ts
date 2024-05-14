//
//
///////////////////////////////////////////////////////////
//?                     Factory                          //
///////////////////////////////////////////////////////////
// Convoluted type-nastics workaround for typescript's broken decorator implementation.
//

export type Constructor<T = any> = new (...args: any[]) => T

export type ClassDecorator<T = any> = (constructor: Constructor<T>) => Constructor<T>

// Helper type to convert a tuple of decorators into an intersection of their types
export type IntersectionOfDecoratorTypes<D extends ClassDecorator[]> = D extends [
	(constructor: Constructor) => infer R,
	...infer Rest,
]
	? (R extends Constructor<infer U> ? U : never) &
			IntersectionOfDecoratorTypes<Rest extends ClassDecorator[] ? Rest : []>
	: {}

export function decorate<T extends Constructor, D extends ClassDecorator[]>(
	BaseClass: T,
	...decorators: D
) {
	let DecoratedClass: Constructor<any> = BaseClass

	decorators.forEach(decorator => {
		DecoratedClass = decorator(DecoratedClass)
	})

	return (...args: ConstructorParameters<T>) => {
		return new DecoratedClass(...args) as InstanceType<T> & IntersectionOfDecoratorTypes<D>
	}
}

export class FooFactory {
	constructor(public count: number) {}
	enable() {}
	disable() {}
}

const createFoo = decorate(FooFactory, disableable, loggable)
const factory = createFoo(5)

const disabled1 = factory.disabled //=>
//    ^?
console.log(disabled1)

const log1 = factory.log //=>
//    ^?
log1('Hello, world!')

//
// If the input class doesn't have the required methods, we should get a type error:
// ❌

class BadFooFactory {
	constructor(public count: number) {}
}
const createBadFoo = decorate(BadFooFactory, disableable, loggable)
const badFactory = createBadFoo(5)

const disabled = badFactory.disabled //=>
//    ^?
console.log(disabled)

const log = badFactory.log //=>
//    ^?
log('Hello, world!') // BadFooFactory: Hello, world!

//
//
///////////////////////////////////////////////////////////
//?                     Merging                          //
///////////////////////////////////////////////////////////
// Or, just utilise interface merging and call it a day.
//

// This line makes it all work.
export interface FooMerging extends Disableable, Loggable {}

export
@disableable
@loggable
class FooMerging {
	constructor(public count: number) {}
	enable() {}
	disable() {}
}

const merging = new FooMerging(5)

const disabled2 = merging.disabled //=>
//    ^?
console.log(disabled2)

const log2 = merging.log //=>
//    ^?
log2('Hello, world!') // FooMerging: Hello, world!

//
// If the input class doesn't have the required methods, we should get a type error:
//

// @ts-expect-error ✅
@disableable
@loggable
export class MissingMethods {
	constructor(public count: number) {}
}

//
//
//? Defs
//
//

/**
 * Coerces a value to a function.
 */
export function toFn<T>(v: T | (() => T)): () => T {
	if (typeof v === 'function') {
		return v as () => T
	}

	return () => v as unknown as T
}

export interface Disableable {
	/**
	 * Whether the controller is disabled.  A function can be used to
	 * dynamically determine the disabled state.
	 */
	disabled: boolean
}

/**
 * A class decorator that adds a `disabled` property to a class that implements an `enable` and
 * disable` method. The `disabled` property can be set to either a static boolean, or a function
 * that returns a boolean value.  The `disabled` state can be refreshed by assigning it to itself,
 * which is particularly useful when passing a function that depends on some external state.
 *
 * A private property, a getter, and a setter are added to the class:
 * - `private _disabled: () => boolean` - The internal function that determines the disabled state.
 * - `get disabled(): boolean` - The current disabled state.
 * - `set disabled(boolean | (() => boolean))` - Set the disabled state to either a static boolean or a
 *  function that returns a boolean.
 */
export function disableable<
	T extends {
		new (...args: any[]): {
			enable(): void
			disable(): void
		}
	},
>(
	constructor: T,
): T & {
	new (...args: any[]): Disableable
} {
	return class extends constructor {
		private _disabled: () => boolean = () => false

		get disabled(): boolean {
			return this._disabled()
		}
		set disabled(value: boolean | (() => boolean)) {
			this._disabled = toFn(value)
			this._disabled() ? this.disable() : this.enable()
		}
	}
}

export interface Loggable {
	log(message: string): void
}

/**
 * Test logger decorator.
 */
export function loggable<T extends new (...args: any[]) => {}>(constructor: T) {
	return class extends constructor {
		log(message: string) {
			console.log(`${(constructor as any).name}: ${message}`)
		}
	}
}
