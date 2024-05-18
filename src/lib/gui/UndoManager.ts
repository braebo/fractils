import type { Input, ValidInputValue } from '$lib/gui/inputs/Input'

export interface Commit<V extends ValidInputValue = ValidInputValue> {
	input: Input<V>
	from: V
	to: V
	setter?: (v: V) => void
}

export class UndoManager {
	pointer = -1
	maxHistory = 50
	stack: Commit[] = []

	locked = false

	constructor() {}

	addTimer?: ReturnType<typeof setTimeout>
	commit<V>(commit: Commit<V>, _debounce = 100) {
		if (this.locked) {
			this.locked = false
			return
		}

		// todo - this wont work because the `from` will be stale,
		// todo - a solution that caches `from` and isolates timers per-input
		const diff = this.pointer + 1 - this.stack.length

		if (diff < 0) {
			console.warn('\nshaving stack with diff:', diff)
			this.stack = this.stack.slice(0, diff)
		}

		this.pointer++
		this.stack.push(commit)

		// this.logState('\nadd()', commit)
	}

	undo() {
		if (this.pointer === -1) return
		this.locked = true

		const commit = this.stack[this.pointer]

		if (commit.setter) {
			commit.setter(commit.from)
		} else {
			commit.input.set(commit.from)
		}

		this.pointer--
		// this.logState('\nundo()', commit)
	}

	redo() {
		if (this.pointer + 1 > this.stack.length - 1) return

		this.locked = true

		const commit = this.stack[this.pointer + 1]

		if (commit.setter) {
			commit.setter(commit.to)
		} else {
			commit.input.set(commit.to)
		}

		this.pointer++
		// this.logState('redo()', commit)
	}

	// logState(str: string, commit?: Commit) {
	// 	console.log(str)
	// 	console.log('pointer', this.pointer)
	// 	console.log('stack', this.stack.length, this.stack)

	// 	if (commit) {
	// 		console.log('commit', commit)
	// 	}
	// }
}
