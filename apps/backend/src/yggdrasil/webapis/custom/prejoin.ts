import { Elysia } from 'elysia';

export const prejoinHandler = new Elysia().post('/prejoin', () => {}, {
	detail: {
		summary: 'AnyLogin Prejoin',
		description:
			'*(For AnyLogin)* Log player info to us in prejoin stage, helps to identify player profile in our services.',
		tags: ['Yggdrasil Custom'],
	},
});
