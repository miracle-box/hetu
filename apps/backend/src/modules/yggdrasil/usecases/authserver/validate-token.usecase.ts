import { EitherAsync, Left, Right } from 'purify-ts';
import { SessionLifecycle, SessionScope } from '~backend/modules/auth/auth.entities';
import { SessionValidationService } from '~backend/modules/auth/services/session.service';
import { YggdrasilService } from '../../services/yggdrasil.service';
import { YggdrasilAuthenticationError } from '../../yggdrasil.errors';

export interface ValidateTokenCommand {
	accessToken: string;
	clientToken?: string;
	ignoreClientToken?: boolean;
	allowedLifecycle?: Exclude<SessionLifecycle, (typeof SessionLifecycle)['Expired']>[];
}

const defaultAllowedLifecycle = [SessionLifecycle.Active, SessionLifecycle.Renewable];

export async function validateTokenUsecase(cmd: ValidateTokenCommand) {
	const allowedLifecycle = cmd.allowedLifecycle ?? defaultAllowedLifecycle;

	const accessToken = YggdrasilService.parseAccessToken(cmd.accessToken);
	if (!accessToken) {
		return Left(new YggdrasilAuthenticationError('Invalid access token.'));
	}

	return EitherAsync.fromPromise(() =>
		SessionValidationService.validate(
			accessToken.sessionId,
			accessToken.sessionToken,
			SessionScope.YGGDRASIL,
			allowedLifecycle,
		),
	)
		.mapLeft((error) => {
			if (error.name === 'InvalidSessionError') {
				return new YggdrasilAuthenticationError('Invalid access token.');
			}

			return error;
		})
		.chain(async (validationResult) => {
			if (validationResult.session.metadata.scope !== SessionScope.YGGDRASIL) {
				return Left(new YggdrasilAuthenticationError('Invalid access token.'));
			}

			if (!cmd.ignoreClientToken) {
				if (cmd.clientToken !== validationResult.session.metadata.clientToken) {
					return Left(new YggdrasilAuthenticationError('Invalid client token.'));
				}
			}

			return Right(validationResult);
		});
}
