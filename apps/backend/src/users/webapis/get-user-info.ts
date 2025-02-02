import { Static, t } from 'elysia';
import { AppError } from '~backend/shared/middlewares/errors/app-error';
import { userSchema } from '~backend/users/user.entities';
import { UsersRepository } from '~backend/users/users.repository';

export const getUserInfoParamsSchema = t.Object({
	id: t.String(),
});

export const getUserInfoResponseSchema = t.Object({
	user: userSchema,
});

export async function getUserInfo(
	params: Static<typeof getUserInfoParamsSchema>,
	userId: string,
): Promise<Static<typeof getUserInfoResponseSchema>> {
	// [TODO] Allow get other user's info (profile digest).
	if (userId !== params.id) throw new AppError('users/forbidden');

	const userInfo = await UsersRepository.findById(params.id);
	if (!userInfo) throw new AppError('users/not-found');

	return {
		user: userInfo,
	};
}
