export type Foobar = 'bar' | 'baz' | 'qux'

/**
 * This is a test class.
 */
export class Test {
	/**
	 * Actually a {@link Foobar | Foooooobar } in disguise.
	 */
	foo = 'bar'
	/**
	 * This is very different from {@link Test.foo}!
	 */
	baz?: 'qux'

	constructor(
		/**
		 * This is a test param.
		 */
		public testParam = 'test',
	) {
		console.log('Test')
	}

	/**
	 * This is a test method.
	 */
	testMethod() {
		console.log('Test method')
	}
}
