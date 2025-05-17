import pino from 'pino';
import { Config } from '~backend/shared/config';

function getDesti(desti: string) {
	return desti.toUpperCase() === 'STDOUT' ? 1 : desti.toUpperCase() === 'STDERR' ? 2 : desti;
}

export const Logger = pino({
	level: Config.logging.level,
	transport: {
		targets: [
			...(Config.logging.prettyPrint.enabled
				? [
						{
							target: '@repo/pino-pretty-transport',
							level: Config.logging.level,
							options: {
								destination: getDesti(Config.logging.prettyPrint.destination),
							},
						},
					]
				: []),
			...(Config.logging.file.enabled
				? [
						{
							target: 'pino/file',
							level: Config.logging.level,
							options: {
								destination: getDesti(Config.logging.file.destination),
								mkdir: true,
								append: Config.logging.file.append,
							},
						},
					]
				: []),
		],
	},
});
