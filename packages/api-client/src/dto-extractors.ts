import {
	type CallExpression,
	type SourceFile,
	type VariableDeclaration,
	type ObjectLiteralExpression,
	type PropertyAssignment,
	type ShorthandPropertyAssignment,
	type NumericLiteral,
	type ArrayLiteralExpression,
	type StringLiteral,
	SyntaxKind,
	ts,
	Node,
} from 'ts-morph';

/** Extract createDtoSchemas calls from DTO file */
export const getCreateDtoSchemasCalls = (
	source: SourceFile,
): CallExpression<ts.CallExpression>[] => {
	return source
		.getVariableStatements()
		.filter((vs) => vs.isExported())
		.flatMap((vs) =>
			vs
				.getDeclarationList()
				.getDeclarations()
				.map((decl) => decl.getInitializerIfKind(SyntaxKind.CallExpression))
				.filter(
					(expr) =>
						expr?.getFirstChildByKind(SyntaxKind.Identifier)?.getText() ===
						'createDtoSchemas',
				),
		)
		.filter((expr): expr is CallExpression<ts.CallExpression> => !!expr);
};

/** Get export variable name from DTO file */
export const getDtoExportName = (call: CallExpression<ts.CallExpression>): string | null => {
	const parent = call.getParent();
	if (parent && parent.getKind() === SyntaxKind.VariableDeclaration) {
		const varDecl = parent as VariableDeclaration;
		const nameNode = varDecl.getNameNode();
		return nameNode.getText();
	}
	return null;
};

/** Extract request properties (body, params, query, cookie, headers) */
export const extractRequestProperties = (requestArg: Node): Map<string, string> => {
	const properties = new Map<string, string>();

	if (requestArg.getKind() === SyntaxKind.ObjectLiteralExpression) {
		const objLiteral = requestArg as ObjectLiteralExpression;

		for (const prop of objLiteral.getProperties()) {
			let propName: string | null = null;
			let propValue: string | null = null;

			if (prop.getKind() === SyntaxKind.PropertyAssignment) {
				const propAssign = prop as PropertyAssignment;
				const nameNode = propAssign.getNameNode();
				propName = nameNode.getText();
				propValue = propAssign.getInitializerOrThrow().getText();
			} else if (prop.getKind() === SyntaxKind.ShorthandPropertyAssignment) {
				const shorthandProp = prop as ShorthandPropertyAssignment;
				propName = shorthandProp.getName();
				propValue = propName;
			}

			if (
				propName &&
				propValue &&
				['body', 'params', 'query', 'cookie', 'headers'].includes(propName)
			) {
				properties.set(propName, propValue);
			}
		}
	}

	return properties;
};

/** Extract status codes and corresponding schemas from response object */
export const extractResponseProperties = (responseArg: Node): Map<number, string> => {
	const responses = new Map<number, string>();

	if (responseArg.getKind() === SyntaxKind.ObjectLiteralExpression) {
		const objLiteral = responseArg as ObjectLiteralExpression;

		for (const prop of objLiteral.getProperties()) {
			if (prop.getKind() === SyntaxKind.PropertyAssignment) {
				const propAssign = prop as PropertyAssignment;
				const nameNode = propAssign.getNameNode();

				if (nameNode.getKind() === SyntaxKind.NumericLiteral) {
					const numericLiteral = nameNode as NumericLiteral;
					const statusCode = parseInt(numericLiteral.getText(), 10);
					const schemaValue = propAssign.getInitializerOrThrow().getText();
					responses.set(statusCode, schemaValue);
				}
			}
		}
	}

	return responses;
};

/** Extract error code array */
export const extractErrorCodes = (errorsArg: Node): string[] => {
	const errorCodes: string[] = [];

	if (errorsArg.getKind() === SyntaxKind.ArrayLiteralExpression) {
		const arrayLiteral = errorsArg as ArrayLiteralExpression;

		for (const element of arrayLiteral.getElements()) {
			if (element.getKind() === SyntaxKind.StringLiteral) {
				const stringLiteral = element as StringLiteral;
				errorCodes.push(stringLiteral.getText().replace(/['"]/g, ''));
			}
		}
	}

	return errorCodes;
};
