import { DocNode, DocExcerpt, DocComment, TSDocParser } from '@microsoft/tsdoc'
import { l as log, n as nl, b, bd, dim, g, r } from '$lib/utils/l'
import { readdir, stat } from 'node:fs/promises'
import tsdoc from '@microsoft/tsdoc'
import { join } from 'node:path'
import ts from 'typescript'
import os from 'os'

/**
 * Information for a found variable declaration.  Most importantly,
 * the `textRange` is captured from the compiler's AST, and used to
 * parse the comment in the source file into a {@link DocComment}
 * for further processing, ultimately parsed into a {@link Comment}.
 */
export interface FoundComment {
	/** The name of the variable the comment belongs to. */
	name: string
	/** The declaration node the comment belongs to. */
	compilerNode: ts.Node
	/** The start and end positions of the comment in the source file. */
	textRange: tsdoc.TextRange
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
	 * The raw tsdoc comment.
	 */
	tsdoc: string
	summary?: string
	remarks?: string
	params?: { name: string; description: string }[]
	typeParams?: { name: string; description: string }[]
	returns?: string
	defaultValue?: string
	customBlocks?: { tagName: string; content: string }[]
}

/**
 * Extracts tsdoc comment information from files or folders in
 * the form of {@link Comment} objects.
 */
export class Extractor {
	public static comments: Comment[] = []

	public static async scanFolders(paths: string[], verbose = false) {
		const l = verbose ? log : () => {}
		const comments: Comment[] = []

		for (const path of paths) {
			const absolutePath = join(__dirname, path)
			const files = await readdir(absolutePath)

			for (const file of files) {
				const filePath = join(absolutePath, file)
				const stats = await stat(filePath)

				if (stats.isDirectory()) {
					this.scanFolders([filePath])
					continue
				}

				if (stats.isFile() && filePath.endsWith('.ts')) {
					l(dim('\n' + '-'.repeat(80)))

					const result = this.scanFile(filePath, verbose)

					for (const parsedComment of result.comments) {
						comments.push(parsedComment)

						if (verbose) {
							l(b(`\n\nFound comment:\n`))
							this.logComment(parsedComment)
						}
					}

					l(dim('\n' + '-'.repeat(80) + '\n'))
				}
			}
		}

		return comments
	}

	public static scanFile(path: string, verbose = false) {
		const l = verbose ? log : () => {}
		const n = verbose ? nl : () => {}

		const compilerOptions: ts.CompilerOptions = {
			target: ts.ScriptTarget.ES5,
		}

		const input = new URL(path, import.meta.url)
		const inputFilename = input.pathname

		n()
		l(inputFilename.split('/').pop())
		n()
		l(dim('envoking typescript compiler'))
		n()

		const program: ts.Program = ts.createProgram([inputFilename], compilerOptions)

		// Report any compiler errors
		const compilerDiagnostics: ReadonlyArray<ts.Diagnostic> = program.getSemanticDiagnostics()
		if (compilerDiagnostics.length > 0) {
			for (const diagnostic of compilerDiagnostics) {
				const message: string = ts.flattenDiagnosticMessageText(
					diagnostic.messageText,
					os.EOL,
				)
				if (diagnostic.file) {
					const location: ts.LineAndCharacter =
						diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start!)
					const formattedMessage: string =
						`${diagnostic.file.fileName}(${location.line + 1},${
							location.character + 1
						}):` + ` [TypeScript] ${message}`
					console.log(r(formattedMessage))
				} else {
					console.log(r(message))
				}
			}
		} else {
			l(g('No compiler errors.'))
		}

		const sourceFile = program.getSourceFile(inputFilename)
		if (!sourceFile) {
			throw new Error('Error retrieving source file')
		}

		l(os.EOL + 'Scanning compiler AST for first code comment...' + os.EOL)

		const foundComments: FoundComment[] = []

		this.#walkCompilerAstAndFindComments(sourceFile, '', foundComments)

		if (!foundComments.length) {
			l(r('No comments found.'))
			return {
				file: null,
				comments: [],
			}
		}

