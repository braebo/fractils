/// <reference types="bun-types" />

import { l as log, dim, bd, i, g, c, p } from '$lib/utils/l'
import { ArgMap } from '$lib/utils/args'

import { Glob } from 'bun'

const start = performance.now()

const args = new ArgMap(Bun.argv.slice(2))

/** Directory containing the SCSS files. */
const INPUT = args.get('input') || './src/lib/css'
/** Whether to print verbose output. */
const VERBOSE = args.get('verbose')
/** Completely silent output. */
const QUIET = args.get('quiet')
const HELP = args.get('help')

const l = VERBOSE ? log : () => {}

if (HELP) {
	l(`
		${bd('generate-css')} ${dim('[-v|--verbose] [-q|--quiet] [-h|--help]')}

		${dim('Options:')}
			${bd(c('-v'), '--verbose')}   ${dim('Print verbose output')}
			${bd(c('-q'), '--quiet')}     ${dim('Print no output')}
			${bd(c('-h'), '--help')}      ${dim('Print this help message')}
	`)
	process.exit(0)
}

// All the `.scss` files in the target directory.
const paths = new Glob(INPUT + '/*.scss').scanSync()

main()

function main() {
	createIndexFile()

	compileCss()

	if (!QUIET) printSuccess()
}

function createIndexFile() {
	l(bd('\n· ') + dim('creating ') + c('index.scss'))

	/** The index.scss barrel file */
	const index_file = Bun.file(INPUT + '/index.scss')
	const writer = index_file.writer()

	writer.write('// Generated with "pnpm generate:css"\n\n')

	for (const file of paths) {
		const name = file.split('/').pop()
		if (name && name !== 'index.scss') {
			writer.write(`@import '${name.replace('.scss', '')}';\n`)
		}
	}

	writer.flush()
	writer.end()
}

function compileCss() {
	l(bd('\n· ') + p('sass ') + dim('cli'))

	for (const file of paths) {
		l(dim(file), dim('-->'), file.replace('.scss', '.css'))

		Bun.spawn(['sass', file, file.replace('.scss', '.css')])
	}
}

function printSuccess() {
	const end = performance.now()
	const time = (end - start).toFixed(2)
	console.log(g('\n✓ ') + dim('generate') + ':' + c('css'), i(dim(time + 's')))
}
