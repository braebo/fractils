import { getHighlighterCore, type HighlighterCore } from 'shikiji/core'
import { serendipity } from './highlight-serendipity'
import { getWasmInlined } from 'shikiji/wasm'
// import svelte from 'shikiji/langs/svelte.mjs'

let highlighterInstance: HighlighterCore

export async function getHighlighterInstance() {
	if (!highlighterInstance) {
		highlighterInstance = await getHighlighterCore({
			loadWasm: getWasmInlined,
			// Initially load with minimal or no languages/themes
			themes: [serendipity],
			langs: [],
		})
	}
	return highlighterInstance
}
