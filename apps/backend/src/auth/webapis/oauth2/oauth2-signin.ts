import { ValuePointer } from '@sinclair/typebox/value';
import { Elysia, t } from 'elysia';
import {
	type OAuth2Profile,
	type Session,
	sessionSchema,
	SessionScope,
	VerificationScenario,
} from '~backend/auth/auth.entities';
import { AuthRepository } from '~backend/auth/auth.repository.ts';
import { SessionService } from '~backend/services/auth/session.ts';
import { Config } from '~backend/shared/config';
import { Logger } from '~backend/shared/logger';
import { AppError } from '~backend/shared/middlewares/errors/app-error.ts';
import { createErrorResps } from '~backend/shared/middlewares/errors/docs';

export const oauth2SigninHandler = new Elysia().post(
	'/oauth2/signin',
	async ({ body }) => {
		// [TODO] Probably these checks (and the revocation process) should be placed in a separate usecase
		const verif = await AuthRepository.findVerifiedVerification(
			body.verificationId,
			VerificationScenario.OAUTH2_SIGNIN,
		);
		if (!verif) throw new AppError('auth/invalid-verification');

		const provider = Object.entries(Config.app.oauth2.providers).find(
			([key]) => key === verif.target,
		)?.[1];
		if (!provider) throw new AppError('auth/invalid-oauth2-provider');

		const profile = await fetch(provider.endpoints.userinfo, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${verif.secret}`,
			},
		})
			.then((resp) => resp.json())
			.then((data) => {
				// Map response values using JSON Pointer.
				// [TODO] Better use TypeBox to validate.
				let id = ValuePointer.Get(data, provider.profileMap.id) as unknown;
				if (typeof id === 'number') id = id.toString();

				let email = provider.profileMap.email
					? ((ValuePointer.Get(data, provider.profileMap.email) as unknown) ?? undefined)
					: undefined;
				if (typeof email !== 'string') email = undefined;

				let username = provider.profileMap.username
					? ((ValuePointer.Get(data, provider.profileMap.username) as unknown) ??
						undefined)
					: undefined;
				if (typeof username !== 'string') username = undefined;

				let avatarUrl = provider.profileMap.avatarUrl
					? ((ValuePointer.Get(data, provider.profileMap.avatarUrl) as unknown) ??
						undefined)
					: undefined;
				if (typeof avatarUrl !== 'string') avatarUrl = undefined;

				let nickname = provider.profileMap.nickname
					? ((ValuePointer.Get(data, provider.profileMap.nickname) as unknown) ??
						undefined)
					: undefined;
				if (typeof nickname !== 'string') nickname = undefined;

				if (typeof id !== 'string') {
					Logger.error(
						`Invalid OAuth2 user ID obtained from provider "${verif.target}", check your profile mapping configuration!`,
					);
					throw new AppError('auth/oauth2-misconfigured');
				}

				return {
					id,
					email,
					username,
					avatarUrl,
					nickname,
				} satisfies OAuth2Profile;
			});

		const existingBinding = await AuthRepository.findOAuth2Binding(verif.target, profile.id);
		if (!existingBinding) {
			await AuthRepository.revokeVerificationById(verif.id);
			throw new AppError('auth/oauth2-not-bound');
		}

		const session = (await SessionService.create(existingBinding.userId, {
			scope: SessionScope.DEFAULT,
		})) as Session<typeof SessionScope.DEFAULT>;

		await AuthRepository.revokeVerificationById(verif.id);

		return { session };
	},
	{
		body: t.Object({
			verificationId: t.String(),
		}),
		response: {
			200: t.Object({
				session: sessionSchema(t.Literal(SessionScope.DEFAULT)),
			}),
			...createErrorResps(400, 403, 500),
		},
		detail: {
			summary: 'OAuth2 Sign In',
			description: 'OAuth2 social sign in endpoint.',
			tags: ['Authentication'],
			security: [{ session: [] }],
		},
	},
);
