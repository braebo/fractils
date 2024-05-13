import type { InputSelect } from './inputs/InputSelect'
import type { Gui, GuiPreset } from './Gui'
import type { State } from '../utils/state'
import type { Folder } from './Folder'

import { code } from '../../routes/demo/gui/demoGui'
import { stringify } from '../utils/stringify'
import { Tooltip } from '../actions/tooltip'
import { RenameSVG } from './svg/RenameSVG'
import { debrief } from '../utils/debrief'
import { Logger } from '../utils/logger'
import { nanoid } from '../utils/nanoid'
import { SaveSVG } from './svg/SaveSVG'
import { state } from '../utils/state'
import { r } from '../utils/l'

export interface PresetManagerOptions {
	disable?: boolean
	/**
	 * Optionsal existing presets.
	 * @default []
	 */
	presets?: GuiPreset[]

	/**
	 * The default preset to use.
	 * @default undefined
	 */
	defaultPreset?: GuiPreset

	/**
	 * The key to use for storage.  If not provided, storage is disabled.
	 * @default undefined
	 */
	storageKey?: string
	autoInit?: boolean
}

export class PresetManager {
	defaultPreset!: GuiPreset
	activePreset: State<GuiPreset>
	presets!: State<GuiPreset[]>
	folder!: Folder

	private _defaultPresetId = 'fracgui-default-preset'
	private _defaultPresetTitle = 'default'

	private _presetSnapshot?: GuiPreset

	private _presetsInput!: InputSelect<GuiPreset>
	private _renamePresetButton!: RenameSVG

	private _initialized = false
	private _log: Logger

	constructor(
		public gui: Gui,
		public parentFolder: Folder,
		options: PresetManagerOptions,
	) {
		this._log = new Logger(`PresetManager ${gui.folder.title}`, { fg: 'slateblue' })
		this._log.fn('constructor').info({ options, this: this })

		this.opts = Object.freeze(options)

		this.activePreset = state(this.opts.defaultPreset ?? ({} as GuiPreset), {
			key: this.opts.storageKey + '::active',
		})

		this.presets = state(this.opts.presets ?? [], {
			key: this.opts.storageKey,
		})

		if (this.opts.autoInit !== false) {
			this.init()
		}

		if (this.activePreset.value.id !== this._defaultPresetId) {
			Promise.resolve().then(() => {
				console.warn(this.activePreset.value)
				this.gui.load(this.activePreset.value)
			})
		}
	}
	opts: PresetManagerOptions

	async init() {
		if (this.opts.disable) {
			this._log.debug('Aborting initialization: disabled by options.')
			return
		}
		this._initialized = true

		this.folder = await this.addGui(this.parentFolder, this.opts.defaultPreset)

		return this
	}

	/**
	 * Set the active preset.
	 */
	set(value: GuiPreset) {
		this._log.fn('set').info({ value, this: this })
		this.activePreset.set(value)
		// this._refresh()
	}

	private _renamePreset(title: string) {
		this._log.fn('_renamePreset').info({ this: this, title })

		if (!this.isInitialized()) throw new Error('PresetManager not initialized.')

		const active = this.activePreset.value

		this.presets.update(presets => {
			if (!active) throw new Error('No preset found.')

			if (active.id === this._defaultPresetId) {
				throw new Error('Cannot rename default preset.')
			}

			active.title = title
			this.activePreset.set(active)
			// presets.set(this.activePreset.value.presetId, preset)
			// presets = presets.map(p => (p.id === active.id ? active : p))
			// return presets

			return presets.map(p => (p.id === active.id ? active : p))
		})

		// this._presetsInput?.refresh()
		this._refresh()
	}

	private _resolveUnusedTitle(title: string) {
		this._log.fn('resolveUnusedTitle').info({ this: this, title })
		if (!this.isInitialized()) throw new Error('PresetManager not initialized.')

		const presets = this.presets.value
		let i = 0
		let newTitle = title

		while (presets.some(p => p.title === newTitle)) {
			i++
			newTitle = title + ` (${i})`
		}

		return newTitle
	}

	private _resolveDefaultPreset(defaultPreset?: GuiPreset) {
		if (!this.isInitialized()) throw new Error('PresetManager not initialized.')

		defaultPreset ??= this.presets.value.find(p => p.id === this._defaultPresetId)
		if (!defaultPreset) {
			defaultPreset = this.gui.save(this._defaultPresetTitle, this._defaultPresetId)
			this.presets.push(defaultPreset)
		}

		return defaultPreset
	}

