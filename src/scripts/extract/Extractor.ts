import { DocNode, DocExcerpt, DocComment, TSDocParser } from '@microsoft/tsdoc'
import { l as log, n as nl, b, bd, dim, g, r, y } from '$lib/utils/l'
import { TSDocConfigFile } from '@microsoft/tsdoc-config'
import * as tsdoc from '@microsoft/tsdoc'
import { start } from '$lib/utils/time'
import { svelte2tsx } from 'svelte2tsx'
import ts from 'typescript'
import chalk from 'chalk'
import os from 'os'

/**
 * A parsed file's tsdoc comment information.
 */
export interface ParsedFile {
	/**
	 * Path to the file containing the source code.
	 */
	file: string

	/**
	 * Whether the comment belongs to a js/ts variable
	 * declaration or a svelte component.
	 */
	type: 'ts' | 'svelte'

	/**
	 * All variable declaration doc comments found.
	 */
	comments: Comment[]
}

/**
 * A parsed variable declaration's tsdoc comment information.
 */
export interface Comment {
	/**
	 * Name of the variable the comment belongs to.
	 */
	name: string
	/**
	 * Path to the file containing the source code.
	 */
	file: string
	summary?: string
	remarks?: string
	params?: { name: string; description: string }[]
	typeParams?: { name: string; description: string }[]
	returns?: string
	seeBlocks?: string[]
	customBlocks?: { tagName: string; content: string }[]
	defaultValue?: string
	noteBlocks?: string[]
	exampleBlocks?: string[]
	/**
	 * The raw tsdoc comment.
	 */
	raw: string
}

/**
 * Information for a found variable declaration.  Most importantly,
 * the `textRange` is captured from the compiler's AST, and used to
 * parse the comment in the source file into a {@link DocComment}
 * for further processing, ultimately parsed into a {@link Comment}.
 */
interface FoundComment {
	/** The name of the variable the comment belongs to. */
	name: string
	/** The declaration node the comment belongs to. */
	compilerNode: ts.Node
	/** The start and end positions of the comment in the source file. */
	textRange: tsdoc.TextRange
	/** The {@link ts.SyntaxKind} of declaration node the comment belongs to. */
	kind: string
}

/**
 * Extracts tsdoc comment information from files or folders in
 * the form of {@link Comment} objects.
 */
export class Extractor {
	static comments: Comment[] = []

	static scanFiles(paths: string[], verbose = false) {
		const l = verbose ? log : () => {}
		const end = verbose ? start('scanFiles') : () => {}

		const compilerOptions: ts.CompilerOptions = {
			target: ts.ScriptTarget.Latest,
			module: ts.ModuleKind.ESNext,
			moduleResolution: ts.ModuleResolutionKind.Bundler,
		}

		// todo - svelte shims introduce more errors than they remove.
		// // svelte shims
		// if (paths.some((p) => p.endsWith('.svelte') || p.endsWith('.svelte.ts'))) {
		// 	l(dim('\nadding svelte shims\n'))
		// 	// paths.push(require.resolve('svelte2tsx/svelte-jsx.d.ts'))
		// 	paths.push(require.resolve('svelte2tsx/svelte-shims.d.ts'))
		// }

		const program: ts.Program = ts.createProgram(paths, compilerOptions)

		// if (verbose) this.#reportCompilerErrors(program)
		this.#reportCompilerErrors(program, verbose)

		const comments: ParsedFile[] = []

		for (const path of paths) {
			const sourceFile = program.getSourceFile(path)

			if (!sourceFile) {
				l(r('Error retrieving source file: ') + paths)
				throw new Error('Error retrieving source file')
			}

			const foundComments: FoundComment[] = []

			this.#walkCompilerAstAndFindComments(sourceFile, '', foundComments)

			if (!foundComments.length) {
				l(y('No comments found in file: ') + dim(path))
				continue
			}

			comments.push({
				file: path.replace('.svelte.ts', '.svelte'),
				type: path.match(/\.svelte(\.ts)?$/) ? 'svelte' : 'ts',
				comments: foundComments
					.map((c) => Extractor.#parseTSDoc(c))
					.map((c) => Extractor.parseComment(path, c.name, c.docComment)),
			})
		}

		end()
		return comments
	}

	/**
	 * Compiles svelte to typescript with `svelte2tsx`.
	 * @param svelte The svelte source code to compile.
	 * @param filename The name of the file containing the source code.
	 * @returns The compiled ts.
	 */
	static compileSvelte(svelte: string, filename: string) {
		return svelte2tsx(svelte, {
			filename,
			isTsFile: true,
		})
	}

	/**
	 * Pretty prints a {@link Comment} to the console.
	 */
	static logComment(comment: Comment) {
		const pink = chalk.hex('#eaa')
		const lightGreen = chalk.hex('#aea')
		const l = log
		const n = nl
		const star = dim('  *')
		let first = false
		const maybeStar = () => (first ? (first = false) : l(star))

		n()
		l(bd(comment.name))
		l(dim(' /**'))

		if (comment.summary) {
			lc(lightGreen(format(comment.summary)))
		}
		if (comment.params?.length) {
			maybeStar()
			comment.params.forEach((p) => lc(pink('@param'), p.name, p.description))
		}
		if (comment.typeParams?.length) {
			maybeStar()
			comment.typeParams.forEach((p) => lc(pink('typeParam:'), p.name, p.description))
		}
		if (comment.returns) {
			maybeStar()
			lc(pink('returns:'), comment.returns)
		}
		if (comment.defaultValue) {
			maybeStar()
			lc(pink('@default'), comment.defaultValue)
		}
		if (comment.remarks) {
			maybeStar()
			lc(pink('remarks:'), comment.remarks)
		}

		l(dim('  */'))

		/**
		 *  Logs a {@link Comment} in tsdoc-style, ensuring each line starts with a spaced *
		 */
		function lc(...args: any[]) {
			// we use 1 because 0 is the colored tagname
			let str = args[1]

			if (typeof str === 'string') {
				// Replace newlines with newlines and a spaced *
				l(star, args[0], format(str))
			} else {
				l(star, ...args)
			}
		}

		function format(str: string) {
			return str.replace(/\n/g, `\n${star} `)
		}
	}

	// static #tsdocParser = new TSDocParser()
	static #tsdocParser = Extractor.#createParser()

	static #createParser() {
		// Load the nearest config file, for example `my-project/tsdoc.json`
		const tsdocConfigFile = TSDocConfigFile.loadForFolder(__dirname)
		if (tsdocConfigFile.hasErrors) {
			// Report any errors
			console.log(tsdocConfigFile.getErrorSummary())
		}

		// Use the TSDocConfigFile to configure the parser
		const tsdocConfiguration = new tsdoc.TSDocConfiguration()
		tsdocConfigFile.configureParser(tsdocConfiguration)
		return new TSDocParser(tsdocConfiguration)
	}

