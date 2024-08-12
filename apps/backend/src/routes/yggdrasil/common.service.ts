import { textureTable } from '~/db/schema/texture';
import { ProfilesService } from '../profiles/profiles.service';
import { Profile, ProfileTextures, Texture } from './common';
import { eq } from 'drizzle-orm';
import { db } from '~/db/connection';
import { TexturesService } from '../textures/textures.service';

export abstract class CommonService {
	static async getYggdrasilTexture(id: string): Promise<Texture | null> {
		const texture = await TexturesService.getTextureById(id);
		if (!texture) return null;

		return {
			url: TexturesService.getTextureUrlByHash(texture.hash),
			...(texture.type !== 'cape'
				? { metadata: { model: texture.type === 'skin_slim' ? 'slim' : 'default' } }
				: {}),
		};
	}

	static async getProfileByName(name: string): Promise<Profile | null> {
		const profile = await ProfilesService.getProfileByName(name);
		if (!profile) return null;

		const skinTexture = profile.skinTextureId
			? await this.getYggdrasilTexture(profile.skinTextureId)
			: null;

		const capeTexture = profile.capeTextureId
			? await this.getYggdrasilTexture(profile.capeTextureId)
			: null;

		const yggTextures: ProfileTextures = {
			timestamp: new Date().getTime(),
			profileId: profile.id.replaceAll('-', ''),
			profileName: profile.name,
			textures: {
				...(skinTexture ? { SKIN: skinTexture } : {}),
				...(capeTexture ? { CAPE: capeTexture } : {}),
			},
		};

		return {
			id: profile.id,
			name: profile.name,
			properties: [
				{
					name: 'textures',
					value: JSON.stringify(yggTextures),
					// [TODO] Support signature in future
				},
			],
		};
	}
}
