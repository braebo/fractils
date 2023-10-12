import { DocNode, DocExcerpt, DocComment, TSDocParser } from '@microsoft/tsdoc'
import { l as log, n as nl, bd, dim, y, p, m, lg, r } from '$lib/utils/l'
import { TSDocConfigFile } from '@microsoft/tsdoc-config'
import * as tsdoc from '@microsoft/tsdoc'
import { start } from '$lib/utils/time'
import ts from 'typescript'
import c from 'chalk'

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
	fileType: 'ts' | 'svelte'

	/**
	 * All exported variable declarations.
	 */
	variables: Export[]

	/**
	 * All exported type declarations.
	 */
	types: Export[]
}

/**
 * A parsed variable declaration's tsdoc comment information.
 */
export interface Export {
	/** Name of the variable the comment belongs to. */
	name: string
	/** The typescript type of the variable. */
	type: string
	/** Path to the file containing the source code. */
	file: string
	summary?: string
	props?: { name: string; description: string }[]
	remarks?: string
	params?: { name: string; description: string }[]
	typeParams?: { name: string; description: string }[]
	defaultValue?: string
	returns?: string
	notes?: string[]
	examples?: string[]
	seeBlocks?: string[]
	customBlocks?: { tagName: string; content: string }[]
	/** The raw tsdoc comment. */
	raw: string
}

/**
 * Information for a found variable declaration.  Most importantly,
 * the `textRange` is captured from the compiler's AST, and used to
 * parse the comment in the source file into a {@link DocComment}
 * for further processing, ultimately parsed into a {@link Export}.
 */
interface FoundComment {
	/** The name of the variable the comment belongs to. */
	name: string
	fileType: string
	/** The declaration node the comment belongs to. */
	compilerNode: ts.Node
	type: string
	/** The start and end positions of the comment in the source file. */
	textRange: tsdoc.TextRange
	/** The {@link ts.SyntaxKind} of declaration node the comment belongs to. */
	kind: string
}

/**
 * Extracts tsdoc comment information from files or folders in
 * the form of {@link Export} objects.
 */
export class Extractor {
	static #tsdocParser = Extractor.#createParser()
	static #program?: ts.Program

	static variables: Export[] = []
	static types: Export[] = []

	/**
	 * Scans a list of files for tsdoc comments and parses them.
	 * @param paths The paths to the files to scan.
	 * @param verbose Whether to log the results to the console.
	 * @returns An array of {@link ParsedFile} objects.
	 */
	static async scanFiles(paths: string[], verbose = false): Promise<ParsedFile[]> {
		const l = verbose ? log : () => {}
		const end = verbose
			? start(dim('scanFiles ') + bd(paths[0].split('/').at(-2)), {
					logStart: true,
					pad: true,
			  })
			: () => {}

		const compilerOptions: ts.CompilerOptions = {
			target: ts.ScriptTarget.Latest,
			module: ts.ModuleKind.ESNext,
			moduleResolution: ts.ModuleResolutionKind.Bundler,
		}

		Extractor.#program = ts.createProgram(paths, compilerOptions)
		Extractor.#program.getSemanticDiagnostics()

		const parsedFiles: ParsedFile[] = []
		const emptyFiles: string[] = []

		for (const path of paths) {
			const sourceFile = Extractor.#program.getSourceFile(path)

			if (!sourceFile) {
				throw new Error('Error retrieving source file' + paths)
			}

			const foundComments = this.#walkCompilerAstAndFindComments(sourceFile, '')

			if (!foundComments.length) {
				emptyFiles.push(path)
				continue
			}

			const variables: Export[] = []
			const types: Export[] = []

			for (const comment of foundComments) {
				const tsdoc = Extractor.#parseTSDoc(comment)
				const parsedComment = Extractor.parseComment(path, tsdoc.name, tsdoc.docComment)

				const collection =
					ts.isVariableStatement(comment.compilerNode) ||
					ts.isFunctionDeclaration(comment.compilerNode)
						? variables
						: types

				parsedComment.type = comment.type
				collection.push(parsedComment)

				if (verbose) Extractor.logComment(parsedComment)
			}

			parsedFiles.push({
				file: path.replace('.svelte.ts', '.svelte'),
				fileType: path.match(/\.svelte(\.ts)?$/) ? 'svelte' : 'ts',
				variables,
				types,
			})
		}

		if (emptyFiles.length) l(y(`\nNo comments found in ${emptyFiles.length} files.`))

		end()

		return parsedFiles
	}

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
	 * Recursively walks the compiler AST, looking for comments
	 * associated with variable declarations.
	 * @returns An array of {@link FoundComment} objects.
	 */
	static #walkCompilerAstAndFindComments(node: ts.SourceFile, indent: string) {
		const foundComments = [] as FoundComment[]

		const typeChecker = Extractor.#program?.getTypeChecker()!

