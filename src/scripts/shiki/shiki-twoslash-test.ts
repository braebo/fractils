// Doesn't work because after reading 100 pages of github issues / readmes / docs / codebases, there is no
// mention of how to add a language from the giant list of languages so the thing just goes " ¯\_(ツ)_/¯ "

// import type { HighlighterOptions } from 'shiki/dist';

import {
	renderCodeToHTML,
	runTwoSlash,
	createShikiHighlighter,
	// type TwoslashShikiOptions,
	// type UserConfigSettings,
} from 'shiki-twoslash';
// import svelte from '../static/shiki/svelte.tmLanguage.json';
import { writeFileSync } from 'fs';

const highlighter = await createShikiHighlighter({
	theme: 'dracula-soft',
	langs: ['svelte'],
});

const code = `
<script>
    import { OnMount } from 'fractils'

	/**
 	 * Whether willows cool or how many bitches she got.
 	 * @param x - git rect -m "kek"
 	 */
	const x = (true || Infinity) as const
	let y = x

	$: z = () => {}
<\/script>

<OnMount>
    <div in:fly={{ x: 100, duration: 1000 }}>
        My intro transition will always play!
    </div>
</OnMount>

<!-- imagne -->

<div on:click={() => { console.log(yike) }} />

<div {obama} />

{#if urnan === 'cringe'}
	<div ok={buddy} {man} />
	<div president={obama ? 'black' : 'white'} />
{/if}

<style>
	.urnan {
		color: booty;
	}
</style>
    `;

const twoslash = runTwoSlash(code, 'svelte', {
	theme: 'dark-plus',
	langs: ['svelte'],
});
const html = renderCodeToHTML(
	twoslash.code,
	'svelte',
	{ twoslash: true },
	{
		themeName: 'dark-plus',
		theme: 'dark-plus',
		langs: ['svelte'],
	},
	highlighter,
	twoslash,
);

writeFileSync('shiki-output.html', html, 'utf8');
