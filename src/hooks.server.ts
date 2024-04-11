import type { Handle } from '@sveltejs/kit'

import { parse } from 'cookie'

export const handle: Handle = async ({ event, resolve }) => {
	const cookies = parse(event.request.headers?.get('cookie') || '')
	event.locals.theme = <'dark' | 'light' | 'system'>cookies['fractils::theme'] || 'dark'

	let page = ''
	return await resolve(event, {
		transformPageChunk: ({ html, done }) => {
			page += html
			if (done) {
				return html.replace('%fractils:theme%', event.locals.theme)
			}
		},
	})
}
