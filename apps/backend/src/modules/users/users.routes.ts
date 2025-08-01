import { Elysia } from 'elysia';
import { getUserInfoHandler } from '#modules/users/webapis/get-user-info.handler';
import { getUserProfilesHandler } from '#modules/users/webapis/get-user-profiles.handler';
import { getUserTexturesHandler } from '#modules/users/webapis/get-user-textures.handler';
import { removeMcClaimHandler } from '#modules/users/webapis/mc-claims/remove-mc-claim.handler';
import { listMcClaimsHandler } from '#modules/users/webapis/mc-claims/list-mc-claims.handler';
import { refreshMcProfileHandler } from '#modules/users/webapis/mc-claims/refresh-mc-profile.handler';
import { modifyMcClaimHandler } from '#modules/users/webapis/mc-claims/modify-mc-claim.handler';
import { verifyMcClaimHandler } from '#modules/users/webapis/mc-claims/verify-mc-claim.handler';

export const UsersRoutes = new Elysia({
	name: 'Routes.Users',
	prefix: '/users',
})
	.use(getUserInfoHandler)
	.use(getUserProfilesHandler)
	.use(getUserTexturesHandler)
	.use(listMcClaimsHandler)
	.use(verifyMcClaimHandler)
	.use(removeMcClaimHandler)
	.use(refreshMcProfileHandler)
	.use(modifyMcClaimHandler);
