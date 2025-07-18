import { EitherAsync, Right } from 'purify-ts';
import { SessionScope } from '#modules/auth/auth.entities';
import { AuthRepository } from '#modules/auth/auth.repository';
import { PasswordHashService } from '#modules/auth/services/password-hash.service';

type Command = {
	userId: string;
	newPassword: string;
};

export async function resetPasswordUsecase(cmd: Command) {
	return EitherAsync.liftEither(Right(cmd.userId))
		.chain(async (userId) => {
			const hashedNewPassword = await PasswordHashService.hash(cmd.newPassword);
			const result = await AuthRepository.upsertPassword({
				userId: userId,
				passwordHash: hashedNewPassword,
			});
			return result.map(() => userId);
		})
		.chain(async (userId) => {
			await AuthRepository.revokeSessionsByUser(userId);
			return await AuthRepository.createSession({
				userId,
				metadata: {
					scope: SessionScope.DEFAULT,
				},
			});
		})
		.map((session) => ({ session }))
		.run();
}
