export const code = {
	typescript: `
import { writable } from 'svelte/store'
export const count = writable(0)
`,
	svelte: String(`
<script>
import { count } from './store.js'
<\/script>

<button on:click={() => $count += 1}>count: {$count}</button>
`),
}
