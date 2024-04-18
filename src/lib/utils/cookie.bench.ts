import { parse as parseOg } from 'cookie'
import { describe, bench } from 'vitest'
import { parse } from './cookie'

const cookieStr = 'foo=bar;baz=qux;cookie=delicious'

describe('cookie', () => {
	bench('parseOg', () => {
		parseOg(cookieStr)
	})

	bench('parse', () => {
		parse(cookieStr)
	})
})