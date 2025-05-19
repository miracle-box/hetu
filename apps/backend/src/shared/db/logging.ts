import type { Logger as DrizzleLogger } from 'drizzle-orm/logger';
import { Logger } from '~backend/shared/logger';

export class PinoDrizzleLogger implements DrizzleLogger {
	logQuery(query: string, params: unknown[]): void {
		const interpolated = this.interpolateQuery(query, params);
		Logger.debug({ sql: query, params }, 'Database query: ' + interpolated);
	}

	private interpolateQuery(query: string, parameters?: unknown[]) {
		if (parameters && parameters.length) {
			parameters.forEach((parameter, index) => {
				query = query.replace(
					new RegExp(`\\$${index + 1}`),
					// It's just logging, params should be safe to stringify.
					// eslint-disable-next-line @typescript-eslint/no-base-to-string,@typescript-eslint/restrict-template-expressions
					`'${typeof parameter === 'object' ? JSON.stringify(parameter) : parameter}'`,
				);
			});
		}

		return query;
	}
}
