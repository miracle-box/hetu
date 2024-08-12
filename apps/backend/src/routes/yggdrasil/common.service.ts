import { textureTable } from '~/db/schema/texture';
import { ProfilesService } from '../profiles/profiles.service';
import { YggdrasilProfile, YggdrasilProfileTextures, YggdrasilTexture } from './common';
import { eq } from 'drizzle-orm';
import { db } from '~/db/connection';
import { TexturesService } from '../textures/textures.service';
import { Profile } from '~/models/profile';

export abstract class CommonService {
	static getUnsignedUUID(uuid: string): string {
		return uuid.replaceAll('-', '');
	}

	static async getYggdrasilTexture(id: string): Promise<YggdrasilTexture | null> {
		const texture = await TexturesService.getTextureById(id);
		if (!texture) return null;

		return {
			url: TexturesService.getTextureUrlByHash(texture.hash),
			...(texture.type !== 'cape'
				? { metadata: { model: texture.type === 'skin_slim' ? 'slim' : 'default' } }
				: {}),
		};
	}

	static async profileToYggdrasil(
		profile: Profile,
		partial: boolean = false,
	): Promise<YggdrasilProfile> {
		const partialProfile = {
			id: this.getUnsignedUUID(profile.id),
			name: profile.name,
		};
		if (partial) return partialProfile;

		const skinTexture = profile.skinTextureId
			? await this.getYggdrasilTexture(profile.skinTextureId)
			: null;

		const capeTexture = profile.capeTextureId
			? await this.getYggdrasilTexture(profile.capeTextureId)
			: null;

		const yggTextures: YggdrasilProfileTextures = {
			timestamp: new Date().getTime(),
			profileId: this.getUnsignedUUID(profile.id),
			profileName: profile.name,
			textures: {
				...(skinTexture ? { SKIN: skinTexture } : {}),
				...(capeTexture ? { CAPE: capeTexture } : {}),
			},
		};

		return {
			...partialProfile,
			properties: [
				{
					name: 'textures',
					value: btoa(JSON.stringify(yggTextures)),
					// [TODO] Support signature in future
				},
			],
		};
	}

	/**
	 * Get complete profile by player name
	 * @param name player name
	 * @returns Yggdrasil profile if exists
	 */
	static async getProfileByName(name: string): Promise<YggdrasilProfile | null> {
		const profile = await ProfilesService.getProfileByName(name);
		if (!profile) return null;

		return this.profileToYggdrasil(profile);
	}

	/**
	 * Get all (partial) profiles for a user
	 * @param userId user id
	 * @returns All Yggdrasil profiles for the user
	 */
	static async getProfilesByUser(userId: string): Promise<YggdrasilProfile[]> {
		return ProfilesService.getProfilesByUser(userId).then((profiles) =>
			Promise.all(profiles.map((profile) => this.profileToYggdrasil(profile, true))),
		);
	}
}
