import pinoPretty, { type PrettyOptions, colorizerFactory } from 'pino-pretty';

export default (opts: PrettyOptions) =>
	pinoPretty({
		...opts,
		customPrettifiers: {
			// [FIXME] No color options in time prettier.
			time: (timestamp) => `[${timestamp}]`,
		},
		translateTime: 'SYS:yyyy/m/dd HH:MM:ss',
	});
