import type { PrettyOptions } from 'pino-pretty';
import pinoPretty from 'pino-pretty';

export default (opts: PrettyOptions) =>
	pinoPretty({
		...opts,
		ignore: 'pid,hostname',
		messageFormat: (log, messageKey, _levelLabel, extras) => {
			return (
				(log['requestId']
					? extras.colors.white(`[${(log['requestId'] as string).slice(0, 7)}] `)
					: '') + log[messageKey]
			);
		},
		translateTime: 'SYS:yyyy/m/dd HH:MM:ss',
		customPrettifiers: {
			// requestId is already prepended to the message.
			requestId: () => undefined!,
			// Request duration is already in the log message.
			durationMs: () => undefined!,
			// Avoid the messy escapes in SQL statements.
			sql: (value) => value.toString(),
		},
	});
