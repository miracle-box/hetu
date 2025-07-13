// auth
export * as AuthDtos from '@repo/backend/modules/auth/dtos';
export * as AuthEntities from '@repo/backend/modules/auth/auth.entities';

// files
export * as FilesDtos from '@repo/backend/modules/files/dtos';
export * as FilesEntities from '@repo/backend/modules/files/files.entities';

// profiles
export * as ProfilesDtos from '@repo/backend/modules/profiles/dtos';
export * as ProfilesEntities from '@repo/backend/modules/profiles/profiles.entities';

// textures
export * as TexturesDtos from '@repo/backend/modules/textures/dtos';
export * as TexturesEntities from '@repo/backend/modules/textures/textures.entities';

// users
export * as UsersDtos from '@repo/backend/modules/users/dtos';
export * as UsersEntities from '@repo/backend/modules/users/users.entities';

// yggdrasil
export * as YggdrasilDtos from '@repo/backend/modules/yggdrasil/dtos';
export * as YggdrasilEntities from '@repo/backend/modules/yggdrasil/yggdrasil.entities';

// Errors
export { APP_ERRORS as ApiErrors } from '@repo/backend/shared/middlewares/errors/errors';

// Eden
import { treaty } from '@elysiajs/eden';
import { app } from '@repo/backend/app';
export type App = typeof app;
export const createClient = (
	domain: Parameters<typeof treaty<App>>[0],
	config?: Parameters<typeof treaty<App>>[1],
) => treaty<App>(domain, config);
