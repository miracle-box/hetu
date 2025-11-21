import { Project, SyntaxKind, Node, VariableDeclaration, ReturnStatement, AsExpression } from 'ts-morph';

function isInValuePosition(node: Node): boolean {
	if (isInTypePositionHelper(node)) {
		return false;
	}

	let current: Node | undefined = node;
	while (current) {
		const parent = current.getParent();
		if (!parent) {
			break;
		}

		const parentKind = parent.getKind();

		if (parentKind === SyntaxKind.VariableDeclaration) {
			const initializer: Node | undefined = (parent as VariableDeclaration).getInitializer();
			if (initializer && (initializer === current || initializer.getDescendants().some((d: Node) => d === current))) {
				if (!isInTypePositionHelper(parent)) {
					return true;
				}
			}
		} else if (parentKind === SyntaxKind.Identifier || parentKind === SyntaxKind.PropertyAccessExpression) {
			const grandParent = parent.getParent();
			if (grandParent?.getKind() === SyntaxKind.VariableDeclaration) {
				const initializer: Node | undefined = (grandParent as VariableDeclaration).getInitializer();
				if (initializer && (initializer === current || initializer === parent || initializer.getDescendants().some((d: Node) => d === current))) {
					if (!isInTypePositionHelper(grandParent)) {
						return true;
					}
				}
			}
		}

		if (
			parentKind === SyntaxKind.PropertyAccessExpression ||
			parentKind === SyntaxKind.ElementAccessExpression ||
			parentKind === SyntaxKind.CallExpression ||
			parentKind === SyntaxKind.NewExpression ||
			parentKind === SyntaxKind.BinaryExpression ||
			parentKind === SyntaxKind.PrefixUnaryExpression ||
			parentKind === SyntaxKind.PostfixUnaryExpression ||
			parentKind === SyntaxKind.ConditionalExpression ||
			parentKind === SyntaxKind.PropertyAssignment ||
			parentKind === SyntaxKind.ShorthandPropertyAssignment ||
			parentKind === SyntaxKind.ArrayLiteralExpression ||
			parentKind === SyntaxKind.ObjectLiteralExpression ||
			parentKind === SyntaxKind.ParenthesizedExpression ||
			parentKind === SyntaxKind.ExpressionStatement ||
			(parentKind === SyntaxKind.ReturnStatement &&
				(parent as ReturnStatement).getExpression() &&
				((parent as ReturnStatement).getExpression() === current ||
					(parent as ReturnStatement)
						.getExpression()
						?.getDescendants()
						.some((d: Node) => d === current))) ||
			(parentKind === SyntaxKind.AsExpression &&
				(parent as AsExpression).getExpression() &&
				((parent as AsExpression).getExpression() === current ||
					(parent as AsExpression)
						.getExpression()
						?.getDescendants()
						.some((d: Node) => d === current)))
		) {
			if (!isInTypePositionHelper(parent)) {
				return true;
			}
		}

		current = parent;
	}

	return false;
}

function isInTypePositionHelper(node: Node): boolean {
	let current: Node | undefined = node;
	while (current) {
		const kind = current.getKind();
		if (
			kind === SyntaxKind.TypeReference ||
			kind === SyntaxKind.TypeQuery ||
			kind === SyntaxKind.TypeParameter ||
			kind === SyntaxKind.TypeAliasDeclaration ||
			kind === SyntaxKind.InterfaceDeclaration ||
			kind === SyntaxKind.MappedType ||
			kind === SyntaxKind.ConditionalType ||
			kind === SyntaxKind.UnionType ||
			kind === SyntaxKind.IntersectionType ||
			kind === SyntaxKind.TupleType ||
			kind === SyntaxKind.ArrayType ||
			kind === SyntaxKind.FunctionType ||
			kind === SyntaxKind.ConstructorType
		) {
			return true;
		}

		if (
			kind === SyntaxKind.PropertySignature ||
			kind === SyntaxKind.Parameter ||
			kind === SyntaxKind.VariableDeclaration ||
			kind === SyntaxKind.FunctionDeclaration ||
			kind === SyntaxKind.MethodSignature ||
			kind === SyntaxKind.CallSignature ||
			kind === SyntaxKind.ConstructSignature ||
			kind === SyntaxKind.IndexSignature
		) {
			const typeNode = (current as any).getTypeNode?.();
			if (typeNode && typeNode.getDescendants().some((d: Node) => d === node)) {
				return true;
			}
		}

		current = current.getParent();
	}
	return false;
}

