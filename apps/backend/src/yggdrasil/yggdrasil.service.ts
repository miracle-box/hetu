import { createPrivateKey, createSign } from 'node:crypto';
import { Texture } from '~backend/textures/texture.entities';
import {
	YggProfile,
	YggProfileDigest,
	YggProfileTextures,
	YggTexture,
} from '~backend/yggdrasil/yggdrasil.entities';
import { StorageService } from '~backend/services/storage';
import { Profile } from '~backend/profiles/profile.entities';
import { Session } from '~backend/auth/auth.entities';
import { Config } from '~backend/shared/config';

export abstract class YggdrasilService {
	static getUnsignedUUID(uuid: string): string {
		return uuid.replaceAll('-', '');
	}

	static generateClientToken(clientToken?: string): string {
		return clientToken ?? this.getUnsignedUUID(crypto.randomUUID());
	}

	static getYggdrasilTexture(texture: Pick<Texture, 'hash' | 'type'>): YggTexture {
		return {
			// [TODO] This should really be put in TexturesService or something...
			url: StorageService.getPublicUrl(texture.hash),
			...(texture.type !== 'cape'
				? { metadata: { model: texture.type === 'skin_slim' ? 'slim' : 'default' } }
				: {}),
		};
	}

	static getYggdrasilProfileDigest(profile: Pick<Profile, 'id' | 'name'>) {
		return {
			id: this.getUnsignedUUID(profile.id),
			name: profile.name,
		};
	}

	static getYggdrasilProfile(
		profile: YggProfileDigest & {
			skinTexture: Pick<Texture, 'hash' | 'type'> | null;
			capeTexture: Pick<Texture, 'hash' | 'type'> | null;
		},
		signed: boolean = false,
	): YggProfile {
		const skinTexture = profile.skinTexture
			? this.getYggdrasilTexture(profile.skinTexture)
			: null;
		const capeTexture = profile.capeTexture
			? this.getYggdrasilTexture(profile.capeTexture)
			: null;
		const yggTextures: YggProfileTextures = {
			timestamp: new Date().getTime(),
			profileId: this.getUnsignedUUID(profile.id),
			profileName: profile.name,
			textures: {
				...(skinTexture ? { SKIN: skinTexture } : {}),
				...(capeTexture ? { CAPE: capeTexture } : {}),
			},
		};
		const encodedTextures = btoa(JSON.stringify(yggTextures));

		const properties: YggProfile['properties'] = [
			{
				name: 'textures',
				value: encodedTextures,
				signature: signed
					? this.sign(Config.app.yggdrasil.profileKeypair.private, encodedTextures)
					: undefined,
			},
			{
				// [TODO] Configure uploadable textures in profile options
				name: 'uploadableTextures',
				value: 'skin,cape',
			},
		];

		return {
			id: this.getUnsignedUUID(profile.id),
			name: profile.name,
			properties,
		};
	}

	static sign(pem: string, data: string): string {
		const key = createPrivateKey({
			key: pem,
			format: 'pem',
		});

		const signer = createSign('RSA-SHA1');
		signer.update(data);
		return signer.sign(key, 'base64');
	}

	static parseAccessToken(accessToken: string): {
		sessionId: string;
		sessionToken: string;
	} | null {
		const [sessionId, sessionToken] = accessToken.split(':');
		if (!sessionId || !sessionToken) return null;

		return {
			sessionId,
			sessionToken,
		};
	}

	static createAccessToken(session: Session): string {
		return `${session.id}:${session.token}`;
	}
}
