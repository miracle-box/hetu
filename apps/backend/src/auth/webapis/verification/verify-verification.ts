import { Elysia, t } from 'elysia';
import { verificationDigestSchema, VerificationType } from '~backend/auth/auth.entities';
import { AuthRepository } from '~backend/auth/auth.repository';
import { PasswordService } from '~backend/services/auth/password';
import { Config } from '~backend/shared/config';
import { Logger } from '~backend/shared/logger';
import { AppError } from '~backend/shared/middlewares/errors/app-error';
import { createErrorResps } from '~backend/shared/middlewares/errors/docs';

export const verifyVerificationHandler = new Elysia().post(
	'/verification/verify',
	async ({ body }) => {
		const verif = await AuthRepository.findVerificationById(body.id);
		if (!verif) throw new AppError('auth/verification-not-exists');

		if (verif.expiresAt < new Date()) throw new AppError('auth/verification-expired');
		if (verif.triesLeft <= 0) throw new AppError('auth/verification-expired');
		if (verif.verified) throw new AppError('auth/verification-already-verified');

		if (verif.type === VerificationType.EMAIL) {
			const codeCorrect = await PasswordService.compare(body.code, verif.secret);
			if (!codeCorrect) {
				await AuthRepository.updateVerificationById(body.id, {
					triesLeft: verif.triesLeft - 1,
				});
				throw new AppError('auth/verification-invalid-code');
			}

			const verifiedVerif = await AuthRepository.updateVerificationById(body.id, {
				verified: true,
			});

			return {
				verification: {
					type: VerificationType.EMAIL,
					id: verifiedVerif.id,
					scenario: verifiedVerif.scenario,
					target: verifiedVerif.target,
					verified: verifiedVerif.verified,
				},
			};
		}

		if (verif.type === VerificationType.OAUTH2) {
			const provider = Object.entries(Config.app.oauth.providers).find(
				([key]) => key === verif.target,
			)?.[1];
			if (!provider) throw new AppError('auth/invalid-oauth2-provider');

			const tokenUri = provider.endpoints.token;
			// [TODO] Response format is defined in section 5.1 and 5.2, move them to individual types.
			const tokenResponse = (await fetch(tokenUri, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},

				body:
					`grant_type=authorization_code&code=${body.code}&client_id=${provider.clientID}` +
					body.redirectUri
						? // Type checked above
							`&redirect_uri=${encodeURIComponent(body.redirectUri!)}`
						: '' + provider.pkce
							? `&code_verifier=${verif.secret}`
							: '',
			}).then((resp) => resp.json())) as
				| { error: string }
				| { access_token: string; token_type: string };

			if ('error' in tokenResponse) {
				await AuthRepository.revokeVerificationById(body.id);
				// [TODO] Add error type in details.
				throw new AppError('auth/invalid-oauth2-grant');
			}

			if (tokenResponse.token_type !== 'bearer') {
				Logger.error(
					`Invalid token type "${tokenResponse.token_type}" obtained from OAuth2 provider "${verif.target}". Only "bearer" is supported.`,
				);
				await AuthRepository.revokeVerificationById(body.id);

				throw new AppError('auth/oauth2-misconfigured');
			}

			const verifiedVerif = await AuthRepository.updateVerificationById(verif.id, {
				// [TODO] Only access token is stored for now, will store more info in the future.
				secret: tokenResponse.access_token,
				verified: true,
			});

			return {
				verification: {
					type: VerificationType.OAUTH2,
					id: verifiedVerif.id,
					scenario: verifiedVerif.scenario,
					target: verifiedVerif.target,
					verified: verifiedVerif.verified,
					challenge: null,
				},
			};
		}

		// Verification type have no handlers, consider as invalid here.
		throw new AppError('auth/invalid-verification');
	},
	{
		body: t.Object({
			id: t.String(),
			code: t.String(),
			// Only exists in OAuth2 verifications
			redirectUri: t.Optional(t.String({ format: 'uri' })),
		}),
		response: {
			200: t.Object({
				verification: verificationDigestSchema,
			}),
			...createErrorResps(400, 403, 404, 409, 410, 500),
		},
		detail: {
			summary: 'Verify Verification',
			description: 'Verify the code sent to the user.',
			tags: ['Authentication'],
		},
	},
);
