import pino from 'pino';

export const Logger = pino({
	transport: {
		targets: [
			{
				target: './pino-pretty-transport',
			},
			// [TODO] Add file transport
		],
	},
});