	async addGui(parentFolder: Folder, defaultPreset?: GuiPreset) {
		this._log.fn('add').info({ this: this, parentFolder, defaultPreset })

		if (!this.isInitialized()) throw new Error('PresetManager not initialized.')

		await Promise.resolve()

		const presetsFolder = parentFolder.addFolder({
			title: 'presets',
			//! closed: true,
			closed: false,
			hidden: true,
			children: [],
		})

		this.defaultPreset = defaultPreset ?? this._resolveDefaultPreset()

		if (!Object.keys(this.activePreset.value).length) {
			this.activePreset.set(this.defaultPreset)
		}

		if (!this.activePreset.value) {
			throw new Error('No active preset.')
		}
		if (!this.activePreset.value.id) {
			throw new Error('No active preset id.')
		}

		//! remove me
		this.activePreset.subscribe(v => {
			code.set(
				stringify(
					{
						presets: this.presets.value.length,
						activePreset: {
							...v,
							data: debrief(v.data, { siblings: 7, depth: 4 }),
						},
					},
					2,
				).replaceAll('"', ''),
			)
		})

		/**
		 * Download the active preset as a JSON file.
		 */
		const downloadActivePreset = () => {
			const preset = this.activePreset.value
			const blob = new Blob([JSON.stringify(preset, null, 2)], {
				type: 'application/json',
			})
			const url = URL.createObjectURL(blob)
			const a = document.createElement('a')
			a.href = url
			a.download = `${preset.title}.json`
			a.click()
			URL.revokeObjectURL(url)
		}

		presetsFolder.addButtonGrid({
			title: 'manage',
			value: [
				[
					{
						label: 'update',
						tooltip: { text: 'Overwrite active preset' },
					},
					{
						label: 'delete',
						tooltip: { text: 'Delete active preset' },
						onClick: () => {
							let index = undefined as number | undefined
							this.presets.update(presets => {
								index = presets.findIndex(p => p.id === this.activePreset.value.id)
								presets.splice(index, 1)
								return presets
							})
							this.activePreset.set(
								this.presets.value[index ?? 0] ?? this.defaultPreset,
							)
						},
					},
					{
						label: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" x2="12" y1="15" y2="3"></line></svg>',
						tooltip: { text: 'Download preset', delay: 250 },
						style: { maxWidth: '1.5rem', padding: '0.3rem' },
						onClick: () => {
							downloadActivePreset()
						},
					},
				],
			],
			order: 1,
		})

		//? Presets Select Input
		this._presetsInput = presetsFolder.addSelect({
			__type: 'SelectInputOptions',
			title: 'presets',
			options: this.presets.value,
			labelKey: 'title',
			order: -1,
			value: this.activePreset.value,
			resettable: false,
		})
		this._presetsInput.on('change', ({ value }) => {
			this._log.fn('_presetsInput.on(change)').info({ value, this: this })
			this.gui.load(value)
			this.activePreset.set(value)
			this._refreshRename()
		})
		this._presetsInput.on('open', () => {
			this._log.fn('_presetsInput.on(open)').info()
			this._presetSnapshot = this.gui.save('__snapshot__')
		})
		this._presetsInput.on('cancel', () => {
			this._log.fn('_presetsInput.on(cancel)').info()
			if (this._presetSnapshot) {
				this.gui.load(this._presetSnapshot)
				this._refreshRename()
			}
		})

		//? New Preset Button
		const newPresetButton = new SaveSVG()
		this._presetsInput.listen(newPresetButton.element, 'click', () => {
			this._log.fn('newPresetButton.on(click)').info()
			this.add()
		})

		//? Rename Preset Button
		this._renamePresetButton = new RenameSVG()
		this._renamePresetButton.element.tooltip = new Tooltip(this._renamePresetButton.element, {
			delay: 1000,
			placement: 'left',
			text: () => {
				if (this._renamePresetButton.element.classList.contains('active')) {
					return `Disable renaming`
				} else {
					return this.defaultPresetIsActive
						? `Can't rename default preset`
						: `Rename ${this.activePreset.value.title}`
				}
			},
		})
		this._presetsInput.listen(this._renamePresetButton.element, 'click', this._toggleRename)

		this._presetsInput.elements.content.prepend(this._renamePresetButton.element)
		this._presetsInput.elements.content.prepend(newPresetButton.element)

		// Refresh the disabled state.
		this._refreshRename()

		//#endregion

		return presetsFolder
	}

	get defaultPresetIsActive() {
		return this.activePreset.value.id === this._defaultPresetId
	}

	/**
	 * Delete a preset.
	 */
	deletePreset(preset: GuiPreset | GuiPreset['id']) {
		this._log.fn('deletePreset').info({ this: this, preset })

		if (!this.isInitialized()) {
			throw new Error('PresetManager not initialized.')
		}

		const id = typeof preset === 'string' ? preset : preset.id
		this.presets.update(presets => {
			const index = presets.findIndex(p => p.id === id)

			if (index === -1) {
				throw new Error(r('Error deleting preset:') + ' Preset not found.')
			}

			presets.splice(index, 1)
			return presets
		})

		this.activePreset.set(this.presets.value[0] ?? this.defaultPreset)
	}

