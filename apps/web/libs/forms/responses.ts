export function formError(stateOrMessage: string | object) {
	if (typeof stateOrMessage === 'string')
		// Consider string as form error.
		return {
			errorMap: {
				onServer: {
					form: stateOrMessage,
					fields: {},
				},
			},
			errors: [stateOrMessage],
		};
	else
		// Will merge form state on client side.
		return stateOrMessage;
}
