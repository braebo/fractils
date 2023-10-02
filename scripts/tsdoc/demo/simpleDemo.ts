// import colors from 'colors';
import { TSDocParser, ParserContext, DocComment } from '@microsoft/tsdoc';
import { Formatter } from '../Formatter';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import c from 'chalk';

/**
 * The simple demo does not rely on the TypeScript compiler API; instead, it parses the
 * source file directly.  It uses the default parser configuration.
 */
export function simpleDemo(): void {
	console.log(c.yellow('*** TSDoc API demo: Simple Scenario ***') + os.EOL);

	const inputFilename: string = path.resolve(
		path.join(__dirname, '..', 'input', 'simple-input.ts'),
	);
	console.log('Reading input/simple-input.ts...');

	const inputBuffer: string = fs.readFileSync(inputFilename).toString();

	// NOTE: Optionally, can provide a TSDocConfiguration here
	const tsdocParser: TSDocParser = new TSDocParser();
	const parserContext: ParserContext = tsdocParser.parseString(inputBuffer);

	console.log(os.EOL + c.green('Input Buffer:') + os.EOL);
	console.log(c.gray('<<<<<<'));
	console.log(inputBuffer);
	console.log(c.gray('>>>>>>'));

	console.log(os.EOL + c.green('Extracted Lines:') + os.EOL);
	console.log(
		JSON.stringify(
			parserContext.lines.map((x) => x.toString()),
			undefined,
			'  ',
		),
	);

	console.log(os.EOL + c.green('Parser Log Messages:') + os.EOL);

	if (parserContext.log.messages.length === 0) {
		console.log('No errors or warnings.');
	} else {
		for (const message of parserContext.log.messages) {
			console.log(inputFilename + message.toString());
		}
	}

	console.log(os.EOL + c.green('DocComment parts:') + os.EOL);

	const docComment: DocComment = parserContext.docComment;

	console.log(
		c.cyan('Summary: ') + JSON.stringify(Formatter.renderDocNode(docComment.summarySection)),
	);

	if (docComment.remarksBlock) {
		console.log(
			c.cyan('Remarks: ') +
				JSON.stringify(Formatter.renderDocNode(docComment.remarksBlock.content)),
		);
	}

	for (const paramBlock of docComment.params.blocks) {
		console.log(
			c.cyan(`Parameter "${paramBlock.parameterName}": `) +
				JSON.stringify(Formatter.renderDocNode(paramBlock.content)),
		);
	}

	if (docComment.returnsBlock) {
		console.log(
			c.cyan('Returns: ') +
				JSON.stringify(Formatter.renderDocNode(docComment.returnsBlock.content)),
		);
	}

	console.log(
		c.cyan('Modifiers: ') + docComment.modifierTagSet.nodes.map((x) => x.tagName).join(', '),
	);
}

simpleDemo();
