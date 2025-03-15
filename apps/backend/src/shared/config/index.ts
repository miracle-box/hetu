import type { Config as ConfigType } from './schema';
import { readFileSync } from 'node:fs';
import { Value } from '@sinclair/typebox/value';
import YAML from 'yaml';
import { Logger } from '~backend/shared/logger';
import { configSchema } from './schema';

let initialized = false;
let configData = {} as unknown as ConfigType;

export function initConfig(path: string) {
	// Initialize only once.
	if (initialized) return;

	try {
		// [TODO] More ways of specifying config file
		const configFile = readFileSync(path).toString();
		const rawConfig: unknown = YAML.parse(configFile);

		const configErrors = [...Value.Errors(configSchema, rawConfig)];
		for (const configError of configErrors) {
			Logger.error(
				`Invalid config value at ${configError.path} ${
					configError.schema.description && `(${configError.schema.description})`
				}: ${configError.message}, but got '${String(configError.value)}'.`,
			);
		}
		if (configErrors.length > 0) {
			throw new Error('Some values in the config are invalid, exiting now.');
		}

		// Keep the same ref
		Object.assign(configData, Value.Parse(configSchema, rawConfig));
		initialized = true;
	} catch (e) {
		Logger.error(e, 'Failed to load config file, exiting now.');
		process.exit(1);
	}

	Logger.info('Configuration successfully initialized.');
}

export const Config = new Proxy<ConfigType>(configData, {
	get(target: ConfigType, prop: keyof typeof target) {
		if (!initialized) {
			Logger.error(
				new Error(
					'Accessing the config before initialization is not allowed, the app will exit now.',
				),
			);
			process.exit(1);
		}
		return target[prop];
	},
});
