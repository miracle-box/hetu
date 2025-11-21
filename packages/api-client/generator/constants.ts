/** Whitelist: functions and types to copy from backend */
export const WhitelistedIdentifiers = [
	'createEnumLikeValuesSchema',
	'EnumLikeValues',
	'Prettify',
] as const;

/** File patterns and extensions */
export const FilePatterns = {
	DtoExtension: '.dto.ts',
	EntitiesExtension: '.entities.ts',
	CommonDtoName: 'common.dto.ts',
	SharedUtilsPath: 'shared/typing/utils.ts',
	ErrorsMappingPath: 'shared/middlewares/errors/errors.ts',
	BackendIndexPath: '/apps/backend/src/index.ts',
} as const;

/** Path patterns for module extraction */
export const PathPatterns = {
	ModuleRegex: /^\/modules\/([^/]+)\//,
	DtoPathRegex: /^\/modules\/(.*?)\/dtos\/(?:.*\/)?(.*?)(?:\..+)?\.dto\.ts$/i,
} as const;

/** Import path transformations */
export const ImportTransforms = {
	SharedPrefix: '#shared/',
	SharedReplacement: '@repo/backend/shared/',
	ModulesPrefix: '#modules/',
	GeneratedPrefix: '#generated/',
	SharedUtilsImport: '#generated/shared/utils',
	CommonImport: (moduleName: string) => `#generated/${moduleName}/Common`,
	EntitiesImport: (moduleName: string) => `#generated/${moduleName}/Entities`,
	CrossModuleEntitiesImport: (moduleName: string) => `#generated/${moduleName}/Entities`,
} as const;

/** Request property names */
export const RequestProperties = ['body', 'params', 'query', 'cookie', 'headers'] as const;

/** Error property names */
export const ErrorProperties = {
	Status: 'status',
	Details: 'details',
} as const;

/** Error constants */
export const ErrorConstants = {
	AppErrorsVariableName: 'APP_ERRORS',
	FallbackDetailsSchema: 'unknown',
} as const;

/** Package names */
export const PackageNames = {
	Elysia: 'elysia',
	Typebox: '@sinclair/typebox',
} as const;

/** Import patterns */
export const ImportPatterns = {
	TypeboxPattern: 'typebox',
	DtoSchemasPattern: 'dto/schemas',
	EntitiesPattern: '.entities',
	SharedUtilsPattern: 'shared/typing/utils',
} as const;

/** String patterns */
export const StringPatterns = {
	TypePrefix: 'type ',
	ExportConstPrefix: 'export const ',
} as const;

/** Function names */
export const FunctionNames = {
	CreateDtoSchemas: 'createDtoSchemas',
} as const;

/** Import names */
export const ImportNames = {
	Static: 'Static',
} as const;

/** Generated file paths */
export const OutputPaths = {
	SharedUtils: './generated/shared/utils.ts',
	SharedErrors: './generated/shared/errors.ts',
	Index: './generated/index.ts',
	ModuleIndex: (moduleName: string) => `./generated/${moduleName}/index.ts`,
	DtoModule: (moduleName: string, actionName: string) =>
		`./generated/${moduleName}/${actionName}.ts`,
	EntitiesModule: (moduleName: string) => `./generated/${moduleName}/Entities.ts`,
} as const;
