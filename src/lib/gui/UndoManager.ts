import type { Input, ValidInputValue } from '../gui/inputs/Input'

import { y, c, b, m, g } from '../utils/l'
import { Logger } from '../utils/logger'

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
	_log = new Logger('UndoManager', { fg: 'aliceblue' })

	constructor() {
		this._dump('constructor')
	}

	commit<V>(commit: Commit<V>, _debounce = 100) {
		this._dump(c('commit'), g('start'), { commit })

		if (this.locked) {
			this._dump(c('commit'), y('locked'), 'aborting commit.')
			this.locked = false
			return
		}

		const diff = this.pointer + 1 - this.stack.length

		if (diff < 0) {
			this._dump('commit', 'shaving stack with diff:', diff)
			this.stack = this.stack.slice(0, diff)
		}

		this.pointer++
		this.stack.push(commit)

		if (this.stack.length > this.maxHistory) {
			this.stack.shift()
			this.pointer--
		}

		this._dump(c('commit'), b('end'), 'pushed commit')
	}

	undo() {
		if (this.pointer === -1) {
			this._dump(m('undo'), 'pointer is -1, aborting undo.')
			return
		}
		this._dump(m('undo'), g('start'))
		this.locked = true

		const commit = this.stack[this.pointer]

		if (commit.setter) {
			commit.setter(commit.from)
		} else {
			commit.input.set(commit.from)
		}

		this.pointer--
		this._dump(m('undo'), b('end'))
	}

	redo() {
		if (this.pointer + 1 > this.stack.length - 1) {
			this._dump('redo', y('pointer is at end of stack, aborting redo.'))
			return
		}
		this._dump('redo', g('start'))

		this.locked = true

		const commit = this.stack[this.pointer + 1]

		if (commit.setter) {
			this._dump('redo', 'Custom setter found.  Using it instead.')
			commit.setter(commit.to)
		} else {
			commit.input.set(commit.to)
		}

		this.pointer++

		this._dump('redo', b('end'))
	}

	_dump(fn_name: string, ...args: any[]) {
		this._log
			.fn(fn_name)
			.info(...args, { data: { stack: this.stack, pointer: this.pointer, this: this } })
	}
}
