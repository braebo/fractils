import { localStorageStore } from '../../utils/localStorageStore'

export const inspectorStore = localStorageStore<Record<string, boolean>>('inspector', {})
