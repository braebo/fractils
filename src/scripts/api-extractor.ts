import { Extractor, ExtractorConfig, ExtractorResult } from '@microsoft/api-extractor'
import { fileURLToPath } from 'bun'

const apiExtractorJsonPath: string = fileURLToPath(
	new URL('../../api-extractor.json', import.meta.url),
)

// Load and parse the api-extractor.json file
const extractorConfig: ExtractorConfig = ExtractorConfig.loadFileAndPrepare(apiExtractorJsonPath)

// Invoke API Extractor
const extractorResult: ExtractorResult = Extractor.invoke(extractorConfig, {
	// Equivalent to the "--local" command-line parameter
	localBuild: true,

	// Equivalent to the "--verbose" command-line parameter
	showVerboseMessages: true,

	showDiagnostics: true,
})

if (extractorResult.succeeded) {
	console.log(`API Extractor completed successfully`)
	process.exitCode = 0
} else {
	console.error(
		`API Extractor completed with ${extractorResult.errorCount} errors` +
			` and ${extractorResult.warningCount} warnings`,
	)
	process.exitCode = 1
}
