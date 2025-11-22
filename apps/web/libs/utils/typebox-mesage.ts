import { DefaultErrorFunction, SetErrorFunction, ValueErrorType } from '@sinclair/typebox/errors';

export function initializeTypeBoxErrorMessage(t: (key: string) => string) {
	SetErrorFunction((e) => {
		const message = e.schema['message'] as
			| string
			| Partial<Record<ValueErrorType | 'default', string>>
			| undefined;
		if (!message) return DefaultErrorFunction(e);

		if (typeof message === 'string') return t(message);
		else return t(message[e.errorType] ?? message['default'] ?? DefaultErrorFunction(e));
	});
}
