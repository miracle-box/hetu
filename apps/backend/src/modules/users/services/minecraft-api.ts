import type { EnumLikeValues } from '#shared/typing/utils';
import { Left, Right } from 'purify-ts';
import { SkinTextureVariant } from '../mc-claims.entities';
import { McApiAuthError } from '../users.errors';

type XBLTokenResponse = {
	IssueInstant: string;
	NotAfter: string;
	Token: string;
	DisplayClaims: {
		xui: Array<{ uhs: string }>;
	};
};

type MinecraftTokenResponse = {
	username: string;
	roles: unknown;
	access_token: string;
	token_type: string;
	expires_in: string;
};

type MinecraftClaimsResponse = {
	items: Array<{
		name: string;
		signature: string;
	}>;
	signature: string;
	keyId: string;
};

type MinecraftProfileResponse = {
	id: string;
	name: string;
	skins: Array<{
		id: string;
		state: 'ACTIVE' | 'INACTIVE';
		url: string;
		textureKey: string;
		variant: 'CLASSIC' | 'SLIM';
	}>;
	capes: Array<{
		id: string;
		state: 'ACTIVE' | 'INACTIVE';
		url: string;
		alias: string;
	}>;
	profileActions: unknown;
};

export type MinecraftProfile = {
	uuid: string;
	username: string;
	skin: {
		url: string;
		variant: EnumLikeValues<typeof SkinTextureVariant>;
	} | null;
	cape: {
		url: string;
		alias: string;
	} | null;
};

export class MinecraftApiService {
	static async authXBL(msaToken: string) {
		const resp = await fetch('https://user.auth.xboxlive.com/user/authenticate', {
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				Properties: {
					AuthMethod: 'RPS',
					SiteName: 'user.auth.xboxlive.com',
					RpsTicket: `d=${msaToken}`,
				},
				RelyingParty: 'http://auth.xboxlive.com',
				TokenType: 'JWT',
			}),
		});

		if (!resp.ok) {
			return Left(new McApiAuthError('Failed to login to Xbox Live.'));
		}

		const respBody = (await resp.json()) as XBLTokenResponse;

		const userhash = respBody.DisplayClaims.xui.find((u) => u.uhs)?.uhs;
		if (!userhash) {
			return Left(new McApiAuthError('XBL Token response does not contain valid userhash.'));
		}

		return Right({
			token: respBody.Token,
			userhash: userhash,
		});
	}

	static async authXSTS(xblToken: string) {
		const resp = await fetch('https://xsts.auth.xboxlive.com/xsts/authorize', {
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				Properties: {
					SandboxId: 'RETAIL',
					UserTokens: [xblToken],
				},
				RelyingParty: 'rp://api.minecraftservices.com/',
				TokenType: 'JWT',
			}),
		});

		if (!resp.ok) {
			return Left(new McApiAuthError('Failed to login to XSTS.'));
		}

		const respBody = (await resp.json()) as XBLTokenResponse;

		const userhash = respBody.DisplayClaims.xui.find((u) => u.uhs)?.uhs;
		if (!userhash) {
			return Left(new McApiAuthError('XBL Token response does not contain valid userhash.'));
		}

		return Right({
			token: respBody.Token,
			userhash: userhash,
		});
	}

	static async authMcServices(xstsToken: string, userhash: string) {
		const resp = await fetch(
			'https://api.minecraftservices.com/authentication/login_with_xbox',
			{
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					identityToken: `XBL3.0 x=${userhash};${xstsToken}`,
				}),
			},
		);

		if (!resp.ok) {
			return Left(new McApiAuthError('Failed to login to Minecraft services.'));
		}

		const respBody = (await resp.json()) as MinecraftTokenResponse;

		return Right({
			token: respBody.access_token,
		});
	}

	static async hasClaims(mcApiToken: string) {
		const resp = await fetch('https://api.minecraftservices.com/entitlements/mcstore', {
			headers: {
				Authorization: `Bearer ${mcApiToken}`,
			},
		});

		if (!resp.ok) {
			return Left(new McApiAuthError('Failed to fetch Minecraft claims.'));
		}

		const respBody = (await resp.json()) as MinecraftClaimsResponse;

		const hasProduct = respBody.items.some((item) => item.name === 'product_minecraft');
		const hasGame = respBody.items.some((item) => item.name === 'game_minecraft');

		return Right(hasProduct && hasGame);
	}

	static async getProfile(mcApiToken: string) {
		const resp = await fetch('https://api.minecraftservices.com/minecraft/profile', {
			headers: {
				Authorization: `Bearer ${mcApiToken}`,
			},
		});

		if (!resp.ok) {
			return Left(new McApiAuthError('Failed to fetch Minecraft profile.'));
		}

		const respBody = (await resp.json()) as MinecraftProfileResponse;

		const activeSkin = respBody.skins.find((skin) => skin.state === 'ACTIVE');
		const activeCape = respBody.capes.find((cape) => cape.state === 'ACTIVE');

		return Right({
			uuid: respBody.id,
			username: respBody.name,
			skin: activeSkin
				? {
						url: activeSkin.url,
						variant:
							activeSkin.variant === 'CLASSIC'
								? SkinTextureVariant.CLASSIC
								: SkinTextureVariant.SLIM,
					}
				: null,
			cape: activeCape
				? {
						url: activeCape.url,
						alias: activeCape.alias,
					}
				: null,
		});
	}
}
