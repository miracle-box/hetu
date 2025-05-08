import { ValuePointer } from '@sinclair/typebox/value';
import { Elysia, t } from 'elysia';
import {
	type OAuth2Profile,
	SessionScope,
	VerificationScenario,
} from '~backend/auth/auth.entities';
import { AuthRepository } from '~backend/auth/auth.repository.ts';
import { authMiddleware } from '~backend/shared/auth/middleware';
import { Config } from '~backend/shared/config';
import { Logger } from '~backend/shared/logger';
import { AppError } from '~backend/shared/middlewares/errors/app-error.ts';
import { createErrorResps } from '~backend/shared/middlewares/errors/docs';
import { UsersRepository } from '~backend/users/users.repository.ts';

export const confirmOauth2BindingHandler = new Elysia()
	.use(authMiddleware(SessionScope.DEFAULT))
	.post(
		'/oauth2/bind/:verificationId/confirm',
		async ({ session, params, set }) => {
			// [TODO] Probably these checks (and the revocation process) should be placed in a separate usecase
			const verif = await AuthRepository.findVerifiedVerification(
				params.verificationId,
				VerificationScenario.OAUTH2_BIND,
			);
			if (!verif) throw new AppError('auth/invalid-verification');

			const provider = Object.entries(Config.app.oauth2.providers).find(
				([key]) => key === verif.target,
			)?.[1];
			if (!provider) throw new AppError('auth/invalid-oauth2-provider');

			const user = await UsersRepository.findById(session.userId);
			// [FIXME] Checked by session middleware but we have to re-check here for type safety.
			if (!user) throw new AppError('users/not-found');

			await AuthRepository.revokeVerificationById(verif.id);

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
						? ((ValuePointer.Get(data, provider.profileMap.email) as unknown) ??
							undefined)
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

			const existingBinding = await AuthRepository.findOAuth2Binding(
				verif.target,
				profile.id,
			);
			if (existingBinding && session.userId !== existingBinding.userId) {
				await AuthRepository.revokeVerificationById(verif.id);
				throw new AppError('auth/oauth2-already-bound');
			}

			if (existingBinding) {
				set.status = 'No Content';
				return;
			}

			await AuthRepository.upsertOAuth2({
				userId: session.userId,
				oauth2ProfileId: profile.id,
				provider: verif.target,
				// [TODO] Refresh profile and store more necessary info in database.
				metadata: {
					accessToken: verif.secret,
				},
			});

			set.status = 'Created';
			return;
		},
		{
			params: t.Object({
				verificationId: t.String(),
			}),
			response: {
				201: t.Void(),
				204: t.Void(),
				...createErrorResps(409, 500),
			},
			detail: {
				summary: 'Confirm OAuth2 Binding',
				description: 'Confirm binding OAuth2 account.',
				tags: ['Authentication'],
				security: [{ session: [] }],
			},
		},
	);