		const comments = foundComments
			.map((c) => Extractor.#parseTSDoc(c))
			.map((c) => Extractor.parseComment(c.name, c.docComment))

		return {
			file: path,
			comments,
		}
	}

	/**
	 * Pretty prints a {@link Comment} to the console.
	 */
	public static logComment(comment: Comment) {
		const l = log
		const n = nl
		const star = dim(' *')

		l(bd(comment.name))
		n()

		l(dim(comment.tsdoc))

		l(dim('/**'))

		if (comment.summary) {
			lc(g(format(comment.summary)))
			l(star)
		}
		if (comment.remarks) {
			lc(b('remarks:'), comment.remarks)
			l(star)
		}
		if (comment.params?.length) {
			comment.params.forEach((p) => lc(b('param:'), p.name, p.description))
			l(star)
		}
		if (comment.typeParams?.length) {
			comment.typeParams.forEach((p) => lc(b('typeParam:'), p.name, p.description))
			l(star)
		}
		if (comment.returns) {
			lc(b('returns:'), comment.returns)
			l(star)
		}
		if (comment.defaultValue) {
			lc(b('@defaultValue'), comment.defaultValue)
		}

		l(dim(' */'))

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

	static #tsdocParser = new TSDocParser()

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
		const tree: string[] = []

		for (const n of node.getChildren()) {
			tree.push(ts.SyntaxKind[n.kind])
			if (['Identifier', 'StringLiteral'].includes(ts.SyntaxKind[n.kind])) {
				return n.getText()
			}
		}

		console.error('Failed to find identifier name.')
		console.error(tree)
		throw new Error('Failed to find identifier name.')
	}

	/**
	 * Parses a {@link DocComment} into a {@link Comment}.
	 * @param name The name of the variable associated with the comment.
	 * @param comment The {@link DocComment} to parse.
	 * @returns
	 */
	static parseComment(name: string, comment: DocComment): Comment {
		const tsdoc = comment.emitAsTsdoc()

		const summary = Extractor.renderDocNode(comment.summarySection)?.trim()

		const params = comment.params.blocks.map((b) => {
			return {
				name: b.parameterName,
				description: Extractor.renderDocNode(b.content)?.trim(),
			}
		})

		const typeParams = comment.typeParams.blocks.map((b) => {
			return {
				name: b.parameterName,
				description: Extractor.renderDocNode(b.content)?.trim(),
			}
		})

		const returns = comment.returnsBlock
			? Extractor.renderDocNode(comment.returnsBlock.content)?.trim()
			: undefined

		const remarks = comment.remarksBlock
			? Extractor.renderDocNode(comment.remarksBlock.content)?.trim()
			: undefined

		const defaultValue = comment.customBlocks
			.filter((b) => b.blockTag.tagName === '@defaultValue')
			.map((b) => Extractor.renderDocNode(b.content))?.[0]
			?.trim()

		const customBlocks = comment.customBlocks.map((b) => {
			return {
				tagName: b.blockTag.tagName,
				content: Extractor.renderDocNode(b.content)?.trim(),
			}
		})

		return {
			name,
			tsdoc,
			summary,
			remarks,
			params,
			typeParams,
			returns,
			defaultValue,
			customBlocks,
		}
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
	): void {
		const buffer: string = node.getSourceFile().getFullText() // don't use getText() here!

		// Only consider nodes that are part of a declaration form.  Without this, we could discover
		// the same comment twice (e.g. for a MethodDeclaration and its PublicKeyword).
		if (this.#isDeclarationKind(node.kind)) {
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
					})
				}
			}
		}

		return node.forEachChild((child) =>
			this.#walkCompilerAstAndFindComments(child, indent + '  ', foundComments),
		)
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
			kind === ts.SyntaxKind.JSDocTypedefTag ||
			kind === ts.SyntaxKind.JSDocCallbackTag ||
			kind === ts.SyntaxKind.JSDocPropertyTag
		)
	}
}
