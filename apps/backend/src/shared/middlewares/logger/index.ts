import type { ElysiaOnErrorContext } from '#shared/middlewares/errors/types';
import process from 'node:process';
import { Elysia } from 'elysia';
import { version as elysiaVersion } from 'elysia/package.json';
import { Config } from '#config';
import { Logger } from '#logger';
import { version as hetuVersion } from '#package.json';

const REQUEST_START_TIME_KEY = Symbol('REQUEST_START_TIME_KEY');

function timeToNow(time: bigint) {
	return Number(process.hrtime.bigint() - time);
}

function formatDuration(duration: number): string {
	if (duration > 1000_000) return `${Math.round(duration / 1000_000)}ms`;
	if (duration > 1000_000_000) return `${Math.round(duration / 1000_000_000)}s`;

	return `${Math.round(duration / 1000)}us`;
}

export const logger = () => {
	const app = new Elysia({
		name: 'Logger',
	}).onStart(() => {
		Logger.info(`Hetu backend v${hetuVersion} running Elysia v${elysiaVersion}`);
		Logger.info(`Service started, listening on ${app.server?.url?.toString()}`);
	});

	if (!Config.logging.logRequests) return app;

	return app
		.onRequest((ctx) => {
			ctx.store = {
				...ctx.store,
				[REQUEST_START_TIME_KEY]: process.hrtime.bigint(),
			};
		})
		.onAfterResponse((ctx) => {
			if (ctx.responseValue instanceof Error) {
				return;
			}

			const url = new URL(ctx.request.url);
			const duration = timeToNow(
				(ctx.store as { [REQUEST_START_TIME_KEY]: bigint })[REQUEST_START_TIME_KEY],
			);

			const details = Config.logging.logRequestDetails
				? {
						request: {
							method: ctx.request.method,
							route: ctx.route,
							path: ctx.path,
							params: ctx.params,
							query: ctx.query,
							headers: ctx.headers,
							body: ctx.body,
						},
						response: {
							status: ctx.set.status,
							headers: ctx.set.headers,
							body: ctx.response,
						},
						durationMs: duration / 1000_000,
					}
				: {
						request: {
							method: ctx.request.method,
							route: ctx.route,
							path: ctx.path,
							params: ctx.params,
							query: ctx.query,
						},
						response: {
							status: ctx.set.status,
						},
						durationMs: duration / 1000_000,
					};

			Logger.debug(
				details,
				`Handled (${ctx.set.status} ✔) ${ctx.request.method} ${url.pathname} in ${formatDuration(duration)}.`,
			);
		});
};

export const onErrorLogger = (ctx: ElysiaOnErrorContext) => {
	const url = new URL(ctx.request.url);
	const duration = timeToNow(
		(ctx.store as { [REQUEST_START_TIME_KEY]: bigint })[REQUEST_START_TIME_KEY],
	);

	// Correctly typed.
	const status =
		'status' in (ctx.error as Error) ? (ctx.error as Error & { status: number }).status : 500;

	const details = Config.logging.logRequestDetails
		? {
				request: {
					method: ctx.request.method,
					route: ctx.route,
					path: ctx.path,
					params: ctx.params,
					query: ctx.query,
					headers: ctx.headers,
					body: ctx.body,
				},
				response: {
					status,
					headers: ctx.set.headers,
					body: ctx.response,
				},
				durationMs: duration / 1000_000,
			}
		: {
				request: {
					method: ctx.request.method,
					route: ctx.route,
					path: ctx.path,
					params: ctx.params,
					query: ctx.query,
				},
				response: {
					status,
				},
				durationMs: duration / 1000_000,
			};

	Logger.debug(
		details,
		`Handled (${ctx.set.status} ✗) ${ctx.request.method} ${url.pathname} in ${formatDuration(duration)}.`,
	);
};
