import type { Session } from '../auth.entities';
import { EitherAsync, Right } from 'purify-ts';
import { PasswordService } from '~backend/services/auth/password';
import { SessionService } from '~backend/services/auth/session';
import { SessionScope } from '../auth.entities';
import { AuthRepository } from '../auth.repository';

type Command = {
	userId: string;
	newPassword: string;
};

export async function resetPasswordUsecase(cmd: Command) {
	return EitherAsync.liftEither(Right(cmd.userId))
		.chain(async (userId) => {
			const hashedNewPassword = await PasswordService.hash(cmd.newPassword);
			const result = await AuthRepository.upsertPassword({
				userId: userId,
				passwordHash: hashedNewPassword,
			});
			return result.map(() => userId);
		})
		.chain(async (userId) => {
			await SessionService.revokeAll(userId);
			const session = (await SessionService.create(userId, {
				scope: SessionScope.DEFAULT,
			})) as Session;

			return Right({ session });
		})
		.run();
}
