import { Static, t } from 'elysia';
import { userSchema } from '~backend/users/user.entities';
import { UsersRepository } from '~backend/users/users.repository';

export const getUserInfoParamsSchema = t.Object({
	id: t.String(),
});

export const getUserInfoResponseSchema = userSchema;

export async function getUserInfo(
	params: Static<typeof getUserInfoParamsSchema>,
	userId: string,
): Promise<Static<typeof getUserInfoResponseSchema>> {
	// [TODO] Allow get other user's info (profile digest).
	if (userId !== params.id) throw new Error('You can only get your own info.');

	const userInfo = await UsersRepository.findById(params.id);
	if (!userInfo) throw new Error('User not found.');

	return userInfo;
}
