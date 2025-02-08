import { Static } from 'elysia';
import { APP_ERRORS } from './errors';

export class AppError<TErrorCode extends keyof typeof APP_ERRORS> extends Error {
	code = '';
	status = 0;
	details: unknown;

	constructor(
		errorCode: TErrorCode,
		// Always pass the message params before details
		...params: Parameters<(typeof APP_ERRORS)[TErrorCode]['message']> extends [
			infer TMessageParams,
		]
			? Static<(typeof APP_ERRORS)[TErrorCode]['details']> extends infer TDetails
				? [TMessageParams, TDetails]
				: [TMessageParams]
			: Static<(typeof APP_ERRORS)[TErrorCode]['details']> extends infer TDetails
				? [TDetails]
				: []
	) {
		super();
		const errorInfo = APP_ERRORS[errorCode];

		this.code = errorCode;
		this.status = errorInfo.status;

		if (errorInfo.message.length > 0) {
			// @ts-ignore Checked with the type of `params`
			this.message = errorInfo.message.call(this, params[0]);
			if (errorInfo.details.length > 0) this.details = params[1];
		} else {
			this.message = errorInfo.message.call(this);
			if (errorInfo.details.length > 0) this.details = params[0];
		}
	}
}
