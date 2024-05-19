/*
 * // todo - There's still an off-by-one error in the undo manager.
 * repro:
 * - change 2 different inputs
 * - undo once
 * - change 1 input
 * Things will be out of sync.
 * Also, when undoing all the way, the pointer is -1, but the stack still has 1 commit.
 */

import chalk from 'chalk'
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
		this.#l('constructor')
	}

	commit<V>(commit: Commit<V>, _debounce = 100) {
		this.#lc(c('commit') + g(' start'), commit)

		if (this.locked) {
			this.#l(c('commit'), y('locked'), 'aborting commit.')
			this.locked = false
			return
		}

		const diff = this.pointer + 1 - this.stack.length

		if (diff < 0) {
			this.#l('commit', 'shaving stack with diff:', diff)
			this.stack = this.stack.slice(0, diff)
		}

		this.pointer++
		this.stack.push(commit)

		if (this.stack.length > this.maxHistory) {
			this.#l(c('commit'), 'stack length exceeds maxHistory, shifting stack.')
			this.stack.shift()
			this.pointer--
		}

		this.#lc(c('commit') + b(' end'), commit, 'pushed commit')
	}

	undo = () => {
		if (this.pointer === -1) {
			this.#l(m('undo'), 'pointer is -1, aborting undo.')
			return
		}
		this.#l(m('undo'), g('start'))

		this.locked = true

		const commit = this.stack[this.pointer]

		if (commit.setter) {
			this.#lc('undo', commit, 'Using custom undo setter.')
			commit.setter(commit.from)
		} else {
			commit.input.set(commit.from)
		}

		this.pointer--

		this.#l(m('undo'), b('end'))
	}

	redo = () => {
		if (this.pointer + 1 > this.stack.length - 1) {
			this.#l('redo', y('pointer is at end of stack, aborting redo.'))
			return
		}
		this.#l('redo', g('start'))

		this.locked = true

		const commit = this.stack[this.pointer + 1]

		if (commit.setter) {
			this.#l('redo', 'Using custom redo setter.')
			commit.setter(commit.to)
		} else {
			commit.input.set(commit.to)
		}

		this.pointer++

		this.#l('redo', b('end'))
	}

	clear() {
		this.#l('clear', g('start'))
		this.stack = []
		this.pointer = -1
		this.#l('clear', b('end'))
	}

	#l(fn_name: string, ...args: any[]) {
		this._log
			.fn(fn_name)
			.info(...args, { data: { stack: this.stack, pointer: this.pointer, this: this } })
	}
	#lc(fn_name: string, commit: Commit, ...args: any[]) {
		if (!(typeof commit.from.r === 'number')) return this.#l(fn_name, commit, ...args)

		const from = chalk.rgb(commit.from.r, commit.from.g, commit.from.b)
		const to = chalk.rgb(commit.to.r, commit.to.g, commit.to.b)
		this._log
			.fn(fn_name)
			.info(
				`from: ${from(commit.from.r)} ${from(commit.from.g)} ${from(commit.from.b)}, to: ${to(commit.to.r)} ${to(commit.to.g)} ${to(commit.to.b)}`,
				...args,
				{
					data: { stack: this.stack, pointer: this.pointer, this: this },
				},
			)
	}
}
