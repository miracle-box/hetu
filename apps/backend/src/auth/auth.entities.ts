import { EnumLikeValues } from '~/shared/typing/utils';

export const UserAuthType = {
	PASSWORD: 'password',
} as const;

export type UserAuthType = EnumLikeValues<typeof UserAuthType>;
