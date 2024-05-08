// todo

import { it, expect } from 'vitest'

import { Folder } from './Folder'
// import { Gui } from './Gui'

const folder = new Folder({
	__type: 'FolderOptions',
	closed: false,
	hidden: false,
	title: 'Test Folder',
	gui: null as any,
	container: null as any,
})

it('Folder', () => {
	expect(folder).toBeDefined()
})
