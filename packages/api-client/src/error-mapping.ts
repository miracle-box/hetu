import type {
	Project,
	ObjectLiteralExpression,
	PropertyAssignment,
	SatisfiesExpression,
	AsExpression,
	Node,
} from 'ts-morph';
import { SyntaxKind } from 'ts-morph';

export type ErrorInfo = {
	status: number;
	detailsSchemaText: string;
};

/** Extract APP_ERRORS mapping from backend errors.ts */
export const extractAppErrorsMapping = (
	project: Project,
	rootDir: string,
): Map<string, ErrorInfo> => {
	const errorsPath = `${rootDir}/shared/middlewares/errors/errors.ts`;

	let errorsSource = project.getSourceFile(errorsPath);

	if (!errorsSource) {
		try {
			errorsSource = project.addSourceFileAtPath(errorsPath);
		} catch {
			const allFiles = project.getSourceFiles();
			errorsSource = allFiles.find((file) => {
				const path = file.getFilePath();
				return path === errorsPath || path.endsWith('shared/middlewares/errors/errors.ts');
			});
		}
	}

	if (!errorsSource) {
		console.warn(`Cannot find errors.ts file at ${errorsPath}, using fallback error mapping`);
		return new Map();
	}

	const mapping = new Map<string, ErrorInfo>();

	const variableStatements = errorsSource.getVariableStatements();
	const appErrorsVar = variableStatements.find((vs) => {
		const decls = vs.getDeclarationList().getDeclarations();
		return decls.some((decl) => decl.getNameNode()?.getText() === 'APP_ERRORS');
	});

	if (!appErrorsVar) {
		console.warn(
			`Cannot find APP_ERRORS constant in ${errorsSource.getFilePath()}, using fallback error mapping`,
		);
		return new Map();
	}

	const decl = appErrorsVar
		.getDeclarationList()
		.getDeclarations()
		.find((d) => d.getNameNode()?.getText() === 'APP_ERRORS');

	if (!decl) {
		return new Map();
	}

	const initializer = decl.getInitializer();

	if (!initializer) {
		console.warn('APP_ERRORS has no initializer');
		return new Map();
	}

	let objLiteral: ObjectLiteralExpression | null = null;
	let currentExpr: Node = initializer;

	// Handle `as const satisfies` syntax (may have multiple layers)
	while (currentExpr && !objLiteral) {
		const kind = currentExpr.getKind();

		if (kind === SyntaxKind.ObjectLiteralExpression) {
			objLiteral = currentExpr as ObjectLiteralExpression;
			break;
		} else if (kind === SyntaxKind.AsExpression) {
			const asExpr = currentExpr as AsExpression;
			currentExpr = asExpr.getExpression();
		} else if (kind === SyntaxKind.SatisfiesExpression) {
			const satisfiesExpr = currentExpr as SatisfiesExpression;
			currentExpr = satisfiesExpr.getExpression();
		} else {
			console.warn(
				`Unexpected expression kind in APP_ERRORS initializer: ${kind} (${SyntaxKind[kind]})`,
			);
			return new Map();
		}
	}

	if (!objLiteral) {
		console.warn('Cannot extract ObjectLiteralExpression from APP_ERRORS initializer');
		return new Map();
	}

	const properties = objLiteral.getProperties();

	for (const prop of properties) {
		if (prop.getKind() !== SyntaxKind.PropertyAssignment) {
			continue;
		}

	const propAssign = prop as PropertyAssignment;
	const nameNode = propAssign.getNameNode();
	const errorCode = nameNode.getText().replace(/['"]/g, '');

	const propValue = propAssign.getInitializer();

		if (!propValue || propValue.getKind() !== SyntaxKind.ObjectLiteralExpression) {
			continue;
		}

		const errorObj = propValue as ObjectLiteralExpression;

		let statusCode: number | null = null;
		let detailsSchemaText = 'unknown';

		for (const errorProp of errorObj.getProperties()) {
			if (errorProp.getKind() !== SyntaxKind.PropertyAssignment) {
				continue;
			}

			const errorPropAssign = errorProp as PropertyAssignment;
			const errorPropName = errorPropAssign.getNameNode()?.getText();

			if (errorPropName === 'status') {
				const statusValue = errorPropAssign.getInitializer();

				if (statusValue && statusValue.getKind() === SyntaxKind.NumericLiteral) {
					statusCode = parseInt(statusValue.getText(), 10);
				}
			} else if (errorPropName === 'details') {
				const detailsValue = errorPropAssign.getInitializer();
				if (detailsValue) {
					detailsSchemaText = detailsValue.getText();
				}
			}
		}

		if (statusCode !== null) {
			mapping.set(errorCode, {
				status: statusCode,
				detailsSchemaText,
			});
		}
	}

	return mapping;
};

/** Get details schema text for error code */
export const getErrorDetailsSchema = (
	errorCode: string,
	errorMapping: Map<string, ErrorInfo>,
): string => {
	if (errorMapping.has(errorCode)) {
		return errorMapping.get(errorCode)!.detailsSchemaText;
	}
	return 'unknown';
};
