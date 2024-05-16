import type { InputButtonGrid } from './inputs/InputButtonGrid'
import type { InputSelect } from './inputs/InputSelect'
import type { Gui, GuiPreset } from './Gui'
import type { State } from '../utils/state'
import type { Folder } from './Folder'

import { Tooltip } from '../actions/tooltip'
import { RenameSVG } from './svg/RenameSVG'
import { Logger } from '../utils/logger'
import { nanoid } from '../utils/nanoid'
import { SaveSVG } from './svg/SaveSVG'
import { state } from '../utils/state'
import { r } from '../utils/l'

export interface PresetManagerOptions {
	disabled?: boolean
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
	private _manageInput!: InputButtonGrid
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
				this.gui.load(this.activePreset.value)
			})
		}
	}
	opts: PresetManagerOptions

	async init() {
		if (this.opts.disabled) {
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

		// todo - save and restore cursor position?
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
			defaultPreset = this.gui.toJSON(this._defaultPresetTitle, this._defaultPresetId)
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

		/**
		 * Download the active preset as a JSON file.
		 */
		const download = (preset: GuiPreset | GuiPreset[]) => {
			// const preset = this.activePreset.value
			const title = Array.isArray(preset) ? this.gui.folder.title + ' presets' : preset.title
			const blob = new Blob([JSON.stringify(preset, null, 2)], {
				type: 'application/json',
			})
			const url = URL.createObjectURL(blob)
			const a = document.createElement('a')
			a.href = url
			a.download = `${title}.json`
			a.click()
			URL.revokeObjectURL(url)
		}

		console.log()

		this._manageInput = presetsFolder.addButtonGrid({
			title: 'manage',
			value: [
				[
					{
						text: 'update',
						id: 'update',
						tooltip: { text: 'Overwrite active preset', placement: 'top' },
						onClick: () => {
							const { id, title } = this.activePreset.value
							const current = this.gui.toJSON(title, id)
							this.add(current)
						},
						disabled: () => this.defaultPresetIsActive,
					},
					{
						text: 'delete',
						tooltip: { text: 'Delete active preset', placement: 'top' },
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
							this._refresh()
						},
						disabled: () => this.defaultPresetIsActive,
					},
					{
						text: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="fracgui-icon fracgui-icon-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" x2="12" y1="15" y2="3"></line></svg>',
						id: 'download',
						tooltip: { text: 'Download', delay: 250, placement: 'left' },
						style: { maxWidth: '1.5rem', padding: '0.3rem' },
						onClick: () => {
							download(this.activePreset.value)
						},
						disabled: () => this.defaultPresetIsActive,
					},
					{
						text: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" class="fracgui-icon fracgui-icon-download-all"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 14v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 11v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 17v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m7 8 5 5 5-5" /><path  stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 13V1" /></svg>`,
						id: 'download-all',
						tooltip: { text: 'Download All', delay: 250, placement: 'left' },
						style: { maxWidth: '1.5rem', padding: '0.3rem' },
						onClick: () => {
							download(this.presets.value)
						},
						disabled: () => this.presets.value.length <= 1,
					},
				],
			],
			order: 1,
			resettable: false,
			disabled: () => this.defaultPresetIsActive && this.presets.value.length === 1,
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
			disabled: () => this.defaultPresetIsActive && this.presets.value.length === 1,
		})

		this._presetsInput.on('change', ({ value }) => {
			this._log.fn('_presetsInput.on(change)').info({ value, this: this })
			this.gui.load(value)
			this.activePreset.set(value)
			this._refreshInputs()
		})

		this._presetsInput.on('open', () => {
			this._log.fn('_presetsInput.on(open)').info()
			this._presetSnapshot = this.gui.toJSON('__snapshot__')
		})

		this._presetsInput.on('cancel', () => {
			this._log.fn('_presetsInput.on(cancel)').info()
			if (this._presetSnapshot) {
				this.gui.load(this._presetSnapshot)
				this._refreshInputs()
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
					return `Cancel`
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
		this._refreshInputs()

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
	 * Updates a preset if it exists, adds a new preset if not, or creates a new one from the
	 * current state and adds it if none is provided.
	 */
	add(
		/**
		 * The preset to update or add.  If not provided, a new preset is created from the current state.
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

		preset ??= this.gui.toJSON(this._resolveUnusedTitle('preset'), nanoid())

		const existing = this.presets.value.find(p => p.id === preset.id)
		if (!existing) {
			this._log.info('pushing preset:', { preset, existing })
			this.presets.push(preset)
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
	}

	isInitialized(): this is { presets: State<GuiPreset[]>; folder: Folder } {
		return this._initialized
	}

	private _toggleRename = () => {
		if (this._presetsInput.select.elements.selected.getAttribute('contenteditable')) {
			this._handleRename()
		} else {
			this._enableRename()
		}
	}

	/**
	 * When the rename button is active, clicking it to disable triggers a blur event which
	 * disables it immediately before the click event is triggered, re-enabling it.
	 *
	 * The latch and timer prevent that from happening.
	 */
	private _blurLatch = false
	private _blurLatchTimer: ReturnType<typeof setTimeout> | undefined

	/**
	 * Disables the dropdown, making the select's text editable.
	 */
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
		this.folder.evm.listen(el, 'blur', this._handleRename, {}, 'preset-manager-rename')
		this.folder.evm.listen(window, 'keydown', this._handleKeydown, {}, 'preset-manager-rename')
	}

	private _handleRename = (e?: Event) => {
		this._log.fn('_disableRename').info({ e, this: this })

		this._presetsInput.select.disableClicks = false
		this._presetsInput.select.elements.selected.removeAttribute('contenteditable')
		this._renamePresetButton.element.classList.remove('active')

		this.folder.evm.clearGroup('preset-manager-rename')

		if (e?.type === 'blur') {
			// If this is a click event targetting the rename button, trigger the latch.
			this._blurLatch = true
			clearTimeout(this._blurLatchTimer)
			setTimeout(() => {
				this._blurLatch = false
			}, 300)

			// Commit the rename if the title has changed.
			const text = (e.target as HTMLElement)?.textContent ?? ''
			if (text !== this.activePreset.value.title) {
				this._renamePreset(text)
			}
		}
	}

	private _handleKeydown = (e: KeyboardEvent) => {
		this._log.fn('_handleKeydown').info({ key: e.key, e, this: this })

		if (e.key === 'Enter') {
			e.preventDefault()
			this._handleRename()
		}

		if (e.key === 'Escape') {
			this._handleRename()
		}
	}

	private _refreshInputs() {
		const disableRename = this.defaultPresetIsActive
		this._renamePresetButton.element.classList.toggle('disabled', disableRename)
		this._renamePresetButton.element.toggleAttribute('disabled', disableRename)

		this._manageInput.refresh()

		this._log.fn('_refreshInputs').info({ disableRename, this: this })
	}

	/**
	 * Refresh the presets input.
	 */
	private _refresh() {
		this._log.fn('_refresh').info('Refreshing options and setting input.', { this: this })

		this._presetsInput.options = this.presets.value.map(o => ({ label: o.title, value: o }))
		const activePreset = this.activePreset.value
		this._presetsInput.set({ label: activePreset.title, value: activePreset })

		this._refreshInputs()
	}

	dispose() {
		this._initialized = false
		this._presetsInput.dispose()
		this._renamePresetButton.element.tooltip.dispose()
		this._renamePresetButton.element.remove
	}
}
