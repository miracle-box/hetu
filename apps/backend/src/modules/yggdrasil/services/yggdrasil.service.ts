import type { Session } from '#modules/auth/auth.entities';
import type { Profile } from '#modules/profiles/profiles.entities';
import type { Texture } from '#modules/textures/textures.entities';

import crypto from 'node:crypto';
import { Config } from '#config';
import { storageService } from '#modules/files/services/storage.service';
import {
	type YggTexture,
	type YggProfileDigest,
	type YggProfile,
	type YggProfileTextures,
} from '#modules/yggdrasil/yggdrasil.entities';

export abstract class YggdrasilService {
	static getUnsignedUUID(uuid: string): string {
		return uuid.replaceAll('-', '');
	}

	static createAccessToken(session: Session): string {
		return `${session.id}:${session.token}`;
	}

	static createClientToken(clientToken?: string): string {
		return clientToken ?? this.getUnsignedUUID(crypto.randomUUID());
	}

	static getYggdrasilTexture(texture: Pick<Texture, 'hash' | 'type'>): YggTexture {
		const urlResult = storageService.getPublicUrl(texture.hash);
		const url = urlResult.caseOf({
			Left: (error) => {
				throw error;
			},
			Right: (url) => url,
		});

		return {
			url,
			...(texture.type !== 'cape'
				? { metadata: { model: texture.type === 'skin_slim' ? 'slim' : 'default' } }
				: {}),
		};
	}

	static mapYggdrasilProfileDigest(profile: Pick<Profile, 'id' | 'name'>): YggProfileDigest {
		return {
			id: profile.id,
			name: profile.name,
		};
	}

	static getYggdrasilProfileDigestWithSkins(
		profile: Pick<Profile, 'id' | 'name'> & {
			skinTexture: Pick<Texture, 'hash' | 'type'> | null;
			capeTexture: Pick<Texture, 'hash' | 'type'> | null;
		},
	) {
		return {
			id: profile.id,
			name: profile.name,
			skinTexture: profile.skinTexture,
			capeTexture: profile.capeTexture,
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
		const key = crypto.createPrivateKey({
			key: pem,
			format: 'pem',
		});

		const signer = crypto.createSign('RSA-SHA1');
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
}
