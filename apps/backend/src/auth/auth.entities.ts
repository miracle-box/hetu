import { EnumLikeValues } from '~backend/shared/typing/utils';

export const UserAuthType = {
	PASSWORD: 'password',
} as const;

export type UserAuthType = EnumLikeValues<typeof UserAuthType>;
