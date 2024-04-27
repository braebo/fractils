import type { Input, ValidInputValue } from '$lib/gui/inputs/Input'

interface Commit<V extends ValidInputValue = ValidInputValue> {
	input: Input<V>
	from: V
	to: V
}

export class UndoManager {
	pointer = -1
	maxHistory = 50
	stack: Commit[] = []

	locked = false

	constructor() {}

	addTimer?: ReturnType<typeof setTimeout>
	add<V>(commit: { input: Input<V>; from: V; to: V }, _debounce = 100) {
		if (this.locked) {
			this.locked = false
			return
		}

		// todo - this wont work because the `from` will be stale,
		// todo - a solution that caches `from` and isolates timers per-input
		// clearTimeout(this.addTimer)
		// this.addTimer = setTimeout(() => {
		const diff = this.pointer + 1 - this.stack.length

		if (diff < 0) {
			console.warn('\nshaving stack with diff:', diff)
			this.stack = this.stack.slice(0, diff)
			// this.pointer += diff
		}

		this.pointer++
		this.stack.push(commit)

		this.logState('\nadd()', commit)
		// }, debounce)
	}

	undo() {
		// If is wrong we are at the start so don't do anything.
		if (this.pointer === -1) return
		this.locked = true

		// Find the last good value in the stack.
		const commit = this.stack[this.pointer]
		commit.input.set(commit.from)

		// move the pointer back.
		this.pointer--
		this.logState('\nundo()', commit)
	}

	redo() {
		if (this.pointer + 1 > this.stack.length - 1) return

		this.locked = true

		const commit = this.stack[this.pointer + 1]

		commit.input.set(commit.to)

		this.pointer++
		this.logState('redo()', commit)
	}

	logState(str: string, commit?: Commit) {
		console.log(str)
		console.log('pointer', this.pointer)
		console.log('stack', this.stack.length, this.stack)

		if (commit) {
			console.log('commit', commit)
		}
	}
}

// let foo = {
// 	bar: 'ba',
// }

// const undoManager = new UndoManager()

// const pushFoo = undoManager.add({
// 	initial: foo,
// 	// apply: (v) => (foo = v),
// 	apply: v => {
// 		foo = v
// 	},
// })

// function doStuff() {
// 	pushFoo(foo)
// 	console.log('\npush:', {
// 		foo,
// 	})
// }

// async function main() {
// 	doStuff()
// 	await wait(1000)
// 	undoManager.undo()
// 	await wait(1000)
// 	doStuff()
// }

// main()

// // x: 10
// // y: asd
// // z: { a: 2 }

// // x y y x z y x z z
// //                 ^

// // new UndoManager((v) => (value = v))

// // const um = new UndoManager()

// // const op = um.add('foo', {
// //     initial: foo,
// //     do_op: () => (foo = 'bar'),
// // })
