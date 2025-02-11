import pino from 'pino';

export const Logger = pino({
	transport: {
		targets: [
			{
				target: '@repo/pino-pretty-transport',
			},
			// [TODO] Add file transport
		],
	},
});
