export function formError(stateOrMessage: string | object) {
	if (typeof stateOrMessage === 'string')
		// Consider string as form error.
		return {
			formState: {
				errorMap: {
					onServer: {
						form: stateOrMessage,
						fields: {},
					},
				},
				errors: [stateOrMessage],
			},
		};
	else
		// Will merge form state on client side.
		return {
			formState: stateOrMessage,
		};
}

export function formSuccess<TData>(data: TData) {
	return { data };
}
