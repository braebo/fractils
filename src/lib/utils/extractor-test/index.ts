import { l, n, r } from '$lib/utils/l.js'
import { Extractor } from '$lib/utils/Extractor'

// const folders = ['../../actions', '../../components', '../../stores', '../../theme', '../../utils']
// const comments = await Extractor.scanFolders(folders, true)
// console.log(comments)

const files = [
	'./example.ts',
	// '../../actions/visibility.ts',
]

for (const file of files) {
	const info = await Extractor.scanFile(file, true)

	for (const comment of info.comments) {
		n()
		l('-'.repeat(80))
		Extractor.logComment(comment)
		l('-'.repeat(80))
		n()
	}
}

l(r('eof'))
