import { Elysia } from 'elysia';
import { prejoinAction } from '#modules/yggdrasil/actions/custom/prejoin.action';
import { prejoinDtoSchemas } from '#modules/yggdrasil/dtos/custom/prejoin.dto';

export const prejoinHandler = new Elysia().post(
	'/prejoin',
	async () => {
		const result = await prejoinAction({ _: undefined });

		return result
			.map(() => {})
			.mapLeft(() => {})
			.extract();
	},
	{
		...prejoinDtoSchemas,
		detail: {
			summary: 'AnyLogin Prejoin',
			description:
				'*(For AnyLogin)* Log player info to us in prejoin stage, helps to identify player profile in our services.',
			tags: ['Yggdrasil Custom'],
		},
	},
);
