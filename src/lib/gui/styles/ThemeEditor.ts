import type { StructuredVars } from '../../css/custom-properties'
import type { VariableDefinition } from '../../themer/types'
import type { InputOptions } from '../inputs/Input'
import type { Folder } from '../Folder'

import { CSS_VAR_INNER, restructureVars } from '../../css/custom-properties'
import { entries } from '../../utils/object'
import { isType } from '../../utils/isType'
import { isColor } from '../../color/color'
import { Logger } from '../../utils/logger'
import { Gui } from '../Gui'

export class ThemeEditor {
	gui: Gui
	private _log: Logger

	get folder() {
		return this.gui.folder
	}

	constructor(public targetGui: Gui) {
		this._log = new Logger(`ThemeEditor ${targetGui.folder.title}`, {
			fg: 'DarkCyan',
			deferred: false,
		})
		const opts = targetGui.opts
		if (isType(opts.storage, 'GuiStorageOptions')) {
			opts.storage.key += '::theme-editor'
		}
		// console.log(opts)
		// const storageOpts = isType(opts?.storage, 'GuiStorageOptions') ? opts.storage : undefined
		// const key = storageOpts ? storageOpts.key + '::theme-editor' : ''

		this.gui = new Gui({
			title: 'Theme Editor',
			container: targetGui.container,
			_themer: targetGui.themer,
			_windowManager: targetGui.windowManager, // Recycling!
		})

		// const dragOpts = isType(this.targetGui.windowManager?.opts.draggable, 'object')
		// 	? this.targetGui.windowManager.opts.draggable
		// 	: DRAGGABLE_DEFAULTS

		// const resizeOpts = isType(this.targetGui.windowManager?.opts.resizable, 'object')
		// 	? this.targetGui.windowManager.opts.resizable
		// 	: RESIZABLE_DEFAULTS

		// this.targetGui.windowManager?.add(this.gui.wrapper, {
		// 	id: this.gui.id,
		// 	...this.targetGui.windowManager.opts,
		// 	draggable: {
		// 		...dragOpts,
		// 		handle: this.gui.elements.header,
		// 	},
		// 	resizable: {
		// 		...resizeOpts,
		// 	},
		// })

		// console.log(targetGui.container)
		// console.log(this.gui.container)

		if (!this.targetGui.themer) {
			throw new Error('Themer not found.')
		}

		this.targetGui.themer.addTarget(this.gui.wrapper)

		this.folder.evm.add(
			this.targetGui.themer.theme.subscribe(t => {
				this.gui.folder.title = `${opts?.title} · ${t.title}`
			}),
		)

		this.targetGui.themer!.applyTheme()

		setTimeout(() => {
			this.generate()

			// console.log(this.targetGui.folder.id, this.gui.folder.id)
			// console.log(this.targetGui.windowManager?.windows.map(w => w.id))
			// console.log(
			// 	this.targetGui.windowManager?.windows.find(w => w.id === this.targetGui.folder.id),
			// )
			// console.log(this.gui.windowManager?.windows.find(w => w.id === this.gui.folder.id))
		}, 0)
	}

	dispose() {
		this.gui.dispose()
	}

	get vars() {
		return this.targetGui.themer!.theme.value.vars
	}

	generate = () => {
		const MAX_DEPTH = 0
		let currentFolder: Folder = this.gui.folder

		const add = (
			folder: Folder,
			title: string,
			value: string,
			onChange: InputOptions['onChange'],
		) => {
			this._log.fn('add').debug({ title, value, onChange, this: this })

			if (value.match(/^\d+(\.\d+)?$/g)) {
				try {
					const v = parseFloat(value)
					if (!isNaN(v)) {
						const av = Math.abs(v)
						folder
							.addNumber({
								title,
								value: v,
								min: Math.min(0, av),
								max: Math.max(0, av < 1 ? 1 : av * 3),
								step: av < 1 ? 0.01 : av < 10 ? 0.1 : 1,
							})
							.on('change', v => onChange!(v))
						return
					}
				} catch (e) {}
			}

			folder.add({ title, value, onChange })
		}

		const traverse = (
			obj: VariableDefinition[keyof VariableDefinition] | StructuredVars,
			parent: Folder,
			_depth = 0,
		) => {
			_depth++
			for (const [k, v] of entries(obj)) {
				const onChange = (v: any) => {
					if (isColor(v)) {
						v = v.hex8String
					}
					this._log.fn('onChange').debug({
						k,
						v,
						value: `--${this.targetGui.themer!.theme.value.prefix}-${k}`,
						this: this,
					})
					this.targetGui.wrapper.style.setProperty(
						`--${this.targetGui.themer!.theme.value.prefix}-${k}`,
						v,
					)
				}

				if (typeof v === 'string') {
					const vars = [...v.matchAll(CSS_VAR_INNER)].map(m => m[1])

					if (vars.length) {
						add(
							parent,
							k.split('_').at(-1) || k,
							v.replace(CSS_VAR_INNER, (str, match) => {
								return (
									this.targetGui.wrapper.style.getPropertyValue(match).trim() ||
									str
								)
							}),
							onChange,
						)
					} else {
						add(parent, k.split('_').at(-1) || k, v, onChange)
					}
				} else {
					if (currentFolder.title !== k) {
						currentFolder = parent.addFolder({
							title: k,
							closed: _depth > MAX_DEPTH,
						})
					}

					traverse(v, currentFolder, _depth)
				}
			}

			return _depth
		}

		let depth = 1

		const allVars = this.vars

		for (const [title, def] of entries(allVars)) {
			currentFolder = this.gui.folder.addFolder({ title, closed: depth > MAX_DEPTH })

			if (title === 'core' && 'core' in allVars) {
				for (const [mode, vars] of entries(allVars['core'])) {
					currentFolder.addFolder({ title: mode, closed: depth > MAX_DEPTH })
					traverse(restructureVars(vars), currentFolder, depth)
				}
			} else {
				for (const [mode, vars] of entries(def)) {
					traverse(
						vars,
						currentFolder.addFolder({ title: mode, closed: depth > MAX_DEPTH }),
					)
				}
			}
		}

		for (const folder of this.gui.folder.allChildren) {
			// Delete all the empty folders.
			if (!folder.inputs.size && !folder.children.length) {
				folder.dispose()
				continue
			}
		}
	}
}