	/**
	 * Parses a {@link FoundComment} into a docComment.
	 */
	static #parseTSDoc(foundComment: FoundComment) {
		const parserContext = this.#tsdocParser.parseRange(foundComment.textRange)

		const name = foundComment.name
		const docComment = parserContext.docComment

		return { name, docComment } as const
	}

	static renderDocNode(docNode: DocNode): string {
		let result: string = ''
		if (docNode) {
			if (docNode instanceof DocExcerpt) {
				result += docNode.content.toString()
			}
			for (const childNode of docNode.getChildNodes()) {
				result += Extractor.renderDocNode(childNode)
			}
		}
		return result
	}

	/**
	 * Get's the name of a variable from a {@link VariableDeclaration} node.
	 */
	static #getIdentifierName(node: ts.Node): string {
		const tree = [ts.SyntaxKind[node.kind]]

		let name: string | undefined = undefined

		node.forEachChild(visit)

		function visit(n: ts.Node) {
			if (name) return
			tree.push(ts.SyntaxKind[n.kind])
			if (['Identifier', 'StringLiteral'].includes(ts.SyntaxKind[n.kind])) {
				name ??= n.getText()
			}
			n.forEachChild(visit)
		}

		if (!name) {
			console.error('Failed to find identifier name.')
			console.error(tree)
			throw new Error('Failed to find identifier name.')
		}

		return name
	}

	/**
	 * Parses a {@link DocComment} into a {@link Comment}.
	 * @param file The path to the file containing the comment.
	 * @param name The name of the variable associated with the comment.
	 * @param comment The {@link DocComment} to parse.
	 */
	static parseComment(file: string, name: string, comment: DocComment): Comment {
		const found: Partial<Comment> = {
			name: name.replace('__SvelteComponent_', ''),
			file: file.replace('.svelte.ts', '.svelte'),
			raw: comment.emitAsTsdoc(),
		}

		if (comment.summarySection) {
			found.summary = Extractor.renderDocNode(comment.summarySection)?.trim()
		}

		if (comment.params.blocks.length) {
			found.params = comment.params.blocks.map((b) => {
				return {
					name: b.parameterName,
					description: Extractor.renderDocNode(b.content)?.trim(),
				}
			})
		}

		if (comment.typeParams.blocks.length) {
			found.typeParams = comment.typeParams.blocks.map((b) => {
				return {
					name: b.parameterName,
					description: Extractor.renderDocNode(b.content)?.trim(),
				}
			})
		}

		if (comment.returnsBlock) {
			found.returns = Extractor.renderDocNode(comment.returnsBlock.content)?.trim()
		}

		if (comment.remarksBlock) {
			found.remarks = Extractor.renderDocNode(comment.remarksBlock.content)?.trim()
		}

		if (comment.seeBlocks.length) {
			found.seeBlocks = comment.seeBlocks.map(
				(b) => Extractor.renderDocNode(b.content)?.trim(),
			)
		}

		if (comment.customBlocks.length) {
			const defaultValue = comment.customBlocks
				.filter((b) => b.blockTag.tagName.match(/@default(Value)?/))
				.map((b) => Extractor.renderDocNode(b.content).trim())?.[0]

			if (defaultValue) found.defaultValue = defaultValue

			const noteBlocks = comment.customBlocks
				.filter((b) => b.blockTag.tagName === '@note')
				.map((b) => Extractor.renderDocNode(b.content).trim())

			if (noteBlocks.length) found.noteBlocks = noteBlocks

			const exampleBlocks = comment.customBlocks
				.filter((b) => b.blockTag.tagName === '@example')
				.map((b) => Extractor.renderDocNode(b.content)?.trim())

			if (exampleBlocks.length) found.exampleBlocks = exampleBlocks

			const unusedBlocks = comment.customBlocks
				.filter(
					(b) =>
						!['@default', '@defaultValue', '@note', '@example'].includes(
							b.blockTag.tagName,
						),
				)
				.map((b) => {
					return {
						tagName: b.blockTag.tagName,
						content: Extractor.renderDocNode(b.content).trim(),
					}
				})

			if (unusedBlocks.length) {
				found.customBlocks = unusedBlocks

				console.warn(y('Unused custom blocks found:'))
				unusedBlocks.forEach((b) => {
					console.log(b.tagName, b.content)
				})
			}
		}

		return found as Comment
	}

	/**
	 * Pretty prints a {@link DocNode} tree to the console.
	 */
	static logTSDocTree(docNode: tsdoc.DocNode, outputLines: string[] = [], indent: string = '') {
		let dumpText: string = ''
		if (docNode instanceof tsdoc.DocExcerpt) {
			const content: string = docNode.content.toString()
			dumpText += dim(`${indent}* ${docNode.excerptKind}: `) + b(JSON.stringify(content))
		} else {
			dumpText += `${indent}- ${docNode.kind}`
		}
		outputLines.push(dumpText)

		for (const child of docNode.getChildNodes()) {
			this.logTSDocTree(child, outputLines, indent + '  ')
		}

		return outputLines
	}

	/**
	 * Recursively walks the compiler AST, looking for comments
	 * associated with variable declarations.
	 * @returns An array of {@link FoundComment} objects.
	 */
	static #walkCompilerAstAndFindComments(
		node: ts.Node,
		indent: string,
		foundComments: FoundComment[],
		tree: string[] = [],
	): void {
		try {
			// Skip node_modules
			// if (node.getSourceFile().fileName.includes('node_modules')) return

			const buffer: string = node.getSourceFile().getFullText() // Don't use getText() here!

			// Only consider nodes that are part of a declaration form.  Without this, we could discover
			// the same comment twice (e.g. for a MethodDeclaration and its PublicKeyword).
			if (this.#isDeclarationKind(node.kind)) {
				tree.push(indent + ts.SyntaxKind[node.kind])
				// Find "/** */" style comments associated with this node.
				// Note that this reinvokes the compiler's scanner -- the result is not cached.
				const comments: ts.CommentRange[] = this.#getJSDocCommentRanges(node, buffer)

				if (comments.length > 0) {
					for (const comment of comments) {
						foundComments.push({
							name: this.#getIdentifierName(node),
							compilerNode: node,
							textRange: tsdoc.TextRange.fromStringRange(
								buffer,
								comment.pos,
								comment.end,
							),
							kind: ts.SyntaxKind[node.kind],
						})
					}
				}
			}

			return node.forEachChild((child) =>
				this.#walkCompilerAstAndFindComments(child, indent + '  ', foundComments, tree),
			)
		} catch (error) {
			console.error(error)
			console.log('tree:')
			console.log(y(tree))
			throw error
		}
	}

	/**
	 * Retrieves the JSDoc-style comments associated with a specific AST node.
	 *
	 * Based on ts.getJSDocCommentRanges() from the compiler.
	 * https://github.com/microsoft/TypeScript/blob/v3.0.3/src/compiler/utilities.ts#L924
	 */
	static #getJSDocCommentRanges(node: ts.Node, text: string): ts.CommentRange[] {
		const commentRanges: ts.CommentRange[] = []

		switch (node.kind) {
			case ts.SyntaxKind.Parameter:
			case ts.SyntaxKind.TypeParameter:
			case ts.SyntaxKind.FunctionExpression:
			case ts.SyntaxKind.ArrowFunction:
			case ts.SyntaxKind.ParenthesizedExpression: {
				commentRanges.push(...(ts.getTrailingCommentRanges(text, node.pos) || []))
				break
			}
		}
		commentRanges.push(...(ts.getLeadingCommentRanges(text, node.pos) || []))

		// True if the comment starts with '/**' but not if it is '/**/'
		return commentRanges.filter(
			(comment) =>
				text.charCodeAt(comment.pos + 1) === 0x2a /* ts.CharacterCodes.asterisk */ &&
				text.charCodeAt(comment.pos + 2) === 0x2a /* ts.CharacterCodes.asterisk */ &&
				text.charCodeAt(comment.pos + 3) !== 0x2f /* ts.CharacterCodes.slash */,
		)
	}

	/**
	 * Returns true if the specified SyntaxKind is part of a declaration form.
	 *
	 * Based on ts.isDeclarationKind() from the compiler.
	 * https://github.com/microsoft/TypeScript/blob/v3.0.3/src/compiler/utilities.ts#L6382
	 */
	static #isDeclarationKind(kind: ts.SyntaxKind): boolean {
		return (
			kind === ts.SyntaxKind.ArrowFunction ||
			kind === ts.SyntaxKind.BindingElement ||
			kind === ts.SyntaxKind.ClassDeclaration ||
			kind === ts.SyntaxKind.ClassExpression ||
			kind === ts.SyntaxKind.Constructor ||
			kind === ts.SyntaxKind.EnumDeclaration ||
			kind === ts.SyntaxKind.EnumMember ||
			kind === ts.SyntaxKind.ExportSpecifier ||
			kind === ts.SyntaxKind.FunctionDeclaration ||
			kind === ts.SyntaxKind.FunctionExpression ||
			kind === ts.SyntaxKind.GetAccessor ||
			kind === ts.SyntaxKind.ImportClause ||
			kind === ts.SyntaxKind.ImportEqualsDeclaration ||
			kind === ts.SyntaxKind.ImportSpecifier ||
			kind === ts.SyntaxKind.InterfaceDeclaration ||
			kind === ts.SyntaxKind.JsxAttribute ||
			kind === ts.SyntaxKind.MethodDeclaration ||
			kind === ts.SyntaxKind.MethodSignature ||
			kind === ts.SyntaxKind.ModuleDeclaration ||
			kind === ts.SyntaxKind.NamespaceExportDeclaration ||
			kind === ts.SyntaxKind.NamespaceImport ||
			kind === ts.SyntaxKind.Parameter ||
			kind === ts.SyntaxKind.PropertyAssignment ||
			kind === ts.SyntaxKind.PropertyDeclaration ||
			kind === ts.SyntaxKind.PropertySignature ||
			kind === ts.SyntaxKind.SetAccessor ||
			kind === ts.SyntaxKind.ShorthandPropertyAssignment ||
			kind === ts.SyntaxKind.TypeAliasDeclaration ||
			kind === ts.SyntaxKind.TypeParameter ||
			kind === ts.SyntaxKind.VariableDeclaration ||
			kind === ts.SyntaxKind.VariableDeclarationList || //?!
			kind === ts.SyntaxKind.VariableStatement || //?!
			kind === ts.SyntaxKind.JSDocTypedefTag ||
			kind === ts.SyntaxKind.JSDocCallbackTag ||
			kind === ts.SyntaxKind.JSDocPropertyTag
		)
	}

	static #reportCompilerErrors(program: ts.Program, verbose = false) {
		const l = verbose ? log : () => {}
		const compilerDiagnostics: ReadonlyArray<ts.Diagnostic> = program.getSemanticDiagnostics()
		const count = compilerDiagnostics.length

		if (count <= 0) {
			l(g('No compiler errors.'))
			return
		}

		const _ = count === 1 ? 'error' : 'errors'
		l(`\n${bd(r(count))} compiler ${_} found:\n`)

		if (verbose) {
			for (const diagnostic of compilerDiagnostics) {
				const message: string = ts.flattenDiagnosticMessageText(
					diagnostic.messageText,
					os.EOL,
				)
				if (diagnostic.file) {
					const location: ts.LineAndCharacter =
						diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start!)
					const formattedMessage: string =
						b('\n[TypeScript] ') +
						r(message) +
						dim(
							`\n${diagnostic.file.fileName}(${location.line + 1},${
								location.character + 1
							})`,
						)
					l(formattedMessage)
				} else {
					l(r(message))
				}
			}
		}
	}
}