export const fixVerbatimModuleSyntax = (content: string): string => {
	const project = new Project({
		useInMemoryFileSystem: true,
		compilerOptions: {
			verbatimModuleSyntax: true,
		},
	});

	const sourceFile = project.createSourceFile('temp.ts', content);

	for (const importDecl of sourceFile.getImportDeclarations()) {
		let allTypeOnly = true;
		const wasTypeOnly = importDecl.isTypeOnly();

		if (wasTypeOnly) {
			for (const namedImport of importDecl.getNamedImports()) {
				if (namedImport.isTypeOnly()) {
					const name = namedImport.getName();
					const alias = namedImport.getAliasNode();
					const text = alias ? `${name} as ${alias.getText()}` : name;
					namedImport.replaceWithText(text);
				}
			}
		}

		for (const namedImport of importDecl.getNamedImports()) {
			const name = namedImport.getName();
			const alias = namedImport.getAliasNode()?.getText() || name;
			const nameNode = namedImport.getNameNode();

			const references = sourceFile
				.getDescendantsOfKind(SyntaxKind.Identifier)
				.filter((id) => {
					const text = id.getText();
					return text === alias && id !== nameNode;
				});

			for (const ref of references) {
				if (isInValuePosition(ref)) {
					allTypeOnly = false;
					break;
				}
			}

			if (!allTypeOnly) {
				break;
			}
		}

		const defaultImport = importDecl.getDefaultImport();
		if (defaultImport && allTypeOnly) {
			const defaultName = defaultImport.getText();
			const references = sourceFile
				.getDescendantsOfKind(SyntaxKind.Identifier)
				.filter((id) => id.getText() === defaultName && id !== defaultImport);

			for (const ref of references) {
				if (isInValuePosition(ref)) {
					allTypeOnly = false;
					break;
				}
			}
		}

		const namespaceImport = importDecl.getNamespaceImport();
		if (namespaceImport && allTypeOnly) {
			const namespaceName = namespaceImport.getText();
			const references = sourceFile
				.getDescendantsOfKind(SyntaxKind.Identifier)
				.filter((id) => id.getText() === namespaceName && id !== namespaceImport);

			for (const ref of references) {
				if (isInValuePosition(ref)) {
					allTypeOnly = false;
					break;
				}
			}
		}

		if (allTypeOnly && importDecl.getNamedImports().length > 0) {
			for (const namedImport of importDecl.getNamedImports()) {
				if (namedImport.isTypeOnly()) {
					const name = namedImport.getName();
					const alias = namedImport.getAliasNode();
					const text = alias ? `${name} as ${alias.getText()}` : name;
					namedImport.replaceWithText(text);
				}
			}
			if (!wasTypeOnly) {
				importDecl.setIsTypeOnly(true);
			}
		} else if (allTypeOnly && (defaultImport || namespaceImport)) {
			if (!wasTypeOnly) {
				importDecl.setIsTypeOnly(true);
			}
		} else {
			if (wasTypeOnly) {
				importDecl.setIsTypeOnly(false);
			}
			for (const namedImport of importDecl.getNamedImports()) {
				const name = namedImport.getName();
				const alias = namedImport.getAliasNode()?.getText() || name;
				const nameNode = namedImport.getNameNode();

				const references = sourceFile
					.getDescendantsOfKind(SyntaxKind.Identifier)
					.filter((id) => {
						const text = id.getText();
						return text === alias && id !== nameNode;
					});

				for (const ref of references) {
					if (isInValuePosition(ref)) {
						if (namedImport.isTypeOnly()) {
							const aliasNode = namedImport.getAliasNode();
							const text = aliasNode ? `${name} as ${aliasNode.getText()}` : name;
							namedImport.replaceWithText(text);
						}
						break;
					}
				}
			}
		}
	}

	return sourceFile.getFullText();
};
