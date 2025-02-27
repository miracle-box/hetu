import type { PrettyOptions } from 'pino-pretty';
import pinoPretty from 'pino-pretty';

export default (opts: PrettyOptions) =>
	pinoPretty({
		...opts,
		customPrettifiers: {
			// [FIXME] No color options in time prettier.
			time: (timestamp) => `[${timestamp.toString()}]`,
		},
		translateTime: 'SYS:yyyy/m/dd HH:MM:ss',
	});
