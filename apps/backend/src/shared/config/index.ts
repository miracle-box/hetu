import YAML from 'yaml';
import { readFileSync } from 'node:fs';
import { Value } from '@sinclair/typebox/value';
import { Logger } from '~backend/shared/logger';
import { configSchema, type Config as ConfigType } from './schema';

const configStatus = {
	initialized: false,
	data: null as unknown as ConfigType,
};

// Escapes type checking here because `prop` is not `configStatus` but `configStatus.data`
export const Config = new Proxy<ConfigType>(configStatus as any, {
	get(target: any, prop: keyof typeof target.data) {
		if (!target.initialized) {
			Logger.error(
				new Error(
					'Accessing the config before initialization is not allowed, the app will exit now.',
				),
			);
			process.exit(1);
		}
		return target.data[prop];
	},
});

export function initConfig() {
	// Initialize only once.
	if (configStatus.initialized) return;

	try {
		// [TODO] More ways of specifying config file
		const configFile = readFileSync('./config.yaml').toString();
		const rawConfig = YAML.parse(configFile);

		const configErrors = [...Value.Errors(configSchema, rawConfig)];
		for (const configError of configErrors) {
			Logger.error(
				`Invalid config value at ${configError.path} ${
					configError.schema.description && `(${configError.schema.description})`
				}: ${configError.message}, but got '${configError.value}'.`,
			);
		}
		if (configErrors.length > 0) {
			throw 'Some values in the config are invalid, exiting now.';
		}

		configStatus.data = Value.Parse(configSchema, rawConfig);
		configStatus.initialized = true;
	} catch (e) {
		Logger.error(e, 'Failed to load config file, exiting now.');
		process.exit(1);
	}

	Logger.info('Configuration successfully initialized.');
}

initConfig();
