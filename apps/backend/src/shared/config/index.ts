import type { Config as ConfigType } from './schema';
import { readFileSync } from 'node:fs';
import { Value } from '@sinclair/typebox/value';
import YAML from 'yaml';
import { configSchema } from './schema';

let initialized = false;
let configData = {} as unknown as ConfigType;

// Sadly we can't access the logger before initializing the configuration.
export function initConfig(path: string) {
	// Initialize only once.
	if (initialized) return;

	try {
		const configFile = readFileSync(path).toString();
		const rawConfig: unknown = YAML.parse(configFile);

		const configErrors = [...Value.Errors(configSchema, rawConfig)];
		if (configErrors.length > 0) {
			console.error('Invalid configuration values found:');
			for (const configError of configErrors) {
				console.error(
					`\t- ${configError.path}: ${configError.message}, but got '${String(configError.value)}'.`,
				);
			}

			throw new Error('Some values in the config are invalid.');
		}

		// Keep the same ref
		Object.assign(configData, Value.Parse(configSchema, rawConfig));
		initialized = true;
	} catch (e) {
		console.error('Failed to load config file, error details are printed below.');
		console.error(e);
		process.exit(1);
	}
}

export const Config = new Proxy<ConfigType>(configData, {
	get(target: ConfigType, prop: keyof typeof target) {
		if (!initialized) {
			throw new Error('Accessing config values before initialization is not allowed.');
		}
		return target[prop];
	},
});
