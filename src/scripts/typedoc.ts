// import { Extractor, ExtractorConfig, ExtractorResult } from '@microsoft/api-extractor'
// import { fileURLToPath } from 'bun'

// const apiExtractorJsonPath: string = fileURLToPath(
// 	new URL('../../api-extractor.json', import.meta.url),
// )

// // Load and parse the api-extractor.json file
// const extractorConfig: ExtractorConfig = ExtractorConfig.loadFileAndPrepare(apiExtractorJsonPath)

// // Invoke API Extractor
// const extractorResult: ExtractorResult = Extractor.invoke(extractorConfig, {
// 	// Equivalent to the "--local" command-line parameter
// 	localBuild: true,

// 	// Equivalent to the "--verbose" command-line parameter
// 	showVerboseMessages: true,

// 	showDiagnostics: true,
// })

// if (extractorResult.succeeded) {
// 	console.log(`API Extractor completed successfully`)
// 	process.exitCode = 0
// } else {
// 	console.error(
// 		`API Extractor completed with ${extractorResult.errorCount} errors` +
// 			` and ${extractorResult.warningCount} warnings`,
// 	)
// 	process.exitCode = 1
// }

import TypeDoc from 'typedoc'

async function main() {
	// Application.bootstrap also exists, which will not load plugins
	// Also accepts an array of option readers if you want to disable
	// TypeDoc's tsconfig.json/package.json/typedoc.json option readers
	const app = await TypeDoc.Application.bootstrapWithPlugins({
		entryPoints: ['src/lib/index.ts'],
		validation: false,
	})

	const project = await app.convert()

	if (project) {
		// Project may not have converted correctly
		const outputDir = 'docs/typedoc'

		// Rendered docs
		await app.generateDocs(project, outputDir)
		// Alternatively generate JSON output
		await app.generateJson(project, outputDir + '/json')
	}
}

main().catch(console.error)