	/**
	 * Add a new preset, or create a new one from the current state and add it.
	 */
	add(
		/**
		 * The preset to add.  If not provided, a new preset is created from the current state.
		 */
		preset?: GuiPreset,
	) {
		this._log.fn('saveNewPreset')

		if (!this.isInitialized()) {
			throw new Error('PresetManager not initialized.')
		}

		if (!this._presetsInput) {
			throw new Error('No select input.')
		}

		// if (!this._titleInput) {
		// 	throw new Error('No title input.')
		// }

		preset ??= this.gui.save(this._resolveUnusedTitle('preset'), nanoid())

		const existing = this.presets.value.find(p => p.id === preset.id)
		if (!existing) {
			this._log.info('pushing preset:', { preset, existing })
			this.presets.push(preset)
			// console
		} else {
			this._log.info('preset exists. replacing with:', { preset, existing })
			this.presets.update(presets => {
				const index = presets.findIndex(p => p.id === preset.id)
				presets[index] = preset
				return presets
			})
		}

		this.set(preset)
		this._refresh()

		// this._titleInput.bubble = false
		// this._titleInput.set(preset.title)
		// console.error('bubble:', this._titleInput.bubble)

		// this.selectInput.options = this.presets.value
		// this.selectInput.refresh()
		// this.selectInput.set({ label: preset.title!, value: preset })

		// this.activePresetId = state(preset.id)

		// this.titleInput.set(preset.title)
	}

	isInitialized(): this is { presets: State<GuiPreset[]>; folder: Folder } {
		return this._initialized
	}

	private _toggleRename = () => {
		if (this._presetsInput.select.elements.selected.getAttribute('contenteditable')) {
			this._disableRename()
		} else {
			this._enableRename()
		}
	}

	private _blurLatch = false
	private _blurLatchTimer: ReturnType<typeof setTimeout> | undefined

	private _enableRename = () => {
		this._log.fn('_enableRename').info({ this: this })

		const el = this._presetsInput.select.elements.selected

		if (el.classList.contains('disabled')) {
			this._log.warn('Cannot rename default preset.')
			return
		}

		if (this._blurLatch) {
			this._blurLatch = false
			clearTimeout(this._blurLatchTimer)
			return
		}

		this._renamePresetButton.element.classList.add('active')
		this._presetsInput.select.disableClicks = true
		el.setAttribute('contenteditable', 'true')
		el.focus()

		// Move the cursor to the end of the text
		const range = document.createRange()
		range.selectNodeContents(el)
		range.collapse(false)

		const sel = window.getSelection()
		sel?.removeAllRanges()
		sel?.addRange(range)

		// Handle rename / cancel.
		el.addEventListener('blur', this._disableRename)
		addEventListener('keydown', this._handleRename)
	}

	private _disableRename = (e?: Event) => {
		this._log.fn('_disableRename').info({ this: this })

		if (e?.type === 'blur') {
			this._blurLatch = true
			clearTimeout(this._blurLatchTimer)
			setTimeout(() => {
				this._blurLatch = false
			}, 300)
		}

		if ((e?.target as HTMLElement)?.classList.contains(this._renamePresetButton.class)) return
		const el = this._presetsInput.select.elements.selected

		this._presetsInput.select.disableClicks = false
		el.removeAttribute('contenteditable')

		el.removeEventListener('blur', this._disableRename)
		removeEventListener('keydown', this._handleRename)

		this._renamePresetButton.element.classList.remove('active')
	}

	private _handleRename = (e: KeyboardEvent) => {
		this._log.fn('_handleRename').info({ key: e.key, e, this: this })
		if (e.key === 'Escape') {
			this._disableRename()
			return
		}

		setTimeout(() => {
			const text = (e.target as HTMLElement)?.textContent ?? ''
			if (text === this.activePreset.value.title) return
			// console.log({ text })
			this._renamePreset(text)
		}, 0)
	}

	private _refreshRename() {
		const disable = this.defaultPresetIsActive
		this._renamePresetButton.element.classList.toggle('disabled', disable)
		disable ? this._presetsInput.select.disable() : this._presetsInput.select.enable()

		this._log.fn('_refreshRename').info({ disable, this: this })
	}

	/**
	 * Refresh the presets input.
	 */
	private _refresh() {
		this._log.fn('_refresh').info('Refreshing options and setting input.', { this: this })

		this._presetsInput.options = this.presets.value.map(o => ({ label: o.title, value: o }))
		const activePreset = this.activePreset.value
		this._presetsInput.set({ label: activePreset.title, value: activePreset })

		this._refreshRename()
	}

	dispose() {
		this._initialized = false
		this._presetsInput.dispose()
		// this._titleInput.dispose()
		this._renamePresetButton.element.tooltip.dispose()
		this._renamePresetButton.element.remove
	}
}
