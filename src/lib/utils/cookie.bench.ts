import { parse as parseOg } from 'cookie'
import { parse } from './cookie'
import { start } from './time'

const iterations = 1_000_000

function benchmark(func: (str: string) => Record<string, string>, input: string, msg: string) {
	const end = start(msg, { decimals: 2 })
	for (let i = 0; i < iterations; i++) {
		func(input)
	}
	end()
}

const cookieStr = 'foo=bar;baz=qux;cookie=delicious'

benchmark(parseOg, cookieStr, 'parseOg')
benchmark(parse, cookieStr, 'parse')