		const walk = (n: ts.Node, indent: string, tree: string[]) => {
			const buffer: string = n.getSourceFile().getFullText() // Don't use getText() here!

			const isExportedDeclaration =
				this.#isDeclarationKind(n.kind) &&
				// @ts-expect-error
				ts.getCombinedModifierFlags(n) & ts.ModifierFlags.Export

			if (isExportedDeclaration) {
				const [comment]: ts.CommentRange[] = Extractor.#getJSDocCommentRanges(n, buffer)
				if (!comment) return

				const name = Extractor.#getIdentifierName(n)
				const type = Extractor.getType(n, typeChecker)

				foundComments.push({
					name,
					fileType: n.getSourceFile().fileName.endsWith('.svelte.ts') ? 'svelte' : 'ts',
					compilerNode: n,
					textRange: tsdoc.TextRange.fromStringRange(buffer, comment.pos, comment.end),
					kind: ts.SyntaxKind[n.kind],
					type: type ?? 'ERROR',
				})
			}

			n.forEachChild((child) => walk(child, indent + '  ', tree))
		}

		walk(node, indent, [])

		return foundComments
	}

	static getType(node: ts.Node, typeChecker: ts.TypeChecker) {
		for (const child of node.getChildren()) {
			const type = typeChecker.typeToString(typeChecker.getTypeAtLocation(child))

			if (type !== 'any') {
				return type.includes('__SvelteComponent_') ? 'SvelteComponent' : type
			}

			const found = Extractor.getType(child, typeChecker)
			if (found) return found
		}

		return null
	}

	/**
	 * Parses a {@link FoundComment} into a docComment.
	 */
	static #parseTSDoc(foundComment: FoundComment) {
		const parserContext = this.#tsdocParser.parseRange(foundComment.textRange)

		const name = foundComment.name
		const docComment = parserContext.docComment
		const category = foundComment.fileType

		return { name, category, docComment } as const
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
	 * @throws If the name cannot be found.
	 */
	static #getIdentifierName(node: ts.Node): string {
		return node.forEachChild(visit).replace('__SvelteComponent_', '')

		function visit(n: ts.Node) {
			if (['Identifier', 'StringLiteral'].includes(ts.SyntaxKind[n.kind])) {
				return n.getText()
			}

			return n.forEachChild(visit)
		}
	}

	/**
	 * Parses a {@link DocComment} into a {@link Export}.
	 * @param file The path to the file containing the comment.
	 * @param name The name of the variable associated with the comment.
	 * @param comment The {@link DocComment} to parse.
	 */
	static parseComment(file: string, name: string, comment: DocComment): Export {
		const found: Partial<Export> = {
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
			for (const block of comment.customBlocks) {
				switch (block.blockTag.tagName) {
					case '@example':
						found.examples ??= []
						found.examples.push(Extractor.renderDocNode(block.content)?.trim())
						break
					case '@note':
						found.notes ??= []
						found.notes.push(Extractor.renderDocNode(block.content)?.trim())
						break
					case '@default':
					case '@defaultValue':
						found.defaultValue = Extractor.renderDocNode(block.content)?.trim()
						break
					case '@prop':
						found.props ??= []
						const description = Extractor.renderDocNode(block.content)?.trim()
						const name = description.match(/^(\S+)\s-\s\S+$/)?.[1] ?? ''
						found.props.push({
							name,
							description
						})
						break
					default:
						found.customBlocks ??= []
						found.customBlocks.push({
							tagName: block.blockTag.tagName,
							content: Extractor.renderDocNode(block.content)?.trim(),
						})
						break
				}
			}

			if (found.customBlocks?.length) {
				console.warn(y('Unused custom blocks found:'))
				found.customBlocks.forEach((b) => {
					console.log(r(b.tagName), dim(b.content))
				})
			}
		}

		return found as Export
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
	 * Pretty prints a {@link Export} to the console.
	 */
	static logComment(comment: Export) {
		const l = log
		const n = nl
		const star = dim(' *')
		let first = false
		const maybeStar = () => (first ? (first = false) : l(star))

		n(2)
		l(dim('/**'))

		if (comment.summary) {
			const gr = c.hex('#446')
			lc(gr(format(comment.summary)))
		}
		if (comment.params?.length) {
			maybeStar()
			comment.params.forEach(({ name, description }) => lc(p('@param'), name, description))
		}
		if (comment.typeParams?.length) {
			maybeStar()
			comment.typeParams.forEach(({ name, description }) =>
				lc(p('typeParam:'), name, description),
			)
		}
		if (comment.props?.length) {
			maybeStar()
			l(JSON.stringify(comment.props))
			comment.props.forEach(({ name, description }) => lc(p('@prop'), name, description))
		}
		if (comment.returns) {
			maybeStar()
			lc(p('@returns'), comment.returns)
		}
		if (comment.defaultValue) {
			maybeStar()
			lc(p('@default'), comment.defaultValue)
		}
		if (comment.remarks) {
			maybeStar()
			lc(p('remarks:'), comment.remarks)
		}

		l(dim(' */'))
		l(bd(comment.name) + dim(': ' + comment.type))

		/**
		 *  Logs a {@link Export} in tsdoc-style, ensuring each line starts with a spaced *
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

	/**
	 * Returns true if the specified SyntaxKind is part of a declaration form.
	 *
	 * Based on ts.isDeclarationKind() from the compiler but includes more kinds.
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
			// kind === ts.SyntaxKind.ImportClause ||
			// kind === ts.SyntaxKind.ImportEqualsDeclaration ||
			// kind === ts.SyntaxKind.ImportSpecifier ||
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
}
